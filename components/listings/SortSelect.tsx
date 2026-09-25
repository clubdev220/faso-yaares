'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowUpDown, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { GEO_COOKIE, SORT_OPTIONS } from '@/lib/constants'

interface SortSelectProps {
  currentSort: string
}

// La position est gardée dans un cookie de session (arrondie à ~100 m)
// plutôt que dans l'URL : elle ne se retrouve ni dans les liens partagés
// ni dans les journaux du serveur.
function saveGeoCookie(latitude: number, longitude: number) {
  const value = `${latitude.toFixed(3)},${longitude.toFixed(3)}`
  document.cookie = `${GEO_COOKIE}=${value}; path=/; SameSite=Lax`
}

export function SortSelect({ currentSort }: SortSelectProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLocating, setIsLocating] = useState(false)

  const pushSort = (sort: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', sort)
    params.delete('page')
    router.push(`/listings?${params.toString()}`)
    router.refresh()
  }

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sort = e.target.value
    if (sort !== 'nearest') {
      pushSort(sort)
      return
    }

    if (!('geolocation' in navigator)) {
      toast.error('La localisation n’est pas disponible sur cet appareil.')
      return
    }

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        saveGeoCookie(position.coords.latitude, position.coords.longitude)
        setIsLocating(false)
        pushSort('nearest')
      },
      () => {
        setIsLocating(false)
        toast.error('Autorisez la localisation pour voir les annonces les plus proches.')
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 }
    )
  }

  return (
    <div className="relative flex items-center gap-2">
      {isLocating ? (
        <Loader2 className="absolute left-3 w-4 h-4 text-primary animate-spin pointer-events-none" />
      ) : (
        <ArrowUpDown className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" />
      )}
      <select
        value={currentSort}
        onChange={handleChange}
        disabled={isLocating}
        className="input pl-9 pr-4 py-2.5 text-sm appearance-none min-w-[160px]"
        aria-label="Trier les annonces"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
