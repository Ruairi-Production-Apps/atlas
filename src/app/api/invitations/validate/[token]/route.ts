import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params
        const supabase = await createClient()

        // Fetch the invitation link
        const { data: invitationLink, error } = await supabase
            .from('invitation_links')
            .select('*')
            .eq('token', token)
            .single()

        if (error || !invitationLink) {
            return NextResponse.json(
                { valid: false, error: 'Invalid invitation token' },
                { status: 404 }
            )
        }

        // Check if token has expired
        const now = new Date()
        const expiresAt = new Date(invitationLink.expires_at)
        if (now > expiresAt) {
            return NextResponse.json(
                { valid: false, error: 'Invitation link has expired' },
                { status: 410 }
            )
        }

        // Check if token has already been used
        if (invitationLink.used_at) {
            return NextResponse.json(
                { valid: false, error: 'Invitation link has already been used' },
                { status: 410 }
            )
        }

        // Fetch organization details
        let organizationName = ''
        if (invitationLink.organization_type === 'group') {
            const { data: group } = await supabase
                .from('groups')
                .select('name')
                .eq('id', invitationLink.organization_id)
                .single()
            organizationName = group?.name || ''
        } else if (invitationLink.organization_type === 'county') {
            const { data: county } = await supabase
                .from('counties')
                .select('name')
                .eq('id', invitationLink.organization_id)
                .single()
            organizationName = county?.name || ''
        } else if (invitationLink.organization_type === 'province') {
            const { data: province } = await supabase
                .from('provinces')
                .select('name')
                .eq('id', invitationLink.organization_id)
                .single()
            organizationName = province?.name || ''
        }

        return NextResponse.json({
            valid: true,
            invitation: {
                organizationId: invitationLink.organization_id,
                organizationType: invitationLink.organization_type,
                organizationName,
                role: invitationLink.role,
                sectionIds: invitationLink.section_ids,
                isSectionLead: invitationLink.is_section_lead,
                expiresAt: invitationLink.expires_at
            }
        })

    } catch (error) {
        console.error('Invitation validation error:', error)
        return NextResponse.json(
            { valid: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}
