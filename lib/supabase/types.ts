import type { SupabaseClient } from '@supabase/supabase-js'

// types/supabase.ts ne décrit ni les vues, ni les RPC, ni les tables
// ajoutées depuis (messages, reviews, offers…) : ces appels passent par un
// client non typé et les résultats sont typés à l'endroit où on les lit.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnySupabaseClient = SupabaseClient<any, any, any>
