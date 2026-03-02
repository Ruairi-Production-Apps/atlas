const { createClient } = require('@supabase/supabase-js')

const URL = 'https://kjezhjbxcfgmueqmdjiy.supabase.co'
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqZXpoamJ4Y2ZnbXVlcW1kaml5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImhhdCI6MTc2NDg3ODExMCwiZXhwIjoyMDgwNDU0MTEwfQ.DdRDnB45HNg4g-ntmcuhIbmefgJ0uNmsLN40xkoxixY'

async function checkTable() {
    const supabase = createClient(URL, SERVICE_KEY)

    const { data, error } = await supabase
        .from('notifications')
        .select('id')
        .limit(1)

    if (error) {
        console.error('Error selecting from notifications:', error)
    } else {
        console.log('Successfully selected from notifications.')
    }

    // Try to find it in information_schema
    // Since we don't have a direct way to query information_schema via RPC without defining it,
    // we can use a clever trick if postgres_inspect is available, but let's just use a direct query if possible.
    // Actually, let's just try to insert a dummy record and delete it.
}

checkTable()
