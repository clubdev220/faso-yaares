import type { Metadata } from 'next'
import Link from 'next/link'
import { isSupabaseConfigured } from '@/lib/supabase/is-configured'
import type { Category } from '@/types'
import { CATEGORIES_DATA } from '@/lib/constants'
import { CategoryIcon } from '@/components/listings/CategoryIcon'

export const metadata: Metadata = {
  title: 'Catégories',
  description: "Explorez toutes les catégories d'annonces disponibles sur Yaaré.",
}

export const dynamic = 'force-dynamic'

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

export default async function CategoriesPage() {
  const cats = await getCategories()

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl md:text-3xl font-heading font-bold text-gray-900 mb-6">
        Toutes les catégories
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {cats.map((cat) => (
          <Link
            key={cat.id}
            href={`/listings?category=${cat.slug}`}
            className="group flex flex-col items-center gap-3 p-5 bg-white rounded-2xl border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-200 active:scale-95"
            style={{ borderColor: `${cat.color}20` }}
          >
            <div
              className="w-16 h-16 flex items-center justify-center rounded-2xl transition-transform group-hover:scale-110"
              style={{ backgroundColor: `${cat.color}15` }}
            >
              <CategoryIcon icon={cat.icon} label={cat.name} className="h-8 w-8" />
            </div>
            <span className="text-sm font-medium text-gray-700 text-center leading-tight">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
