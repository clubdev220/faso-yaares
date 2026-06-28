import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import type { User } from '@/types'

export const metadata: Metadata = { title: 'Administration - Utilisateurs' }

export default async function AdminUsersPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  const users = (data || []) as User[]

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-gray-900 mb-6">Utilisateurs</h1>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Nom</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Téléphone</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Ville</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Statut</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Inscription</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">
                  {user.full_name || '—'}
                </td>
                <td className="px-4 py-3 text-gray-600">{user.phone}</td>
                <td className="px-4 py-3 text-gray-600">{user.city || '—'}</td>
                <td className="px-4 py-3">
                  {user.is_blocked ? (
                    <span className="badge badge-error">Bloqué</span>
                  ) : user.is_verified ? (
                    <span className="badge badge-success">Vérifié</span>
                  ) : (
                    <span className="badge badge-warning">Non vérifié</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-500">{formatDate(user.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
