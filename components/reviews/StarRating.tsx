'use client'

import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  rating: number
  onChange?: (value: number) => void
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZES = { sm: 'w-3.5 h-3.5', md: 'w-5 h-5', lg: 'w-8 h-8' }

// Lecture seule sans `onChange` (page vendeur, liste d'avis), interactif
// avec (formulaire « Laisser un avis »).
export function StarRating({ rating, onChange, size = 'md', className }: StarRatingProps) {
  const rounded = Math.round(rating)

  return (
    <div
      className={cn('flex items-center gap-0.5', className)}
      role={onChange ? 'radiogroup' : 'img'}
      aria-label={onChange ? 'Note' : `${rating.toFixed(1)} sur 5`}
    >
      {[1, 2, 3, 4, 5].map((value) => {
        const icon = (
          <Star
            className={cn(
              SIZES[size],
              value <= rounded ? 'fill-[#F5A623] text-[#F5A623]' : 'fill-transparent text-gray-300'
            )}
          />
        )
        return onChange ? (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={value === rounded}
            aria-label={`${value} étoile${value > 1 ? 's' : ''}`}
            onClick={() => onChange(value)}
            className="p-0.5 transition-transform active:scale-90"
          >
            {icon}
          </button>
        ) : (
          <span key={value}>{icon}</span>
        )
      })}
    </div>
  )
}
