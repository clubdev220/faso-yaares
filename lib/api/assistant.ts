import type { AnySupabaseClient } from '@/lib/supabase/types'
import { LISTING_SELLER_EMBED } from '@/lib/api/select'
import type { Listing } from '@/types'

export interface AssistantTurn {
  role: 'user' | 'assistant'
  content: string
}

export class AssistantQuotaError extends Error {
  constructor() {
    super('quota_exceeded')
  }
}

export async function askAssistant(
  messages: AssistantTurn[],
  deviceId: string
): Promise<{ reply: string; listingIds: string[] }> {
  const res = await fetch('/api/assistant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, deviceId }),
  })
  if (res.status === 429) throw new AssistantQuotaError()
  if (!res.ok) throw new Error('assistant_unavailable')

  const data = (await res.json()) as { reply?: string; listing_ids?: string[] }
  return { reply: data.reply ?? '', listingIds: data.listing_ids ?? [] }
}

// Annonces actives seulement, dans l'ordre donné par l'assistant.
export async function getListingsByIds(supabase: AnySupabaseClient, ids: string[]): Promise<Listing[]> {
  if (ids.length === 0) return []
  const { data, error } = await supabase
    .from('listings')
    .select(
      `*, category:categories(id,name,slug,icon,color), images:listing_images(id,url,thumbnail_url,display_order), ${LISTING_SELLER_EMBED}`
    )
    .in('id', ids)
    .eq('status', 'active')
  if (error) throw error
  const byId = new Map(((data ?? []) as Listing[]).map((l) => [l.id, l]))
  return ids.map((id) => byId.get(id)).filter((l): l is Listing => Boolean(l))
}
