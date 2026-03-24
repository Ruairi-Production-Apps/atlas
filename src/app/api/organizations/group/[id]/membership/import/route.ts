import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

interface CsvRow {
    parent_email: string
    parent_first_name: string
    parent_last_name: string
    parent_2_email?: string
    parent_2_first_name?: string
    parent_2_last_name?: string
    child_1_first_name?: string
    child_1_last_name?: string
    child_1_dob?: string
    child_2_first_name?: string
    child_2_last_name?: string
    child_2_dob?: string
    child_3_first_name?: string
    child_3_last_name?: string
    child_3_dob?: string
    total_fee: string
    amount_paid: string
}

interface ImportResult {
    row: number
    parentEmail: string
    status: 'imported' | 'skipped' | 'error'
    message?: string
}

// POST - Import members from CSV data
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: groupId } = await params
    const supabase = await createClient()

    // 1. Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: role } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .eq('scope_id', groupId)
        .eq('scope_type', 'group')
        .in('role', ['group_leader', 'scouter'])
        .maybeSingle()

    if (!role) {
        const { data: isSysadmin } = await supabase.rpc('is_sysadmin', { user_id: user.id })
        if (!isSysadmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
    }

    const body = await request.json()
    const rows: CsvRow[] = body.rows

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
        return NextResponse.json({ error: 'No rows provided' }, { status: 400 })
    }

    // 2. Get or create membership config for this group
    const adminClient = createAdminClient()

    let { data: config } = await adminClient
        .from('membership_configs')
        .select('id')
        .eq('group_id', groupId)
        .maybeSingle()

    if (!config) {
        // Create a minimal config for this group
        const { data: newConfig, error: configError } = await adminClient
            .from('membership_configs')
            .insert({
                group_id: groupId,
                intro_text: '',
                published: false,
            })
            .select('id')
            .single()

        if (configError || !newConfig) {
            return NextResponse.json({
                error: 'Failed to create membership config: ' + (configError?.message || 'Unknown error')
            }, { status: 500 })
        }
        config = newConfig
    }

    // 3. Get or create membership form for this group (needed for form_id FK)
    let { data: form } = await adminClient
        .from('membership_forms')
        .select('id')
        .eq('group_id', groupId)
        .maybeSingle()

    if (!form) {
        const { data: newForm, error: formError } = await adminClient
            .from('membership_forms')
            .insert({
                group_id: groupId,
                title: 'CSV Import',
                description: 'Imported via CSV upload',
                published: false,
            })
            .select('id')
            .single()

        if (formError || !newForm) {
            return NextResponse.json({
                error: 'Failed to create membership form: ' + (formError?.message || 'Unknown error')
            }, { status: 500 })
        }
        form = newForm
    }

    // 4. Process each row
    const results: ImportResult[] = []

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        const rowNum = i + 1

        try {
            // Validate required fields
            const email = row.parent_email?.trim().toLowerCase()
            const firstName = row.parent_first_name?.trim()
            const lastName = row.parent_last_name?.trim()
            const fullName = [firstName, lastName].filter(Boolean).join(' ')

            if (!email) {
                results.push({ row: rowNum, parentEmail: email || '', status: 'skipped', message: 'Missing email' })
                continue
            }
            if (!firstName) {
                results.push({ row: rowNum, parentEmail: email, status: 'skipped', message: 'Missing first name' })
                continue
            }
            if (!lastName) {
                results.push({ row: rowNum, parentEmail: email, status: 'skipped', message: 'Missing last name' })
                continue
            }

            // Collect children
            const children: { first_name: string; last_name: string; name: string; dob: string }[] = []
            for (let c = 1; c <= 3; c++) {
                const childFirst = (row as any)[`child_${c}_first_name`]?.trim()
                const childLast = (row as any)[`child_${c}_last_name`]?.trim()
                const dob = (row as any)[`child_${c}_dob`]?.trim()
                if (childFirst) {
                    children.push({
                        first_name: childFirst,
                        last_name: childLast || '',
                        name: [childFirst, childLast].filter(Boolean).join(' '),
                        dob: dob || '',
                    })
                }
            }

            if (children.length === 0) {
                results.push({ row: rowNum, parentEmail: email, status: 'skipped', message: 'No children specified' })
                continue
            }

            const cleanNumeric = (val: string) => {
                if (!val) return 0
                // Remove whitespace, currency symbols, and commas
                const cleaned = val.toString().replace(/[^\d.-]/g, '')
                return parseFloat(cleaned) || 0
            }

            const totalFee = cleanNumeric(row.total_fee)
            const amountPaid = cleanNumeric(row.amount_paid)

            // a) Find or create user
            let userId: string

            // Look up existing user by email via profiles table
            const { data: existingProfile } = await adminClient
                .from('profiles')
                .select('id')
                .eq('email', email)
                .maybeSingle()

            if (existingProfile) {
                userId = existingProfile.id
            } else {
                // Create new user (pre-confirmed, no invite email)
                const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
                    email,
                    email_confirm: true,
                    user_metadata: { full_name: fullName },
                })

                if (createError || !newUser?.user) {
                    results.push({
                        row: rowNum,
                        parentEmail: email,
                        status: 'error',
                        message: `Failed to create user: ${createError?.message || 'Unknown error'}`
                    })
                    continue
                }
                userId = newUser.user.id
            }

            // b) Update profile name if needed
            await adminClient
                .from('profiles')
                .upsert({
                    id: userId,
                    email,
                    first_name: firstName,
                    last_name: lastName,
                }, { onConflict: 'id' })

            // c) Assign 'parent' role for this group (if not already exists)
            await adminClient
                .from('user_roles')
                .upsert({
                    user_id: userId,
                    role: 'parent',
                    scope_type: 'group',
                    scope_id: groupId,
                }, { onConflict: 'user_id,role,scope_type,scope_id' })

            // d) Create membership registration
            const paymentStatus = amountPaid >= totalFee && totalFee > 0
                ? 'paid'
                : amountPaid > 0
                    ? 'active'
                    : 'pending'

            const { data: registration, error: regError } = await adminClient
                .from('membership_registrations')
                .insert({
                    config_id: config.id,
                    parent_id: userId,
                    form_id: form.id,
                    submission_data: {
                        parent_first_name: firstName,
                        parent_last_name: lastName,
                        parent_name: fullName,
                        parent_email: email,
                        ...(row.parent_2_email?.trim() ? {
                            parent_2_first_name: row.parent_2_first_name?.trim() || '',
                            parent_2_last_name: row.parent_2_last_name?.trim() || '',
                            parent_2_name: [row.parent_2_first_name?.trim(), row.parent_2_last_name?.trim()].filter(Boolean).join(' '),
                            parent_2_email: row.parent_2_email.trim().toLowerCase(),
                        } : {}),
                        children,
                        import_source: 'csv',
                    },
                    total_fee: totalFee,
                    discount_applied: 0,
                    net_fee: totalFee,
                    payment_method: 'full',
                    payment_status: paymentStatus,
                })
                .select('id')
                .single()

            if (regError || !registration) {
                results.push({
                    row: rowNum,
                    parentEmail: email,
                    status: 'error',
                    message: `Failed to create registration: ${regError?.message || 'Unknown error'}`
                })
                continue
            }

            // e) Create payment schedule entries
            const now = new Date().toISOString()

            if (amountPaid > 0) {
                await adminClient
                    .from('membership_payment_schedules')
                    .insert({
                        registration_id: registration.id,
                        due_date: now.split('T')[0],
                        amount: amountPaid,
                        status: 'paid',
                        paid_at: now,
                        payment_method_type: 'csv_import',
                        notes: 'Imported from CSV - amount already paid',
                    })
            }

            const balance = totalFee - amountPaid
            if (balance > 0) {
                await adminClient
                    .from('membership_payment_schedules')
                    .insert({
                        registration_id: registration.id,
                        due_date: now.split('T')[0],
                        amount: balance,
                        status: 'pending',
                        notes: 'Imported from CSV - outstanding balance',
                    })
            }

            results.push({ row: rowNum, parentEmail: email, status: 'imported' })

        } catch (err: any) {
            results.push({
                row: rowNum,
                parentEmail: row.parent_email || '',
                status: 'error',
                message: err.message || 'Unknown error',
            })
        }
    }

    const imported = results.filter(r => r.status === 'imported').length
    const skipped = results.filter(r => r.status === 'skipped').length
    const errors = results.filter(r => r.status === 'error').length

    return NextResponse.json({
        summary: { imported, skipped, errors, total: rows.length },
        results,
    })
}
