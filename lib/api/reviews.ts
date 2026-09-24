import type { AnySupabaseClient } from '@/lib/supabase/types'
import { PUBLIC_PROFILE_COLUMNS } from '@/lib/api/select'
import type { Review } from '@/types'

export async function getSellerReviews(
  supabase: AnySupabaseClient,
  sellerId: string
): Promise<{ reviews: Review[]; average: number; count: number }> {
  // `reviews` a deux clés étrangères vers users (reviewer_id, seller_id) :
  // sans l'indication `!reviewer_id`, PostgREST répond 300 (ambigu).
  const { data, error } = await supabase
    .from('reviews')
    .select(`*, reviewer:public_profiles!reviewer_id(${PUBLIC_PROFILE_COLUMNS})`)
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false })
  if (error) throw error

  const reviews = (data ?? []) as Review[]
  const count = reviews.length
  const average = count ? reviews.reduce((sum, r) => sum + r.rating, 0) / count : 0
  return { reviews, average, count }
}

export async function getSellerRating(
  supabase: AnySupabaseClient,
  sellerId: string
): Promise<{ average: number; count: number }> {
  const { data, error } = await supabase
    .from('seller_ratings')
    .select('average_rating, review_count')
    .eq('seller_id', sellerId)
    .maybeSingle()
  if (error || !data) return { average: 0, count: 0 }
  return { average: Number(data.average_rating) || 0, count: Number(data.review_count) || 0 }
}

// Simple garde d'interface (afficher ou non « Laisser un avis ») : la vraie
// vérification est faite par la RPC create_review.
export async function canReviewSeller(
  supabase: AnySupabaseClient,
  reviewerId: string,
  sellerId: string,
  listingId: string | null
): Promise<boolean> {
  if (!listingId || reviewerId === sellerId) return false
  const { count, error } = await supabase
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .eq('listing_id', listingId)
    .or(
      `and(sender_id.eq.${reviewerId},receiver_id.eq.${sellerId}),and(sender_id.eq.${sellerId},receiver_id.eq.${reviewerId})`
    )
  if (error) return false
  return (count ?? 0) > 0
}

export async function getMyReviewForListing(
  supabase: AnySupabaseClient,
  reviewerId: string,
  listingId: string
): Promise<Review | null> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('reviewer_id', reviewerId)
    .eq('listing_id', listingId)
    .maybeSingle()
  if (error) throw error
  return data as Review | null
}

// Upsert : un second envoi pour la même annonce modifie l'avis existant.
export async function createReview(
  supabase: AnySupabaseClient,
  listingId: string,
  sellerId: string,
  rating: number,
  comment: string | null
): Promise<Review> {
  const { data, error } = await supabase.rpc('create_review', {
    p_listing_id: listingId,
    p_seller_id: sellerId,
    p_rating: rating,
    p_comment: comment,
  })
  if (error) throw error
  return data as Review
}
