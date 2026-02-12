const { createClient } = require('@supabase/supabase-js')

const URL = 'https://kjezhjbxcfgmueqmdjiy.supabase.co'
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqZXpoamJ4Y2ZnbXVlcW1kaml5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImhhdCI6MTc2NDg3ODExMCwiZXhwIjoyMDgwNDU0MTEwfQ.DdRDnB45HNg4g-ntmcuhIbmefgJ0uNmsLN40xkoxixY'

const supabase = createClient(URL, SERVICE_KEY)

async function debug() {
    const userId = '30d04492-d7dc-4fe8-8686-96b21d006170' // kilcoonacubs@gmail.com

    console.log('Checking notifications for user:', userId)

    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching notifications:', error)
        return
    }

    console.log('Found', data.length, 'notifications.')
    data.forEach(n => {
        console.log(`- [${n.created_at}] ${n.title}: ${n.message} (Read: ${n.is_read}, Archived: ${n.is_archived})`)
    })
}

debug()
