const { createClient } = require('@supabase/supabase-js')

const URL = 'https://kjezhjbxcfgmueqmdjiy.supabase.co'
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqZXpoamJ4Y2ZnbXVlcW1kaml5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDg3ODExMCwiZXhwIjoyMDgwNDU0MTEwfQ.DdRDnB45HNg4g-ntmcuhIbmefgJ0uNmsLN40xkoxixY'

async function listSysadmins() {
    const supabase = createClient(URL, SERVICE_KEY)

    const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('role', 'sysadmin')

    if (error) {
        console.error('Error fetching sysadmins:', error)
        return
    }

    console.log('Sysadmins found:', JSON.stringify(data, null, 2))
}

listSysadmins()
