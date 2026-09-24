import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, MapPin, MessageSquareText } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import type { AnySupabaseClient } from '@/lib/supabase/types'
import { ListingCard } from '@/components/listings/ListingCard'
import { StarRating } from '@/components/reviews/StarRating'
import { SellerAvatar } from '@/components/sellers/SellerAvatar'
import { VerifiedBadge } from '@/components/sellers/VerifiedBadge'
import { getSellerReviews } from '@/lib/api/reviews'
import { LISTING_SELLER_EMBED, PUBLIC_PROFILE_COLUMNS } from '@/lib/api/select'
import { formatDate, formatMonthYear } from '@/lib/utils'
import type { Listing, PublicProfile, Review } from '@/types'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

async function getDb(): Promise<AnySupabaseClient> {
  return (await createClient()) as unknown as AnySupabaseClient
}

async function getSeller(id: string): Promise<PublicProfile | null> {
  const supabase = await getDb()
  const { data } = await supabase
    .from('public_profiles')
    .select(PUBLIC_PROFILE_COLUMNS)
    .eq('id', id)
    .maybeSingle()
  return (data as PublicProfile) ?? null
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  if (!UUID_RE.test(id)) return { title: 'Vendeur introuvable' }
  const seller = await getSeller(id).catch(() => null)
  if (!seller) return { title: 'Vendeur introuvable' }
  return {
    title: seller.full_name || 'Vendeur',
    description: `Annonces et avis de ${seller.full_name || 'ce vendeur'} sur Yaaré.`,
  }
}

export default async function SellerPage({ params }: PageProps) {
  const { id } = await params
  if (!UUID_RE.test(id)) notFound()

  const supabase = await getDb()

  // allSettled : l'échec d'une section (avis, annonces) ne doit pas masquer
  // les autres.
  const [sellerRes, listingsRes, reviewsRes] = await Promise.allSettled([
    getSeller(id),
    supabase
      .from('listings')
      .select(
        `*, category:categories(id,name,slug,icon,color), images:listing_images(id,url,thumbnail_url,display_order), ${LISTING_SELLER_EMBED}`
      )
      .eq('user_id', id)
      .eq('status', 'active')
      .order('published_at', { ascending: false }),
    getSellerReviews(supabase, id),
  ])

  const seller = sellerRes.status === 'fulfilled' ? sellerRes.value : null
  if (!seller) notFound()

  const listings =
    listingsRes.status === 'fulfilled' && !listingsRes.value.error
      ? ((listingsRes.value.data || []) as unknown as Listing[])
      : []
  const listingsFailed = listingsRes.status === 'rejected' || Boolean(
    listingsRes.status === 'fulfilled' && listingsRes.value.error
  )

  const reviewsData = reviewsRes.status === 'fulfilled' ? reviewsRes.value : null
  const reviews: Review[] = reviewsData?.reviews ?? []
  const average = reviewsData?.average ?? 0
  const reviewCount = reviewsData?.count ?? 0

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
      <Link
        href="/listings"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-4"
      >
        <ChevronLeft className="w-4 h-4" />
        Retour aux annonces
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="card p-5 flex items-center gap-4">
          <SellerAvatar
            url={seller.avatar_url}
            name={seller.full_name}
            className="w-16 h-16"
            textClassName="text-2xl"
          />
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-heading font-bold text-gray-900 truncate">
                {seller.full_name || 'Vendeur'}
              </h1>
              {seller.is_verified && <VerifiedBadge />}
            </div>
            {seller.city && (
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {seller.city}
              </p>
            )}
            <p className="text-xs text-gray-400">Membre depuis {formatMonthYear(seller.created_at)}</p>
          </div>
        </div>

        <div className="card p-5 flex items-center gap-4">
          <div className="text-4xl font-heading font-bold text-gray-900">
            {reviewCount > 0 ? average.toFixed(1) : '—'}
          </div>
          <div className="space-y-1">
            <StarRating rating={average} />
            <p className="text-sm text-gray-500">
              {reviewsData ? `${reviewCount} avis` : 'Avis indisponibles pour le moment'}
            </p>
          </div>
        </div>
      </div>

      <section className="mb-10">
        <h2 className="text-lg font-heading font-bold text-gray-900 mb-4">
          Annonces {listingsFailed ? '' : `(${listings.length})`}
        </h2>
        {listingsFailed ? (
          <p className="text-sm text-gray-400">Impossible de charger les annonces pour le moment.</p>
        ) : listings.length === 0 ? (
          <p className="text-sm text-gray-400">Aucune annonce active pour le moment.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-heading font-bold text-gray-900 mb-4">Avis</h2>
        {reviews.length === 0 ? (
          <p className="text-sm text-gray-400">Aucun avis pour le moment.</p>
        ) : (
          <ul className="space-y-3">
            {reviews.map((review) => (
              <li key={review.id} className="card p-4 space-y-2">
                <div className="flex items-center gap-3">
                  <SellerAvatar
                    url={review.reviewer?.avatar_url}
                    name={review.reviewer?.full_name}
                    className="w-8 h-8"
                    textClassName="text-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {review.reviewer?.full_name || 'Utilisateur'}
                    </p>
                    <p className="text-xs text-gray-400">{formatDate(review.created_at)}</p>
                  </div>
                  <StarRating rating={review.rating} size="sm" />
                </div>
                {review.comment && (
                  <p className="flex items-start gap-2 text-sm text-gray-600">
                    <MessageSquareText className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span className="whitespace-pre-wrap">{review.comment}</span>
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
