import type { Metadata } from 'next'
import { Suspense } from 'react'
import { ListingCard, ListingCardSkeleton } from '@/components/listings/ListingCard'
import { FilterPanel } from '@/components/listings/FilterPanel'
import { InlineSearchBar } from '@/components/common/SearchBar'
import { SortSelect } from '@/components/listings/SortSelect'
import { isSupabaseConfigured } from '@/lib/supabase/is-configured'
import type { Listing, Category, SearchFilters } from '@/types'
import { CATEGORIES_DATA } from '@/lib/constants'
import { AutoRefresh } from '@/components/common/AutoRefresh'

export const metadata: Metadata = {
  title: 'Annonces',
  description: 'Explorez toutes les annonces disponibles au Burkina Faso.',
}

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{
    q?: string
    category?: string
    city?: string
    min_price?: string
    max_price?: string
    condition?: string
    sort?: string
    page?: string
  }>
}

const fallbackCategories: Category[] = CATEGORIES_DATA.map((c, i) => ({
  id: String(i + 1),
  name: c.name,
  slug: c.slug,
  icon: c.icon,
  color: c.color,
  parent_id: null,
  display_order: c.display_order,
}))

async function getCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured()) return fallbackCategories
  try {
    const { createAdminClient } = await import('@/lib/supabase/server')
    const supabase = await createAdminClient()
    const { data } = await supabase
      .from('categories')
      .select('*')
      .is('parent_id', null)
      .order('display_order')
    return data?.length ? (data as unknown as Category[]) : fallbackCategories
  } catch {
    return fallbackCategories
  }
}

async function getCategoryBySlug(slug: string): Promise<Category | null> {
  if (!isSupabaseConfigured()) {
    return fallbackCategories.find((c) => c.slug === slug) || null
  }
  try {
    const { createAdminClient } = await import('@/lib/supabase/server')
    const supabase = await createAdminClient()
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single()
    return data as unknown as Category | null
  } catch {
    return null
  }
}

async function getListings(
  filters: SearchFilters
): Promise<{ listings: Listing[]; count: number }> {
  if (!isSupabaseConfigured()) return { listings: [], count: 0 }

  try {
    const { createAdminClient } = await import('@/lib/supabase/server')
    const supabase = await createAdminClient()

    let query = supabase
      .from('listings')
      .select(
        `*, category:categories(id,name,slug,icon,color), images:listing_images(id,url,thumbnail_url,display_order)`,
        { count: 'exact' }
      )
      .eq('status', 'active')

    if (filters.query) {
      query = query.textSearch('search_vector', filters.query, {
        type: 'websearch',
        config: 'french',
      })
    }
    if (filters.category_id) {
      // Include listings from subcategories of the selected category
      const { data: children } = await supabase
        .from('categories')
        .select('id')
        .eq('parent_id', filters.category_id)
      const categoryIds = [
        filters.category_id,
        ...((children || []) as { id: string }[]).map((c) => c.id),
      ]
      query = query.in('category_id', categoryIds)
    }
    if (filters.city) query = query.eq('city', filters.city)
    if (filters.min_price !== undefined) query = query.gte('price', filters.min_price)
    if (filters.max_price !== undefined) query = query.lte('price', filters.max_price)
    if (filters.condition) query = query.eq('condition', filters.condition)

    const sortBy = filters.sort_by || 'date_desc'
    if (sortBy === 'price_asc') query = query.order('price', { ascending: true })
    else if (sortBy === 'price_desc') query = query.order('price', { ascending: false })
    else if (sortBy === 'date_asc') query = query.order('published_at', { ascending: true })
    else query = query.order('published_at', { ascending: false })

    const page = filters.page || 1
    const pageSize = filters.page_size || 12
    const from = (page - 1) * pageSize
    query = query.range(from, from + pageSize - 1)

    const { data, count, error } = await query
    if (error) return { listings: [], count: 0 }
    return { listings: (data || []) as unknown as Listing[], count: count || 0 }
  } catch {
    return { listings: [], count: 0 }
  }
}

export default async function ListingsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const [categories, categoryObj] = await Promise.all([
    getCategories(),
    params.category ? getCategoryBySlug(params.category) : Promise.resolve(null),
  ])

  const filters: SearchFilters = {
    query: params.q,
    category_id: categoryObj?.id,
    city: params.city,
    min_price: params.min_price ? Number(params.min_price) : undefined,
    max_price: params.max_price ? Number(params.max_price) : undefined,
    condition: params.condition as SearchFilters['condition'],
    sort_by: (params.sort as SearchFilters['sort_by']) || 'date_desc',
    page: params.page ? Number(params.page) : 1,
    page_size: 12,
  }

  const { listings, count } = await getListings(filters)

  const hasFilters = !!(
    params.q || params.category || params.city || params.min_price || params.max_price || params.condition
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <AutoRefresh />
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Filters */}
        <aside className="lg:w-64 flex-shrink-0">
          <FilterPanel categories={categories} />
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="flex-1">
              <InlineSearchBar
                placeholder="Rechercher dans les annonces..."
                initialQuery={params.q || ''}
              />
            </div>
            <SortSelect currentSort={filters.sort_by || 'date_desc'} />
          </div>

          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{count.toLocaleString('fr-BF')}</span>{' '}
              annonce{count !== 1 ? 's' : ''}
              {hasFilters && ' trouvée' + (count !== 1 ? 's' : '')}
            </p>
            {hasFilters && (
              <a href="/listings" className="text-sm text-secondary hover:underline">
                Effacer les filtres
              </a>
            )}
          </div>

          <Suspense
            fallback={
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {Array.from({ length: 12 }).map((_, i) => (
                  <ListingCardSkeleton key={i} />
                ))}
              </div>
            }
          >
            {listings.length === 0 ? (
              <EmptyResults hasFilters={hasFilters} />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </Suspense>
        </div>
      </div>
    </div>
  )
}

function EmptyResults({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="text-center py-16">
      <p className="text-5xl mb-4">{hasFilters ? '🔍' : '📭'}</p>
      <h3 className="text-lg font-heading font-semibold text-gray-900 mb-2">
        {hasFilters ? 'Aucun résultat' : 'Aucune annonce'}
      </h3>
      <p className="text-gray-500 text-sm">
        {hasFilters
          ? 'Essayez avec des critères différents ou élargissez votre recherche.'
          : "Il n'y a pas encore d'annonces. Soyez le premier !"}
      </p>
    </div>
  )
}
