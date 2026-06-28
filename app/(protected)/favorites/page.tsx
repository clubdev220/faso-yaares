import type { Metadata } from 'next'
import Link from 'next/link'
import { Heart, Search } from 'lucide-react'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { ListingCard } from '@/components/listings/ListingCard'
import type { Listing } from '@/types'

export const metadata: Metadata = {
  title: 'Mes favoris',
}

export default async function FavoritesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const admin = await createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: favorites } = await (admin.from('favorites') as any)
    .select(`
      id,
      listing:listings(
        *,
        category:categories(id,name,slug,icon,color),
        images:listing_images(id,url,thumbnail_url,display_order)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const listings = ((favorites || []) as unknown as { listing: Listing | null }[])
    .map((f) => f.listing)
    .filter((l): l is Listing => l !== null && l.status !== 'deleted')

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Heart className="w-6 h-6 text-secondary" />
        <h1 className="text-2xl font-heading font-bold text-gray-900">Mes favoris</h1>
        <span className="badge badge-error">{listings.length}</span>
      </div>

      {listings.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h2 className="text-lg font-heading font-semibold text-gray-900 mb-2">
            Aucun favori pour l&apos;instant
          </h2>
          <p className="text-gray-500 mb-6">
            Ajoutez des annonces à vos favoris en cliquant sur le ❤️
          </p>
          <Link href="/listings" className="btn-primary btn-lg">
            <Search className="w-5 h-5" />
            Explorer les annonces
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} showFavorite={true} />
          ))}
        </div>
      )}
    </div>
  )
}
