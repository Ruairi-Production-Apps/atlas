import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ type: string; id: string; productId: string; formId: string }> }
) {
    const { formId } = await params

    try {
        const supabase = await createClient()

        const { data: submissions, error } = await supabase
            .from('product_form_submissions')
            .select('*')
            .eq('form_id', formId)
            .order('created_at', { ascending: false })

        if (error) throw error

        return NextResponse.json(submissions)
    } catch (error: any) {
        console.error('[API] Error fetching submissions:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch submissions' },
            { status: 500 }
        )
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ type: string; id: string; productId: string; formId: string }> }
) {
    const { formId } = await params

    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await request.json()

        if (!body.submission_data) {
            return NextResponse.json(
                { error: 'submission_data is required' },
                { status: 400 }
            )
        }

        // Calculate participant counts from submission data
        let youthCount = 0
        let scouterCount = 0
        let adultCount = 0

        if (body.submission_data.participants) {
            youthCount = body.submission_data.participants.filter((p: any) => p.type === 'youth').length
            scouterCount = body.submission_data.participants.filter((p: any) => p.type === 'scouter').length
            adultCount = body.submission_data.participants.filter((p: any) => p.type === 'adult').length
        }

        const insertData = {
            form_id: formId,
            user_id: user.id,
            submission_data: body.submission_data,
            selected_date: body.selected_date || null,
            participant_count_youth: youthCount,
            participant_count_scouters: scouterCount,
            participant_count_adults: adultCount,
            payment_status: body.requires_payment ? 'pending' : 'none',
            total_amount: body.total_amount || null,
            submission_status: 'pending',
        }

        const { data: submission, error } = await supabase
            .from('product_form_submissions')
            .insert(insertData)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json(submission, { status: 201 })
    } catch (error: any) {
        console.error('[API] Error creating submission:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to create submission' },
            { status: 500 }
        )
    }
}
