import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

if (!supabaseUrl || !supabaseAnonKey) {
  // Soft warn in dev; allows app to run with mocks if not configured yet
  if (import.meta.env.DEV) {
    console.warn('Supabase env vars missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local')
  }
}

export const supabase = createClient(supabaseUrl || 'http://localhost:54321', supabaseAnonKey || 'anon-key')

export default supabase