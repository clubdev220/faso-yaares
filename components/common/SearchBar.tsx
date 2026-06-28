'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchBarProps {
  className?: string
  placeholder?: string
  initialQuery?: string
  autoFocus?: boolean
}

export function SearchBar({
  className,
  placeholder = 'Rechercher une annonce...',
  initialQuery = '',
  autoFocus = false,
}: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/listings?q=${encodeURIComponent(query.trim())}`)
    } else {
      router.push('/listings')
    }
  }

  const handleClear = () => {
    setQuery('')
    inputRef.current?.focus()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('relative flex items-center', className)}
      role="search"
    >
      <label htmlFor="search-input" className="sr-only">
        Rechercher
      </label>
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        <input
          ref={inputRef}
          id="search-input"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full pl-12 pr-12 py-3.5 bg-white rounded-xl border border-white/30 text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 text-base"
          aria-label="Rechercher des annonces"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-14 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full"
            aria-label="Effacer la recherche"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <button
        type="submit"
        className="ml-2 px-5 py-3.5 bg-secondary text-white font-medium rounded-xl hover:bg-secondary-600 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-secondary/50 whitespace-nowrap flex-shrink-0"
        aria-label="Lancer la recherche"
      >
        Chercher
      </button>
    </form>
  )
}

export function InlineSearchBar({
  className,
  placeholder = 'Rechercher...',
  initialQuery = '',
  onSearch,
}: SearchBarProps & { onSearch?: (query: string) => void }) {
  const [query, setQuery] = useState(initialQuery)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSearch) {
      onSearch(query.trim())
    } else {
      router.push(`/listings?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('relative', className)}
      role="search"
    >
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="input pl-10 pr-4 py-2.5 text-sm"
        aria-label="Rechercher"
      />
    </form>
  )
}
