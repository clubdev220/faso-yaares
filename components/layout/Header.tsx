'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Search, Bell, User, Plus, Menu, X, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LogoSVG } from '@/components/common/LogoSVG'

interface HeaderProps {
  user?: { full_name?: string | null; avatar_url?: string | null } | null
}

export function Header({ user }: HeaderProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const legalLinks = [
    { href: '/faq', label: 'Questions fréquentes' },
    { href: '/cgu', label: "Conditions d'utilisation" },
    { href: '/cgv', label: 'Conditions de vente' },
    { href: '/cookies', label: 'Politique des cookies' },
    { href: '/privacy', label: 'Confidentialité des données' },
  ]

  const navLinks = [
    { href: '/', label: 'Accueil' },
    { href: '/listings', label: 'Annonces' },
    { href: '/categories', label: 'Catégories' },
  ]

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <LogoSVG className="h-9" />
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl mx-6">
            <Link
              href="/listings"
              className="w-full flex items-center gap-3 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-400 hover:border-primary/50 hover:bg-primary/5 transition-colors"
            >
              <Search className="w-4 h-4 text-gray-400" />
              <span className="text-sm">Rechercher une annonce...</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'text-primary bg-primary/10'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2 ml-4">
            {user ? (
              <>
                <Link
                  href="/favorites"
                  className="p-2 text-gray-500 hover:text-secondary hover:bg-red-50 rounded-xl transition-colors"
                  aria-label="Mes favoris"
                >
                  <Heart className="w-5 h-5" />
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  {user.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.avatar_url}
                      alt={user.full_name || 'Profil'}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <span className="max-w-[100px] truncate">{user.full_name || 'Profil'}</span>
                </Link>
                <Link
                  href="/create-listing"
                  className="btn-primary btn-md flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Publier
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  href="/create-listing"
                  className="btn-primary btn-md flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Publier une annonce
                </Link>
              </>
            )}
          </div>

          {/* Mobile: Search + Menu toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <Link
              href="/listings"
              className="p-2 text-gray-500 hover:text-gray-900 rounded-xl"
              aria-label="Rechercher"
            >
              <Search className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-500 hover:text-gray-900 rounded-xl"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 animate-slide-up">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center px-3 py-2.5 rounded-xl text-sm font-medium',
                  pathname === link.href
                    ? 'text-primary bg-primary/10'
                    : 'text-gray-700 hover:bg-gray-50'
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-gray-100">
              {user ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <User className="w-4 h-4 text-primary" />
                    Mon profil
                  </Link>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <Bell className="w-4 h-4 text-primary" />
                    Mes annonces
                  </Link>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 rounded-xl text-sm font-medium text-gray-700"
                >
                  Se connecter
                </Link>
              )}
            </div>

            <div className="pt-2 border-t border-gray-100">
              <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Aide et légal
              </p>
              {legalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center px-3 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
