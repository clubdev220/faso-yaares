'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, PlusCircle, Heart, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  {
    href: '/',
    label: 'Accueil',
    icon: Home,
    exact: true,
  },
  {
    href: '/listings',
    label: 'Explorer',
    icon: Search,
    exact: false,
  },
  {
    href: '/create-listing',
    label: 'Vendre',
    icon: PlusCircle,
    exact: true,
    highlight: true,
  },
  {
    href: '/favorites',
    label: 'Favoris',
    icon: Heart,
    exact: false,
  },
  {
    href: '/profile',
    label: 'Profil',
    icon: User,
    exact: false,
  },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-lg lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href)

          if (item.highlight) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-6"
                aria-label={item.label}
              >
                <div
                  className={cn(
                    'w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95',
                    isActive
                      ? 'bg-primary-600 shadow-primary/40'
                      : 'bg-primary shadow-primary/30'
                  )}
                >
                  <item.icon className="w-7 h-7 text-white" strokeWidth={2} />
                </div>
                <span className="text-xs text-primary font-medium mt-1">{item.label}</span>
              </Link>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-0.5 px-2 py-1 min-w-[56px]"
              aria-label={item.label}
            >
              <item.icon
                className={cn(
                  'w-6 h-6 transition-colors',
                  isActive ? 'text-primary' : 'text-gray-400'
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={cn(
                  'text-xs font-medium transition-colors',
                  isActive ? 'text-primary' : 'text-gray-400'
                )}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
