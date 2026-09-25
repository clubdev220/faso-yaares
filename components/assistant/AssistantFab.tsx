'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sparkles } from 'lucide-react'

// Bouton flottant « Assistant » sur les pages principales (masqué sur la
// page de l'assistant elle-même).
export function AssistantFab() {
  const pathname = usePathname()
  if (pathname.startsWith('/assistant')) return null

  return (
    <Link
      href="/assistant"
      className="fixed right-4 bottom-24 lg:bottom-6 z-40 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-transform hover:bg-primary-600 active:scale-95"
      aria-label="Ouvrir l'assistant de recherche"
    >
      <Sparkles className="w-5 h-5" />
      Assistant
    </Link>
  )
}
