import type { Metadata } from 'next'
import { Users, Package, Flag, Eye } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'Administration - Dashboard' }

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const [usersCount, listingsCount, reportsCount, viewsResult] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('listings').select('views_count').eq('status', 'active'),
  ])

  const totalViews = ((viewsResult.data || []) as { views_count: number }[]).reduce(
    (sum, l) => sum + (l.views_count || 0), 0
  )

  const stats = [
    { label: 'Utilisateurs', value: usersCount.count || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Annonces actives', value: listingsCount.count || 0, icon: Package, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Signalements', value: reportsCount.count || 0, icon: Flag, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Vues totales', value: totalViews, icon: Eye, color: 'text-purple-600', bg: 'bg-purple-50' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center flex-shrink-0`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold text-gray-900">
                {stat.value.toLocaleString('fr-BF')}
              </p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
