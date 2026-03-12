const { createClient } = require('@supabase/supabase-js')

const URL = 'https://kjezhjbxcfgmueqmdjiy.supabase.co'
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqZXpoamJ4Y2ZnbXVlcW1kaml5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImhhdCI6MTc2NDg3ODExMCwiZXhwIjoyMDgwNDU0MTEwfQ.DdRDnB45HNg4g-ntmcuhIbmefgJ0uNmsLN40xkoxixY'

async function checkTable() {
    const supabase = createClient(URL, SERVICE_KEY)

    console.log('Checking news_posts...');
    const { data: news, error: newsError } = await supabase
        .from('news_posts')
        .select('id')
        .limit(1)

    if (newsError) {
        console.error('Error selecting from news_posts:', newsError)
    } else {
        console.log('Successfully selected from news_posts.')
    }

    console.log('Checking events...');
    const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('id')
        .limit(1)

    if (eventsError) {
        console.error('Error selecting from events:', eventsError)
    } else {
        console.log('Successfully selected from events.')
    }
    
    console.log('Checking site_settings...');
    const { data: settings, error: settingsError } = await supabase
        .from('site_settings')
        .select('id')
        .limit(1)

    if (settingsError) {
        console.error('Error selecting from site_settings:', settingsError)
    } else {
        console.log('Successfully selected from site_settings.')
    }
}

checkTable()
