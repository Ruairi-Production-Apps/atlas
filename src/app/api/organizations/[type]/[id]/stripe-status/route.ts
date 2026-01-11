import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ type: string; id: string }> }
) {
    try {
        const { type, id } = await params
        const supabase = await createClient()

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Fetch organization to check Stripe status
        let organization

        if (type === 'group') {
            const { data } = await supabase
                .from('groups')
                .select('stripe_account_id')
                .eq('id', id)
                .single()
            organization = data
        } else if (type === 'county') {
            const { data } = await supabase
                .from('counties')
                .select('stripe_account_id')
                .eq('id', id)
                .single()
            organization = data
        } else if (type === 'province') {
            const { data } = await supabase
                .from('provinces')
                .select('stripe_account_id')
                .eq('id', id)
                .single()
            organization = data
        } else if (type === 'team') {
            const { data } = await supabase
                .from('teams')
                .select('stripe_account_id')
                .eq('id', id)
                .single()
            organization = data
        }

        if (!organization) {
            return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
        }

        // Check if Stripe is connected
        const connected = !!organization.stripe_account_id

        return NextResponse.json({
            connected,
            stripe_account_id: organization.stripe_account_id || null
        })

    } catch (error) {
        console.error('Stripe status check error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
