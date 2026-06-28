'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X, Package, ZoomIn } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ListingImage } from '@/types'

interface ListingGalleryProps {
  images: ListingImage[]
  title: string
}

export function ListingGallery({ images, title }: ListingGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const sorted = [...images].sort((a, b) => a.display_order - b.display_order)

  if (sorted.length === 0) {
    return (
      <div className="aspect-video bg-gray-100 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <Package className="w-16 h-16 mx-auto mb-2 opacity-40" />
          <p className="text-sm">Aucune photo disponible</p>
        </div>
      </div>
    )
  }

  const prev = () => setActiveIndex((i) => (i - 1 + sorted.length) % sorted.length)
  const next = () => setActiveIndex((i) => (i + 1) % sorted.length)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') prev()
    if (e.key === 'ArrowRight') next()
    if (e.key === 'Escape') setLightboxOpen(false)
  }

  return (
    <>
      {/* Main Image */}
      <div className="relative aspect-video sm:aspect-[4/3] bg-gray-100 overflow-hidden group">
        <Image
          src={sorted[activeIndex].url}
          alt={`${title} - photo ${activeIndex + 1}`}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 66vw"
          priority={activeIndex === 0}
        />

        {/* Navigation arrows */}
        {sorted.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
              aria-label="Photo précédente"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
              aria-label="Photo suivante"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Zoom button */}
        <button
          onClick={() => setLightboxOpen(true)}
          className="absolute bottom-2 right-2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Agrandir la photo"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        {/* Counter */}
        {sorted.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
            {activeIndex + 1} / {sorted.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {sorted.length > 1 && (
        <div className="flex gap-2 p-3 overflow-x-auto scrollbar-hide">
          {sorted.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(i)}
              className={cn(
                'flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                i === activeIndex
                  ? 'border-primary'
                  : 'border-transparent hover:border-gray-300'
              )}
              aria-label={`Voir photo ${i + 1}`}
              aria-pressed={i === activeIndex}
            >
              <div className="relative w-full h-full">
                <Image
                  src={img.thumbnail_url || img.url}
                  alt={`${title} miniature ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="dialog"
          aria-label="Visionneuse de photos"
          aria-modal="true"
        >
          {/* Close */}
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center z-10"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
            {activeIndex + 1} / {sorted.length}
          </div>

          {/* Image */}
          <div className="relative w-full max-w-4xl max-h-[80vh] px-12">
            <Image
              src={sorted[activeIndex].url}
              alt={`${title} - photo ${activeIndex + 1}`}
              width={1200}
              height={800}
              className="object-contain w-full h-full max-h-[80vh]"
              style={{ objectFit: 'contain' }}
            />
          </div>

          {/* Nav arrows */}
          {sorted.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center"
                aria-label="Photo précédente"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={next}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center"
                aria-label="Photo suivante"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>
      )}
    </>
  )
}
