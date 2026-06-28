import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus, Package, Eye, Heart, TrendingUp, AlertTriangle } from 'lucide-react'
import { revalidatePath } from 'next/cache'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { ListingCard } from '@/components/listings/ListingCard'
import { SuspendedAlert } from '@/components/dashboard/SuspendedAlert'
import type { Listing } from '@/types'

export const metadata: Metadata = {
  title: 'Mes annonces',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const admin = await createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const listingsQuery = (admin.from('listings') as any)
    .select('*, category:categories(id,name,slug,icon,color), images:listing_images(id,url,thumbnail_url,display_order)')
    .eq('user_id', user.id)
    .neq('status', 'deleted')
    .order('created_at', { ascending: false })

  const listingsResult = await listingsQuery
  const listings = (listingsResult.data || []) as Listing[]
  const listingIds = listings.map((listing) => listing.id)

  let favoritesCount = 0
  if (listingIds.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const favoritesResult = await (admin.from('favorites') as any)
      .select('id', { count: 'exact', head: true })
      .in('listing_id', listingIds)
    favoritesCount = favoritesResult.count || 0
  }

  const stats = {
    total: listings.length,
    active: listings.filter((l) => l.status === 'active').length,
    sold: listings.filter((l) => l.status === 'sold').length,
    suspended: listings.filter((l) => l.status === 'suspended').length,
    totalViews: listings.reduce((sum, l) => sum + (l.views_count || 0), 0),
    favorites: favoritesCount,
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold text-gray-900">Mes annonces</h1>
        <Link href="/create-listing" className="btn-primary btn-md">
          <Plus className="w-4 h-4" />
          Nouvelle annonce
        </Link>
      </div>

      {/* Alerte annonces suspendues (dismissable) */}
      <SuspendedAlert count={stats.suspended} />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <StatCard
          icon={Package}
          label="Total"
          value={stats.total}
          color="text-primary"
          bg="bg-primary/10"
        />
        <StatCard
          icon={TrendingUp}
          label="Actives"
          value={stats.active}
          color="text-green-600"
          bg="bg-green-50"
        />
        <StatCard
          icon={Eye}
          label="Vues"
          value={stats.totalViews}
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <StatCard
          icon={Heart}
          label="Favoris"
          value={stats.favorites}
          color="text-secondary"
          bg="bg-red-50"
        />
      </div>

      {/* Listings */}
      {listings.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">📭</p>
          <h2 className="text-lg font-heading font-semibold text-gray-900 mb-2">
            Vous n&apos;avez pas encore d&apos;annonces
          </h2>
          <p className="text-gray-500 mb-6">Publiez votre première annonce gratuitement !</p>
          <Link href="/create-listing" className="btn-primary btn-lg">
            <Plus className="w-5 h-5" />
            Publier une annonce
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {listings.map((listing) => (
            <div key={listing.id} className="relative">
              <ListingCard listing={listing} showFavorite={false} />
              <DashboardActions listing={listing} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  bg,
}: {
  icon: React.ElementType
  label: string
  value: number
  color: string
  bg: string
}) {
  return (
    <div className="card p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div>
        <p className="text-xl font-heading font-bold text-gray-900">{value.toLocaleString('fr-BF')}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  )
}

function DashboardActions({ listing }: { listing: Listing }) {
  if (listing.status === 'suspended') {
    return (
      <div className="mt-2">
        <span className="flex items-center justify-center gap-1.5 w-full text-xs py-1.5 bg-orange-50 text-orange-600 rounded-lg border border-orange-200 font-medium">
          <AlertTriangle className="w-3 h-3" />
          Annonce suspendue
        </span>
      </div>
    )
  }

  return (
    <div className="mt-2 flex gap-2">
      <Link
        href={`/listings/${listing.id}/edit`}
        className="flex-1 text-center text-xs py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
      >
        Modifier
      </Link>
      {listing.status === 'active' ? (
        <MarkSoldButton listingId={listing.id} />
      ) : listing.status === 'sold' ? (
        <MarkActiveButton listingId={listing.id} />
      ) : null}
    </div>
  )
}

async function markSoldAction(formData: FormData) {
  'use server'
  const id = formData.get('listingId') as string
  const { createAdminClient, createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  const admin = await createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (admin.from('listings') as any)
    .update({ status: 'sold' })
    .eq('id', id)
    .eq('user_id', user.id)
  revalidatePath('/dashboard')
}

async function markActiveAction(formData: FormData) {
  'use server'
  const id = formData.get('listingId') as string
  const { createAdminClient, createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  const admin = await createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (admin.from('listings') as any)
    .update({ status: 'active' })
    .eq('id', id)
    .eq('user_id', user.id)
  revalidatePath('/dashboard')
}

function MarkSoldButton({ listingId }: { listingId: string }) {
  return (
    <form action={markSoldAction}>
      <input type="hidden" name="listingId" value={listingId} />
      <button
        type="submit"
        className="flex-1 text-xs py-1.5 bg-secondary/10 hover:bg-secondary/20 text-secondary rounded-lg transition-colors whitespace-nowrap px-2"
      >
        Vendu
      </button>
    </form>
  )
}

function MarkActiveButton({ listingId }: { listingId: string }) {
  return (
    <form action={markActiveAction}>
      <input type="hidden" name="listingId" value={listingId} />
      <button
        type="submit"
        className="flex-1 text-xs py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors whitespace-nowrap px-2"
      >
        Remettre en vente
      </button>
    </form>
  )
}
