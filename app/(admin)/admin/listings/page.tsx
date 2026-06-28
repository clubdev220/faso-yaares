import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { formatPrice, formatDate } from '@/lib/utils'

export const metadata: Metadata = { title: 'Administration - Annonces' }

interface AdminListing {
  id: string
  title: string
  price: number
  status: string
  created_at: string
  city: string
  user: { full_name: string | null; phone: string } | null
  category: { name: string } | null
}

export default async function AdminListingsPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('listings')
    .select('id, title, price, status, created_at, city, user:users(full_name,phone), category:categories(name)')
    .order('created_at', { ascending: false })
    .limit(50)

  const listings = (data || []) as unknown as AdminListing[]

  const statusColors: Record<string, string> = {
    active: 'badge-success',
    sold: 'badge-info',
    expired: 'badge-warning',
    deleted: 'badge-error',
    pending: 'badge-warning',
  }

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-gray-900 mb-6">Modération des annonces</h1>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Annonce</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Vendeur</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Prix</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Statut</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {listings.map((listing) => (
                <tr key={listing.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900 line-clamp-1">{listing.title}</p>
                      <p className="text-xs text-gray-400">{listing.category?.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    <div>
                      <p>{listing.user?.full_name || 'Inconnu'}</p>
                      <p className="text-xs text-gray-400">{listing.user?.phone}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-primary">
                    {formatPrice(listing.price)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${statusColors[listing.status] || 'badge-info'}`}>
                      {listing.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {formatDate(listing.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <a
                        href={`/listings/${listing.id}`}
                        target="_blank"
                        className="text-xs text-primary hover:underline"
                      >
                        Voir
                      </a>
                      {listing.status !== 'deleted' && (
                        <AdminDeleteButton listingId={listing.id} />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

async function deleteListingAction(formData: FormData) {
  'use server'
  const listingId = formData.get('listingId') as string
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('listings') as any).update({ status: 'deleted' }).eq('id', listingId)
}

function AdminDeleteButton({ listingId }: { listingId: string }) {
  return (
    <form action={deleteListingAction}>
      <input type="hidden" name="listingId" value={listingId} />
      <button type="submit" className="text-xs text-red-500 hover:underline">
        Supprimer
      </button>
    </form>
  )
}
