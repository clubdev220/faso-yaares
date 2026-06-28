'use client'

import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Clock, Package } from 'lucide-react'
import { cn, formatPrice, formatDate, getConditionLabel, truncate } from '@/lib/utils'
import { FavoriteButton } from '@/components/common/FavoriteButton'
import type { Listing } from '@/types'

interface ListingCardProps {
  listing: Listing
  className?: string
  showFavorite?: boolean
}

export function ListingCard({
  listing,
  className,
  showFavorite = true,
}: ListingCardProps) {
  const mainImage = listing.images?.sort((a, b) => a.display_order - b.display_order)[0]
  const thumbnailUrl = mainImage?.thumbnail_url || mainImage?.url

  const conditionColors: Record<string, string> = {
    new: 'bg-green-50 text-green-700',
    good: 'bg-blue-50 text-blue-700',
    fair: 'bg-yellow-50 text-yellow-700',
  }

  return (
    <article
      className={cn(
        'relative card group cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5',
        className
      )}
    >
      <Link href={`/listings/${listing.id}`} className="block">
        {/* Image */}
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          {thumbnailUrl ? (
            <Image
              src={thumbnailUrl}
              alt={listing.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <Package className="w-10 h-10 text-gray-300" />
            </div>
          )}

          {/* Status badge */}
          {listing.status === 'sold' && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-secondary text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                Vendu
              </span>
            </div>
          )}
          {listing.status === 'suspended' && (
            <div className="absolute inset-0 bg-orange-900/60 flex flex-col items-center justify-center gap-1.5">
              <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                Suspendu
              </span>
              <span className="text-white/90 text-[10px] text-center px-3 leading-tight">
                Contactez le support
              </span>
            </div>
          )}

          {/* Condition badge */}
          <div className="absolute top-2 left-2">
            <span
              className={cn(
                'text-xs font-medium px-2 py-0.5 rounded-full',
                conditionColors[listing.condition] || 'bg-gray-50 text-gray-600'
              )}
            >
              {getConditionLabel(listing.condition)}
            </span>
          </div>

          {/* Images count */}
          {listing.images && listing.images.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded-md">
              +{listing.images.length - 1}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3">
          {/* Price */}
          <p className="text-base font-heading font-bold text-primary mb-1">
            {listing.price === 0 ? (
              <span className="text-green-600">Gratuit</span>
            ) : (
              formatPrice(listing.price)
            )}
          </p>

          {/* Title */}
          <h3 className="text-sm font-medium text-gray-800 leading-tight mb-2 line-clamp-2">
            {truncate(listing.title, 60)}
          </h3>

          {/* Meta */}
          <div className="flex flex-col gap-1">
            {listing.city && (
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">
                  {listing.neighborhood
                    ? `${listing.neighborhood}, ${listing.city}`
                    : listing.city}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="w-3 h-3 flex-shrink-0" />
              <span>{formatDate(listing.published_at || listing.created_at)}</span>
            </div>
          </div>
        </div>
      </Link>

      {/* Favorite Button (outside the link) */}
      {showFavorite && (
        <div className="absolute top-2 right-2">
          <FavoriteButton listingId={listing.id} size="sm" />
        </div>
      )}
    </article>
  )
}

export function ListingCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="aspect-square skeleton" />
      <div className="p-3 space-y-2">
        <div className="skeleton h-5 w-24 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
      </div>
    </div>
  )
}
