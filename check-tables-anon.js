const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const env = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8')
const getEnv = (key) => {
    const match = env.match(new RegExp(`${key}=(.*)`))
    return match ? match[1].trim() : null
}

const URL = getEnv('NEXT_PUBLIC_SUPABASE_URL')
const KEY = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

async function checkTable() {
    console.log(`Using URL: ${URL}`)
    const supabase = createClient(URL, KEY)

    console.log('Checking news_posts with ANON_KEY...');
    const { data: news, error: newsError } = await supabase
        .from('news_posts')
        .select('id')
        .limit(1)

    if (newsError) {
        console.error('Error selecting from news_posts:', newsError)
    } else {
        console.log('Successfully selected from news_posts.')
    }
}

checkTable()
