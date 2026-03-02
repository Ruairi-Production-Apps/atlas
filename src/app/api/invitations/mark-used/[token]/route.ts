import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params
        const supabase = await createClient()

        // Mark the invitation link as used
        const { error } = await supabase
            .from('invitation_links')
            .update({ used_at: new Date().toISOString() })
            .eq('token', token)

        if (error) {
            console.error('Error marking invitation as used:', error)
            return NextResponse.json(
                { error: 'Failed to mark invitation as used' },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Mark invitation as used error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
