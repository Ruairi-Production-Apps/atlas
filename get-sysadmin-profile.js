const { createClient } = require('@supabase/supabase-js')

const URL = 'https://kjezhjbxcfgmueqmdjiy.supabase.co'
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqZXpoamJ4Y2ZnbXVlcW1kaml5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDg3ODExMCwiZXhwIjoyMDgwNDU0MTEwfQ.DdRDnB45HNg4g-ntmcuhIbmefgJ0uNmsLN40xkoxixY'

async function getProfile() {
    const supabase = createClient(URL, SERVICE_KEY)

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', '6d63d9e6-316c-4b29-bf6b-7ff03b623328')
        .single()

    if (error) {
        console.error('Error fetching profile:', error)
        return
    }

    console.log('Profile found:', JSON.stringify(data, null, 2))
}

getProfile()
