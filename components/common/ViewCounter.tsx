'use client'

import { useEffect } from 'react'

export function ViewCounter({ listingId }: { listingId: string }) {
  useEffect(() => {
    const key = `viewed_${listingId}`
    if (sessionStorage.getItem(key)) return // already counted in this session

    fetch(`/api/listings/${listingId}/view`, { method: 'POST' })
      .then(() => sessionStorage.setItem(key, '1'))
      .catch(() => {})
  }, [listingId])

  return null
}
