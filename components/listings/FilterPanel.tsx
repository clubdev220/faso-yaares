'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useCallback } from 'react'
import { SlidersHorizontal, ChevronDown, ChevronUp, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BURKINA_CITIES, LISTING_CONDITIONS } from '@/lib/constants'
import type { Category } from '@/types'
import { CategoryIcon } from './CategoryIcon'

interface FilterPanelProps {
  categories: Category[]
  className?: string
}

export function FilterPanel({ categories, className }: FilterPanelProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    city: true,
    price: true,
    condition: true,
  })

  const currentCategory = searchParams.get('category') || ''
  const currentCity = searchParams.get('city') || ''
  const currentMinPrice = searchParams.get('min_price') || ''
  const currentMaxPrice = searchParams.get('max_price') || ''
  const currentCondition = searchParams.get('condition') || ''

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      params.delete('page')
      router.push(`/listings?${params.toString()}`)
    },
    [router, searchParams]
  )

  const clearAllFilters = () => {
    const q = searchParams.get('q')
    router.push(q ? `/listings?q=${q}` : '/listings')
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const hasActiveFilters = !!(currentCategory || currentCity || currentMinPrice || currentMaxPrice || currentCondition)

  return (
    <div className={cn('space-y-1', className)}>
      {/* Header */}
      <div className="flex items-center justify-between py-3 px-1">
        <div className="flex items-center gap-2 text-gray-900 font-heading font-semibold">
          <SlidersHorizontal className="w-4 h-4 text-primary" />
          Filtres
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-xs text-secondary hover:underline flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Tout effacer
          </button>
        )}
      </div>

      {/* Category Section */}
      <FilterSection
        title="Catégorie"
        expanded={expandedSections.category}
        onToggle={() => toggleSection('category')}
      >
        <div className="space-y-1">
          <FilterOption
            label="Toutes les catégories"
            active={!currentCategory}
            onClick={() => updateFilter('category', '')}
          />
          {categories.map((cat) => (
            <FilterOption
              key={cat.id}
              label={cat.name}
              icon={<CategoryIcon icon={cat.icon} label={cat.name} className="h-4 w-4" />}
              active={currentCategory === cat.slug}
              onClick={() =>
                updateFilter('category', currentCategory === cat.slug ? '' : cat.slug)
              }
            />
          ))}
        </div>
      </FilterSection>

      {/* City Section */}
      <FilterSection
        title="Ville"
        expanded={expandedSections.city}
        onToggle={() => toggleSection('city')}
      >
        <select
          value={currentCity}
          onChange={(e) => updateFilter('city', e.target.value)}
          className="input text-sm py-2"
        >
          <option value="">Toutes les villes</option>
          {BURKINA_CITIES.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </FilterSection>

      {/* Price Section */}
      <FilterSection
        title="Prix (FCFA)"
        expanded={expandedSections.price}
        onToggle={() => toggleSection('price')}
      >
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={currentMinPrice}
            onChange={(e) => updateFilter('min_price', e.target.value)}
            min={0}
            className="input text-sm py-2 w-full"
          />
          <span className="text-gray-400 text-sm flex-shrink-0">–</span>
          <input
            type="number"
            placeholder="Max"
            value={currentMaxPrice}
            onChange={(e) => updateFilter('max_price', e.target.value)}
            min={0}
            className="input text-sm py-2 w-full"
          />
        </div>
      </FilterSection>

      {/* Condition Section */}
      <FilterSection
        title="État"
        expanded={expandedSections.condition}
        onToggle={() => toggleSection('condition')}
      >
        <div className="space-y-1">
          <FilterOption
            label="Tous les états"
            active={!currentCondition}
            onClick={() => updateFilter('condition', '')}
          />
          {LISTING_CONDITIONS.map((cond) => (
            <FilterOption
              key={cond.value}
              label={cond.label}
              description={cond.description}
              active={currentCondition === cond.value}
              onClick={() =>
                updateFilter(
                  'condition',
                  currentCondition === cond.value ? '' : cond.value
                )
              }
            />
          ))}
        </div>
      </FilterSection>
    </div>
  )
}

function FilterSection({
  title,
  expanded,
  onToggle,
  children,
}: {
  title: string
  expanded: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden bg-white">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <span>{title}</span>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-50 pt-3">{children}</div>
      )}
    </div>
  )
}

function FilterOption({
  label,
  icon,
  description,
  active,
  onClick,
}: {
  label: string
  icon?: React.ReactNode
  description?: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
        active
          ? 'bg-primary/10 text-primary font-medium'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      )}
    >
      <span className="flex items-center gap-2">
        {icon}
        <span>{label}</span>
      </span>
      {description && (
        <span className="block text-xs text-gray-400 mt-0.5 font-normal">{description}</span>
      )}
    </button>
  )
}
