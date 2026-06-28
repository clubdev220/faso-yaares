import type { ReactNode } from 'react'
import Link from 'next/link'

type LegalPageProps = {
  title: string
  description: string
  updatedAt?: string
  children: ReactNode
}

type LegalSectionProps = {
  number?: number | string
  title: string
  children: ReactNode
}

const relatedDocs = [
  { href: '/faq', label: 'Questions fréquentes' },
  { href: '/cgu', label: "Conditions d'utilisation" },
  { href: '/cgv', label: 'Conditions de vente' },
  { href: '/privacy', label: 'Confidentialité des données' },
  { href: '/cookies', label: 'Politique des cookies' },
]

export function LegalPage({ title, description, updatedAt, children }: LegalPageProps) {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero header */}
      <div className="bg-gradient-to-br from-primary via-primary to-primary-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <p className="text-primary-200 text-xs font-semibold uppercase tracking-widest mb-4">
            Yaaré · Documents officiels
          </p>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-4 leading-tight">
            {title}
          </h1>
          <p className="text-primary-100 text-base sm:text-lg leading-relaxed max-w-2xl">
            {description}
          </p>
          {updatedAt && (
            <div className="mt-6 inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm text-primary-100">
              <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
              Mise à jour le {updatedAt}
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-50">{children}</div>
        </div>

        {/* Related documents */}
        <div className="mt-10 pt-8 border-t border-gray-200">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Autres documents
          </p>
          <div className="flex flex-wrap gap-2">
            {relatedDocs.map((doc) => (
              <Link
                key={doc.href}
                href={doc.href}
                className="text-sm text-gray-500 hover:text-primary border border-gray-200 hover:border-primary/50 bg-white rounded-full px-4 py-1.5 transition-colors"
              >
                {doc.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function LegalSection({ number, title, children }: LegalSectionProps) {
  return (
    <section className="px-6 py-8 sm:px-10">
      <div className="flex gap-4 sm:gap-6">
        {number !== undefined && (
          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center mt-0.5">
            {number}
          </div>
        )}
        <div className="flex-1">
          <h2 className="font-heading text-lg sm:text-xl font-semibold text-gray-900 mb-3">
            {title}
          </h2>
          <div className="text-gray-600 leading-7 text-sm sm:text-base space-y-3">
            {children}
          </div>
        </div>
      </div>
    </section>
  )
}
