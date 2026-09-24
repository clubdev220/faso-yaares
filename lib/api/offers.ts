import type { RealtimeChannel } from '@supabase/supabase-js'
import type { AnySupabaseClient } from '@/lib/supabase/types'
import { uniqueChannelName } from '@/lib/api/messaging'
import type { Offer } from '@/types'

export async function getOfferThread(
  supabase: AnySupabaseClient,
  listingId: string,
  buyerId: string,
  sellerId: string
): Promise<Offer[]> {
  const { data, error } = await supabase
    .from('offers')
    .select('*')
    .eq('listing_id', listingId)
    .eq('buyer_id', buyerId)
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []).map(normalizeOffer)
}

// `amount` est un numeric Postgres : PostgREST peut le renvoyer en chaîne.
function normalizeOffer(row: Offer): Offer {
  return { ...row, amount: Number(row.amount) }
}

export async function createOffer(
  supabase: AnySupabaseClient,
  listingId: string,
  amount: number
): Promise<Offer> {
  const { data, error } = await supabase.rpc('create_offer', {
    p_listing_id: listingId,
    p_amount: amount,
  })
  if (error) throw error
  return normalizeOffer(data as Offer)
}

export async function respondToOffer(
  supabase: AnySupabaseClient,
  offerId: string,
  action: 'accept' | 'reject' | 'counter',
  counterAmount?: number
): Promise<Offer> {
  const { data, error } = await supabase.rpc('respond_to_offer', {
    p_offer_id: offerId,
    p_action: action,
    p_counter_amount: action === 'counter' ? counterAmount : null,
  })
  if (error) throw error
  return normalizeOffer(data as Offer)
}

export function subscribeToOffers(
  supabase: AnySupabaseClient,
  listingId: string,
  onChange: (offer: Offer) => void
): RealtimeChannel {
  return supabase
    .channel(uniqueChannelName(`offers-${listingId}`))
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'offers', filter: `listing_id=eq.${listingId}` },
      (payload) => onChange(normalizeOffer(payload.new as Offer))
    )
    .subscribe()
}
