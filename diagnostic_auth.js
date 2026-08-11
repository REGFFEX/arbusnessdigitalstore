
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.argv[2]
const supabaseKey = process.argv[3]

if (!supabaseUrl || !supabaseKey) {
    console.error('Usage: node diagnostic_auth.js <url> <key>')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkAdmins() {
    console.log('--- DIAGNOSTIC START ---')
    console.log('Target URL:', supabaseUrl)

    const { data, error } = await supabase
        .from('admins')
        .select('*')

    if (error) {
        console.error('Error fetching admins table:', error.message)
        console.error('Hint: Check if the table "admins" exists and is readable with the anon key.')
        return
    }

    console.log('Admins found in table:', data.length)
    data.forEach(admin => {
        console.log(`- [${admin.status}] ${admin.email} | Role: ${admin.role} | ID: ${admin.id}`)
    })
    console.log('--- DIAGNOSTIC END ---')
}

checkAdmins()
