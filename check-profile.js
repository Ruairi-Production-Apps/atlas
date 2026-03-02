const { createClient } = require('@supabase/supabase-js')

const URL = 'https://kjezhjbxcfgmueqmdjiy.supabase.co'
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqZXpoamJ4Y2ZnbXVlcW1kaml5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4NzgxMTAsImV4cCI6MjA4MDQ1NDExMH0.RDw3TIsQfsLhAlebmpQkHyopQqSonXUV5rd5DmmKfxk'

const supabase = createClient(URL, ANON_KEY)

async function checkProfile() {
    const userId = '30d04492-d7dc-4fe8-8686-96b21d006170' // kilcoonacubs@gmail.com

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

    if (error) {
        console.error('Error fetching profile:', error)
        return
    }

    console.log('Profile found:', data)
}

checkProfile()
