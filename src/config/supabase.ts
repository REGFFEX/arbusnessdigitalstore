import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl as string, supabaseAnonKey as string)

/**
 * Utility to retry a Supabase query 3 times in case of transient network errors.
 */
export async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
    try {
        return await fn()
    } catch (error: any) {
        if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, delay))
            return withRetry(fn, retries - 1, delay * 2)
        }
        throw error
    }
}
