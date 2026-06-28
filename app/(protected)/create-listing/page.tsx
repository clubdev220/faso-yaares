import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/server'
import { ListingForm } from '@/components/listings/ListingForm'
import type { Category } from '@/types'

export const metadata: Metadata = {
  title: 'Publier une annonce',
  description: 'Publiez votre annonce gratuitement sur Yaaré.',
}

export default async function CreateListingPage() {
  const supabase = await createAdminClient()
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true })
    .order('name', { ascending: true })

  if (error) {
    console.error('Categories load error:', error)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-heading font-bold text-gray-900 mb-6">
        Publier une annonce
      </h1>
      <ListingForm categories={(categories || []) as Category[]} />
    </div>
  )
}
