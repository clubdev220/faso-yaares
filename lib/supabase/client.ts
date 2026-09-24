import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'
import type { AnySupabaseClient } from '@/lib/supabase/types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Pour les tables, vues et RPC absentes de types/supabase.ts.
export function createUntypedClient(): AnySupabaseClient {
  return createClient() as unknown as AnySupabaseClient
}
