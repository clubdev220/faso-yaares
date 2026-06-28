'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowUpDown } from 'lucide-react'
import { SORT_OPTIONS } from '@/lib/constants'

interface SortSelectProps {
  currentSort: string
}

export function SortSelect({ currentSort }: SortSelectProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', e.target.value)
    params.delete('page')
    router.push(`/listings?${params.toString()}`)
  }

  return (
    <div className="relative flex items-center gap-2">
      <ArrowUpDown className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" />
      <select
        value={currentSort}
        onChange={handleChange}
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
