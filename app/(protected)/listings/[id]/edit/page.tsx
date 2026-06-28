import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, AlertTriangle } from 'lucide-react'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { ListingForm } from '@/components/listings/ListingForm'
import type { Category, Listing } from '@/types'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createAdminClient()
  const { data } = await supabase.from('listings').select('title').eq('id', id).single()
  return { title: data ? `Modifier : ${data.title}` : 'Modifier l\'annonce' }
}

export default async function EditListingPage({ params }: PageProps) {
  const { id } = await params

  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) redirect('/login')

  const admin = await createAdminClient()

  const [listingResult, categoriesResult] = await Promise.all([
    admin
      .from('listings')
      .select('*, images:listing_images(id,url,thumbnail_url,display_order)')
      .eq('id', id)
      .eq('user_id', user.id)
      .neq('status', 'deleted')
      .single(),
    admin
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true })
      .order('name', { ascending: true }),
  ])

  if (listingResult.error || !listingResult.data) notFound()

  const listing = listingResult.data as unknown as Listing
  const categories = (categoriesResult.data || []) as Category[]

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-4"
      >
        <ChevronLeft className="w-4 h-4" />
        Retour à mes annonces
      </Link>

      <h1 className="text-2xl font-heading font-bold text-gray-900 mb-6">
        Modifier l&apos;annonce
      </h1>

      {listing.status === 'suspended' && (
        <div className="mb-6 flex items-start gap-3 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
          <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-orange-800">Annonce suspendue</p>
            <p className="text-xs text-orange-600 mt-0.5">
              En sauvegardant vos modifications, l&apos;annonce sera automatiquement soumise à l&apos;équipe de modération pour réexamen.
            </p>
          </div>
        </div>
      )}

      <ListingForm categories={categories} listing={listing} />
    </div>
  )
}
