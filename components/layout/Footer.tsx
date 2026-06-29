import Link from 'next/link'
import { LogoSVG } from '@/components/common/LogoSVG'
import { Phone, MessageCircle, MapPin } from 'lucide-react'

const navigationLinks = [
  { href: '/', label: 'Accueil' },
  { href: '/listings', label: 'Annonces' },
  { href: '/categories', label: 'Catégories' },
  { href: '/create-listing', label: 'Publier une annonce' },
]

const categoryLinks = [
  { href: '/listings?category=vehicules', label: 'Véhicules' },
  { href: '/listings?category=telephones', label: 'Téléphones' },
  { href: '/listings?category=immobilier', label: 'Immobilier' },
  { href: '/listings?category=electronique', label: 'Électronique' },
  { href: '/listings?category=mode', label: 'Mode' },
]

const legalLinks = [
  { href: '/faq', label: 'Questions fréquentes' },
  { href: '/cgu', label: "Conditions d'utilisation" },
  { href: '/cgv', label: 'Conditions de vente' },
  { href: '/cookies', label: 'Politique des cookies' },
  { href: '/privacy', label: 'Confidentialité des données' },
]

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto hidden lg:block">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <LogoSVG className="h-[120px] mb-6" />
            <p className="text-sm text-gray-400 leading-relaxed">
              Le marché en ligne du Burkina Faso. Achetez et vendez facilement près de chez vous.
            </p>
            <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
              <MapPin className="w-3 h-3" />
              <span>Ouagadougou, Burkina Faso</span>
            </div>
          </div>

          <div>
            <h3 className="text-white font-heading font-semibold text-sm mb-4">Navigation</h3>
            <ul className="space-y-2 text-sm">
              {navigationLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-heading font-semibold text-sm mb-4">Catégories</h3>
            <ul className="space-y-2 text-sm">
              {categoryLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-heading font-semibold text-sm mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-gray-400">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <span>+226 76 72 14 13</span>
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <MessageCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <a
                  href="https://wa.me/22676721413"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  WhatsApp Support
                </a>
              </li>
            </ul>

            <div className="mt-4 space-y-2 text-sm">
              {legalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Yaaré. Tous droits réservés.</p>
          <p>Fait au Burkina Faso</p>
        </div>
      </div>
    </footer>
  )
}
