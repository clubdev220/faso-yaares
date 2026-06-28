import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Shield, Zap, MessageCircle } from 'lucide-react'
import { ListingCard } from '@/components/listings/ListingCard'
import { CategoryGrid } from '@/components/listings/CategoryGrid'
import { SearchBar } from '@/components/common/SearchBar'
import type { Listing, Category } from '@/types'
import { CATEGORIES_DATA } from '@/lib/constants'
import { isSupabaseConfigured } from '@/lib/supabase/is-configured'
import { AutoRefresh } from '@/components/common/AutoRefresh'

export const metadata: Metadata = {
  title: 'Yaaré - Marché en ligne du Burkina Faso',
  description: 'Achetez et vendez facilement au Burkina Faso. Véhicules, téléphones, immobilier et plus encore.',
}

export const dynamic = 'force-dynamic'

async function getHomeData(): Promise<{ listings: Listing[]; categories: Category[] }> {
  if (!isSupabaseConfigured()) {
    return { listings: [], categories: [] }
  }

  try {
    const { createAdminClient } = await import('@/lib/supabase/server')
    const supabase = await createAdminClient()

    const [listingsResult, categoriesResult] = await Promise.all([
      supabase
        .from('listings')
        .select(`*, category:categories(id,name,slug,icon,color), images:listing_images(id,url,thumbnail_url,display_order)`)
        .eq('status', 'active')
        .order('published_at', { ascending: false })
        .limit(12),
      supabase
        .from('categories')
        .select('*')
        .is('parent_id', null)
        .order('display_order', { ascending: true }),
    ])

    return {
      listings: ((listingsResult.data || []) as unknown as Listing[]),
      categories: ((categoriesResult.data || []) as unknown as Category[]),
    }
  } catch {
    return { listings: [], categories: [] }
  }
}

// Fallback categories from constants for demo
const fallbackCategories: Category[] = CATEGORIES_DATA.map((c, i) => ({
  id: String(i + 1),
  name: c.name,
  slug: c.slug,
  icon: c.icon,
  color: c.color,
  parent_id: null,
  display_order: c.display_order,
}))

export default async function HomePage() {
  const { listings, categories } = await getHomeData()
  const displayCategories = categories.length > 0 ? categories : fallbackCategories

  return (
    <>
      <AutoRefresh />
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-primary-600 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-3xl md:text-5xl font-heading font-bold mb-3 text-balance">
              Le marché en ligne{' '}
              <span className="text-accent">du Burkina Faso</span>
            </h1>
            <p className="text-primary-100 text-base md:text-lg mb-8">
              Achetez et vendez facilement près de chez vous. Des milliers d&apos;annonces vous attendent.
            </p>

            <SearchBar className="max-w-xl mx-auto" />

            <div className="flex items-center justify-center gap-6 mt-8 text-sm text-primary-100">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-accent" />
                <span>100% gratuit</span>
              </div>
              <div className="w-px h-4 bg-primary-400" />
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-accent" />
                <span>Publication rapide</span>
              </div>
              <div className="w-px h-4 bg-primary-400" />
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-accent" />
                <span>Contact WhatsApp</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl md:text-2xl font-heading font-bold text-gray-900">
            Catégories
          </h2>
          <Link
            href="/categories"
            className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-600 transition-colors"
          >
            Voir tout
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <CategoryGrid categories={displayCategories} />
      </section>

      {/* Recent Listings */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl md:text-2xl font-heading font-bold text-gray-900">
            Annonces récentes
          </h2>
          <Link
            href="/listings"
            className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-600 transition-colors"
          >
            Voir tout
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {listings.length === 0 ? (
          <EmptyListings />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}

        {listings.length >= 12 && (
          <div className="mt-8 text-center">
            <Link href="/listings" className="btn-outline btn-lg">
              Voir toutes les annonces
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        )}
      </section>

      {/* CTA Banner */}
      <section className="bg-accent/10 border-y border-accent/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
          <h2 className="text-xl md:text-2xl font-heading font-bold text-gray-900 mb-2">
            Vous avez quelque chose à vendre ?
          </h2>
          <p className="text-gray-600 mb-6">
            Publiez votre annonce gratuitement en moins de 2 minutes.
          </p>
          <Link href="/create-listing" className="btn-primary btn-lg">
            <Zap className="w-5 h-5" />
            Publier une annonce gratuite
          </Link>
        </div>
      </section>
    </>
  )
}

function EmptyListings() {
  return (
    <div className="text-center py-16">
      <p className="text-5xl mb-4">🏪</p>
      <h3 className="text-lg font-heading font-semibold text-gray-900 mb-2">
        Aucune annonce pour le moment
      </h3>
      <p className="text-gray-500 mb-6">Soyez le premier à publier une annonce !</p>
      <Link href="/create-listing" className="btn-primary btn-md">
        Publier la première annonce
      </Link>
    </div>
  )
}
