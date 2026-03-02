import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { randomBytes } from 'crypto'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Check if user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const {
            organizationId,
            organizationType,
            role,
            sectionIds,
            isSectionLead
        } = body

        if (!organizationId || !organizationType || !role) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Generate a unique token
        const token = randomBytes(32).toString('hex')

        // Set expiry to 7 days from now
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 7)

        // Create invitation link record
        const { data: invitationLink, error: linkError } = await supabase
            .from('invitation_links')
            .insert({
                organization_type: organizationType,
                organization_id: organizationId,
                role,
                section_ids: sectionIds || null,
                is_section_lead: isSectionLead || false,
                token,
                expires_at: expiresAt.toISOString(),
                created_by: user.id
            })
            .select()
            .single()

        if (linkError) {
            console.error('Error creating invitation link:', linkError)
            return NextResponse.json(
                { error: 'Failed to create invitation link' },
                { status: 500 }
            )
        }

        // Generate the invitation URL
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
        const invitationUrl = `${baseUrl}/signup?invite=${token}`

        return NextResponse.json({
            success: true,
            invitationUrl,
            expiresAt: expiresAt.toISOString(),
            token
        })

    } catch (error) {
        console.error('Invitation link generation error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
