import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
            email,
            firstName,
            lastName,
            organizationId,
            organizationType,
            role,
            sectionIds,
            isSectionLead
        } = body

        if (!email || !organizationId || !organizationType || !role) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Create a pending invitation record
        const { data: invitation, error: inviteError } = await supabase
            .from('pending_invitations')
            .insert({
                email: email.toLowerCase(),
                first_name: firstName,
                last_name: lastName,
                organization_type: organizationType,
                organization_id: organizationId,
                role,
                section_ids: sectionIds || null,
                is_section_lead: isSectionLead || false,
                invited_by: user.id
            })
            .select()
            .single()

        if (inviteError) {
            console.error('Error creating invitation:', inviteError)
            return NextResponse.json(
                { error: 'Failed to create invitation' },
                { status: 500 }
            )
        }

        // Use Supabase Auth's invite user functionality
        // This sends an email with a magic link to set up their account
        const { data: invitedUser, error: authInviteError } = await supabase.auth.admin.inviteUserByEmail(
            email,
            {
                data: {
                    first_name: firstName,
                    last_name: lastName,
                    organization_id: organizationId,
                    organization_type: organizationType,
                    role,
                    section_ids: sectionIds,
                    is_section_lead: isSectionLead,
                    invitation_id: invitation.id
                }
            }
        )

        if (authInviteError) {
            console.error('Error sending invitation:', authInviteError)
            return NextResponse.json(
                { error: 'Failed to send invitation email' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            invitationId: invitation.id,
            message: 'Invitation sent successfully'
        })

    } catch (error) {
        console.error('Invitation creation error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
