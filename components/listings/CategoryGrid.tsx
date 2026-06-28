import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Category } from '@/types'
import { CategoryIcon } from './CategoryIcon'

interface CategoryGridProps {
  categories: Category[]
  className?: string
  compact?: boolean
}

export function CategoryGrid({ categories, className, compact = false }: CategoryGridProps) {
  if (categories.length === 0) {
    return null
  }

  return (
    <div
      className={cn(
        'grid gap-3',
        compact
          ? 'grid-cols-4 sm:grid-cols-5 gap-2'
          : 'grid-cols-3 sm:grid-cols-5 lg:grid-cols-5',
        className
      )}
    >
      {categories.map((category) => (
        <CategoryCard key={category.id} category={category} compact={compact} />
      ))}
    </div>
  )
}

function CategoryCard({
  category,
  compact = false,
}: {
  category: Category
  compact?: boolean
}) {
  return (
    <Link
      href={`/listings?category=${category.slug}`}
      className={cn(
        'group flex flex-col items-center justify-center gap-2 rounded-2xl border border-gray-100 bg-white transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-95',
        compact ? 'p-2.5' : 'p-4'
      )}
      style={{
        borderColor: `${category.color}20`,
      }}
    >
      <div
        className={cn(
          'flex items-center justify-center rounded-xl transition-transform group-hover:scale-110',
          compact ? 'w-10 h-10' : 'w-14 h-14'
        )}
        style={{ backgroundColor: `${category.color}15` }}
      >
        <CategoryIcon
          icon={category.icon}
          label={category.name}
          className={compact ? 'h-5 w-5' : 'h-7 w-7'}
        />
      </div>
      <span
        className={cn(
          'font-medium text-gray-700 text-center leading-tight',
          compact ? 'text-xs' : 'text-xs sm:text-sm'
        )}
      >
        {category.name}
      </span>
    </Link>
  )
}

export function CategoryGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-gray-100 bg-white"
        >
          <div className="skeleton w-14 h-14 rounded-xl" />
          <div className="skeleton h-3 w-16 rounded" />
        </div>
      ))}
    </div>
  )
}
