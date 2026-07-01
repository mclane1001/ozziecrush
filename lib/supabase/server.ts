import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database'

// Use service role — server-only, never expose to browser
export function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase server env vars')
  return createClient<Database>(url, key, {
    auth: { persistSession: false },
  })
}
