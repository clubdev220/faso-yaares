import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Clock, Package, Eye, ChevronLeft, Truck, Flag, AlertTriangle, Pencil } from 'lucide-react'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { AutoRefresh } from '@/components/common/AutoRefresh'
import { ViewCounter } from '@/components/common/ViewCounter'
import { ListingGallery } from '@/components/listings/ListingGallery'
import { FavoriteButton } from '@/components/common/FavoriteButton'
import { WhatsAppButton } from '@/components/common/WhatsAppButton'
import { CategoryIcon } from '@/components/listings/CategoryIcon'
import {
  formatPrice,
  formatDate,
  getConditionLabel,
  buildWhatsAppMessage,
} from '@/lib/utils'
import type { Listing } from '@/types'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

async function getListing(id: string) {
  const supabase = await createAdminClient()

  const { data, error } = await supabase
    .from('listings')
    .select(
      `*, user:users(id,full_name,avatar_url,phone,city,is_verified,created_at), category:categories(id,name,slug,icon,color), images:listing_images(id,url,thumbnail_url,display_order)`
    )
    .eq('id', id)
    .in('status', ['active', 'sold', 'suspended'])
    .single()

  if (error || !data) return null
  return data as Listing & { user: NonNullable<Listing['user']> }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const listing = await getListing(id)

  if (!listing) {
    return { title: 'Annonce introuvable' }
  }

  const mainImage = listing.images?.[0]

  return {
    title: listing.title,
    description: listing.description.slice(0, 160),
    openGraph: {
      title: `${listing.title} - ${formatPrice(listing.price)}`,
      description: listing.description.slice(0, 200),
      images: mainImage ? [{ url: mainImage.url }] : [],
      type: 'website',
    },
  }
}

export default async function ListingDetailPage({ params }: PageProps) {
  const { id } = await params
  const listing = await getListing(id)

  if (!listing) notFound()

  // Annonce suspendue : seul le vendeur peut la voir
  if (listing.status === 'suspended') {
    const authClient = await createClient()
    const { data: { user } } = await authClient.auth.getUser()
    if (!user || user.id !== listing.user_id) {
      redirect('/listings')
    }
  }

  const whatsappMessage = buildWhatsAppMessage({
    title: listing.title,
    price: listing.price,
    id: listing.id,
  })

  const sellerPhone = listing.user?.phone || ''

  const conditionBadge: Record<string, { label: string; class: string }> = {
    new: { label: 'Neuf', class: 'badge-success' },
    good: { label: 'Bon état', class: 'badge-info' },
    fair: { label: 'État correct', class: 'badge-warning' },
  }

  const condition = conditionBadge[listing.condition] || { label: getConditionLabel(listing.condition), class: 'badge-info' }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: listing.title,
    description: listing.description,
    image: listing.images?.map((img) => img.url) || [],
    offers: {
      '@type': 'Offer',
      price: listing.price,
      priceCurrency: listing.currency || 'XOF',
      availability:
        listing.status === 'active'
          ? 'https://schema.org/InStock'
          : 'https://schema.org/SoldOut',
    },
  }

  return (
    <>
      <AutoRefresh />
      <ViewCounter listingId={listing.id} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Back */}
        <Link
          href="/listings"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Retour aux annonces
        </Link>

        {listing.status === 'sold' && (
          <div className="mb-4 bg-secondary/10 border border-secondary/20 text-secondary rounded-xl px-4 py-3 text-sm font-medium">
            ⚠️ Cette annonce a été marquée comme vendue.
          </div>
        )}

        {listing.status === 'suspended' && (
          <div className="mb-4 bg-orange-50 border border-orange-200 rounded-xl px-4 py-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-orange-800">
                  Cette annonce est suspendue
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  Elle n&apos;est pas visible par les autres utilisateurs. Vous pouvez la modifier et la resoumettre pour réexamen.
                </p>
                <Link
                  href={`/listings/${listing.id}/edit`}
                  className="inline-flex items-center gap-1.5 mt-3 text-xs font-medium bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Modifier et resoumettre
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Gallery + Description */}
          <div className="lg:col-span-2 space-y-4">
            {/* Gallery */}
            <div className="card overflow-hidden">
              <ListingGallery images={listing.images || []} title={listing.title} />
            </div>

            {/* Details Card */}
            <div className="card p-5 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {listing.category && (
                      <Link
                        href={`/listings?category=${listing.category.slug}`}
                        className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-primary transition-colors"
                      >
                        <CategoryIcon
                          icon={listing.category.icon}
                          label={listing.category.name}
                          className="h-3.5 w-3.5"
                        />
                        {listing.category.name}
                      </Link>
                    )}
                    <span className={condition.class}>{condition.label}</span>
                    {listing.is_delivery_available && (
                      <span className="badge badge-success">
                        <Truck className="w-3 h-3" />
                        Livraison
                      </span>
                    )}
                  </div>
                  <h1 className="text-xl md:text-2xl font-heading font-bold text-gray-900">
                    {listing.title}
                  </h1>
                </div>
                <FavoriteButton listingId={listing.id} size="md" />
              </div>

              {/* Price */}
              <div className="flex items-center justify-between">
                <p className="text-2xl md:text-3xl font-heading font-bold text-primary">
                  {listing.price === 0 ? (
                    <span className="text-green-600">Gratuit</span>
                  ) : (
                    formatPrice(listing.price)
                  )}
                </p>
              </div>

              {/* Meta */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 border-t border-gray-100 pt-3">
                {listing.city && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>
                      {listing.neighborhood ? `${listing.neighborhood}, ` : ''}
                      {listing.city}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span>{formatDate(listing.published_at || listing.created_at)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span>{listing.views_count} vue{listing.views_count !== 1 ? 's' : ''}</span>
                </div>
              </div>

              {/* Description */}
              <div className="border-t border-gray-100 pt-4">
                <h2 className="font-heading font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Package className="w-4 h-4 text-primary" />
                  Description
                </h2>
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {listing.description}
                </p>
              </div>
            </div>

            {/* Report */}
            <div className="flex justify-end">
              <Link
                href={`/listings/${listing.id}/report`}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-secondary transition-colors"
              >
                <Flag className="w-3.5 h-3.5" />
                Signaler cette annonce
              </Link>
            </div>
          </div>

          {/* Right: Seller + Contact */}
          <div className="lg:col-span-1 space-y-4">
            {/* Contact Card - Sticky */}
            <div className="card p-5 lg:sticky lg:top-24">
              {/* Seller */}
              {listing.user && (
                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {listing.user.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={listing.user.avatar_url}
                        alt={listing.user.full_name || 'Vendeur'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xl font-bold text-primary">
                        {listing.user.full_name?.[0]?.toUpperCase() || 'V'}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-heading font-semibold text-gray-900 truncate">
                      {listing.user.full_name || 'Vendeur'}
                    </p>
                    {listing.user.city && (
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {listing.user.city}
                      </p>
                    )}
                    <p className="text-xs text-gray-400">
                      Membre depuis{' '}
                      {new Date(listing.user.created_at).toLocaleDateString('fr-BF', {
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              )}

              {/* Contact Buttons */}
              <div>
                <WhatsAppButton
                  phone={sellerPhone}
                  message={whatsappMessage}
                  className="w-full btn-lg"
                />
              </div>

              <p className="text-xs text-gray-400 text-center mt-4">
                🔒 Ne payez jamais à l&apos;avance sans voir l&apos;article
              </p>
            </div>

            {/* Safety Tips */}
            <div className="card p-4 bg-accent/5 border-accent/20">
              <h3 className="font-heading font-semibold text-sm text-gray-900 mb-2">
                Conseils de sécurité
              </h3>
              <ul className="text-xs text-gray-600 space-y-1">
                <li className="flex gap-1.5">✅ Rencontrez le vendeur dans un lieu public</li>
                <li className="flex gap-1.5">✅ Vérifiez l&apos;article avant de payer</li>
                <li className="flex gap-1.5">❌ Ne payez jamais en avance</li>
                <li className="flex gap-1.5">❌ Méfiez-vous des prix trop bas</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
