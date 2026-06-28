import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Package, Flag, Users, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { LogoSVG } from '@/components/common/LogoSVG'

const adminEmails: string[] = [] // Add admin emails here or use a DB flag

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Simple admin check - in production use a proper role system
  if (!user) {
    redirect('/login')
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { href: '/admin/listings', label: 'Annonces', icon: Package },
    { href: '/admin/reports', label: 'Signalements', icon: Flag },
    { href: '/admin/users', label: 'Utilisateurs', icon: Users },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col flex-shrink-0 hidden lg:flex">
        <div className="p-5 border-b border-gray-700">
          <LogoSVG className="brightness-0 invert" />
          <p className="text-xs text-gray-400 mt-1">Administration</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Retour au site
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
