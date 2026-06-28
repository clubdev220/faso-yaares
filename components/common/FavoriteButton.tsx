'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface FavoriteButtonProps {
  listingId: string
  size?: 'sm' | 'md'
  className?: string
}

export function FavoriteButton({
  listingId,
  size = 'md',
  className,
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const res = await fetch(`/api/favorites?listing_id=${listingId}`)
      if (res.ok) {
        const { isFavorite: fav } = await res.json()
        setIsFavorite(fav)
      }
    }
    init()
  }, [listingId])

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!userId) {
      router.push('/login')
      return
    }

    setIsLoading(true)
    const prev = isFavorite
    setIsFavorite(!prev) // optimistic update

    try {
      let res: Response
      if (prev) {
        res = await fetch(`/api/favorites?listing_id=${listingId}`, { method: 'DELETE' })
      } else {
        res = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ listing_id: listingId }),
        })
      }

      if (!res.ok) throw new Error()
      toast.success(prev ? 'Retiré des favoris' : 'Ajouté aux favoris ❤️')
    } catch {
      setIsFavorite(prev) // rollback on error
      toast.error('Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  const sizeClasses = { sm: 'w-8 h-8', md: 'w-10 h-10' }
  const iconSizes = { sm: 'w-4 h-4', md: 'w-5 h-5' }

  return (
    <button
      onClick={toggle}
      disabled={isLoading}
      className={cn(
        'flex items-center justify-center rounded-full bg-white/90 shadow-sm transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary',
        sizeClasses[size],
        className
      )}
      aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      aria-pressed={isFavorite}
    >
      <Heart
        className={cn(
          iconSizes[size],
          'transition-colors',
          isFavorite
            ? 'text-secondary fill-secondary'
            : 'text-gray-400 hover:text-secondary'
        )}
      />
    </button>
  )
}
