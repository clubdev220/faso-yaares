import Link from 'next/link'
import { LogoSVG } from '@/components/common/LogoSVG'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-accent/5 flex flex-col">
      {/* Header */}
      <header className="px-4 py-4 flex justify-center">
        <Link href="/" className="inline-flex">
          <LogoSVG />
        </Link>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="text-center pb-6 text-xs text-gray-400">
        <p>
          En continuant, vous acceptez nos{' '}
          <Link href="/cgu" className="text-primary hover:underline">
            Conditions d&apos;utilisation
          </Link>{' '}
          et notre{' '}
          <Link href="/privacy" className="text-primary hover:underline">
            Politique de confidentialité
          </Link>
        </p>
      </footer>
    </div>
  )
}
