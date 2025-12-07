
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { join } from 'path'

// Load environment variables
dotenv.config({ path: join(process.cwd(), '.env.local') })

console.log('Connecting to:', process.env.NEXT_PUBLIC_SUPABASE_URL)

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // Use Anon Key to simulate browser
)

async function verify() {
    console.log('Checking knowledgebase_articles table...')

    // Check if column exists by trying to select it
    const { data, error } = await supabase
        .from('knowledgebase_articles')
        .select('description')
        .limit(1)

    if (error) {
        console.error('Error selecting description:', error)
    } else {
        console.log('Success! Column "description" exists and is accessible via API.')
    }
}

verify()
