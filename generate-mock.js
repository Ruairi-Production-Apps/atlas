const { createClient } = require('@supabase/supabase-js')

const URL = 'https://kjezhjbxcfgmueqmdjiy.supabase.co'
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqZXpoamJ4Y2ZnbXVlcW1kaml5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4NzgxMTAsImV4cCI6MjA4MDQ1NDExMH0.RDw3TIsQfsLhAlebmpQkHyopQqSonXUV5rd5DmmKfxk'
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqZXpoamJ4Y2ZnbXVlcW1kaml5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImhhdCI6MTc2NDg3ODExMCwiZXhwIjoyMDgwNDU0MTEwfQ.DdRDnB45HNg4g-ntmcuhIbmefgJ0uNmsLN40xkoxixY'

async function tryWithKey(name, key) {
    console.log(`--- Testing with ${name} ---`)
    const supabase = createClient(URL, key)
    const { data: profiles, error: pError } = await supabase.from('profiles').select('id').limit(1)
    if (pError) {
        console.error(`${name} Profiles error:`, pError.message)
    } else {
        console.log(`${name} Profiles: Success!`)

        const email = 'kilcoonacubs@gmail.com'
        const { data: user } = await supabase.from('profiles').select('id').eq('email', email).single()

        if (user) {
            console.log(`User found: ${user.id}. Attempting notification...`)
            const { error: nError } = await supabase.from('notifications').insert([{
                user_id: user.id,
                type: 'test_notification',
                title: 'System Test',
                message: 'This is a mock notification to test the new features!',
                action_url: '/dashboard'
            }])
            if (nError) console.error(`${name} Notification error:`, nError.message)
            else console.log(`${name} Notification: SUCCESS!`)
        } else {
            console.log(`User ${email} not found in profiles.`)
        }
    }
}

async function run() {
    await tryWithKey('ANON_KEY', ANON_KEY)
    await tryWithKey('SERVICE_KEY', SERVICE_KEY)
}

run()
