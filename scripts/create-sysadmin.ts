/**
 * One-time script to create a sysadmin user
 * Run with: npx tsx scripts/create-sysadmin.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing required environment variables:')
    console.error('  NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
    console.error('  SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗')
    process.exit(1)
}

const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
})

async function createSysadmin() {
    const email = 'admin@scout-hub.local'
    const password = 'admin123'
    const fullName = 'System Administrator'

    console.log('Creating sysadmin user...')
    console.log(`  Email: ${email}`)
    console.log(`  Password: ${password}`)

    // Create user
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
            full_name: fullName,
        },
    })

    if (authError) {
        console.error('Error creating user:', authError.message)
        process.exit(1)
    }

    if (!authData.user) {
        console.error('Failed to create user')
        process.exit(1)
    }

    console.log('✓ User created:', authData.user.id)

    // Create profile
    const { error: profileError } = await adminClient
        .from('profiles')
        .upsert({
            id: authData.user.id,
            full_name: fullName,
            email: email,
        })

    if (profileError) {
        console.error('Error creating profile:', profileError.message)
        // Continue anyway
    } else {
        console.log('✓ Profile created')
    }

    // Create sysadmin role
    const { error: roleError } = await adminClient.from('user_roles').insert({
        user_id: authData.user.id,
        role: 'sysadmin',
        scope_type: 'system',
        scope_id: null,
    })

    if (roleError) {
        console.error('Error creating role:', roleError.message)
        process.exit(1)
    }

    console.log('✓ Sysadmin role assigned')
    console.log('\n✅ Sysadmin user created successfully!')
    console.log(`\nLogin credentials:`)
    console.log(`  Email: ${email}`)
    console.log(`  Password: ${password}`)
}

createSysadmin().catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
})

