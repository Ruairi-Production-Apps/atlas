import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// POST - Stop impersonation
export async function POST() {
    const cookieStore = await cookies()
    
    // Remove impersonation cookies
    cookieStore.delete('impersonate_admin_id')
    cookieStore.delete('impersonate_user_id')

    return NextResponse.json({
        message: 'Impersonation stopped',
    })
}

