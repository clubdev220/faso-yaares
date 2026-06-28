import Link from 'next/link'
import { Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <div className="text-8xl mb-6">🔍</div>
      <h1 className="text-3xl font-heading font-bold text-gray-900 mb-2">Page introuvable</h1>
      <p className="text-gray-500 mb-8 max-w-sm">
        La page que vous cherchez n&apos;existe pas ou a été déplacée.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/" className="btn-primary btn-lg">
          <Home className="w-5 h-5" />
          Retour à l&apos;accueil
        </Link>
        <Link href="/listings" className="btn-outline btn-lg">
          <Search className="w-5 h-5" />
          Voir les annonces
        </Link>
      </div>
    </div>
  )
}
