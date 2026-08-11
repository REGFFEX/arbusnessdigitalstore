
import { createClient } from '@supabase/supabase-client'
import fs from 'fs'
import path from 'path'

// Try to find env vars in .env or .env.local
const envPath = path.resolve(process.cwd(), '.env')
const envLocalPath = path.resolve(process.cwd(), '.env.local')

let supabaseUrl = ''
let supabaseAnonKey = ''

function parseEnv(filePath) {
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8')
        content.split('\n').forEach(line => {
            const [key, value] = line.split('=')
            if (key === 'VITE_SUPABASE_URL') supabaseUrl = value.trim()
            if (key === 'VITE_SUPABASE_ANON_KEY') supabaseAnonKey = value.trim()
        })
    }
}

parseEnv(envPath)
parseEnv(envLocalPath)

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase credentials not found in .env or .env.local')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkTables() {
    const { data, error } = await supabase
        .from('download_tokens')
        .select('*', { count: 'exact', head: true })
        .limit(1)

    if (error) {
        console.error('Error selecting from download_tokens:', error)
    } else {
        console.log('download_tokens table exists and is accessible.')
    }
}

checkTables()
