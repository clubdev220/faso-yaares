import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import type { AnySupabaseClient } from '@/lib/supabase/types'
import { PUBLIC_PROFILE_COLUMNS } from '@/lib/api/select'
import { ConversationView, type ConversationListing } from '@/components/messages/ConversationView'
import type { PublicProfile } from '@/types'

export const metadata: Metadata = {
  title: 'Conversation',
}

export const dynamic = 'force-dynamic'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

interface PageProps {
  params: Promise<{ userId: string }>
  searchParams: Promise<{ listing?: string }>
}

// L'annonce peut ne plus être visible publiquement (vendue, expirée) alors
// que la conversation continue : on la lit avec le client serveur habituel
// du site, et à défaut avec la session.
async function getListing(listingId: string): Promise<ConversationListing | null> {
  const columns =
    'id, title, price, currency, status, user_id, images:listing_images(id, url, thumbnail_url, display_order)'
  try {
    const admin = (await createAdminClient()) as unknown as AnySupabaseClient
    const { data } = await admin.from('listings').select(columns).eq('id', listingId).maybeSingle()
    if (data) return data as ConversationListing
  } catch {
    // clé serveur absente : on retombe sur la session
  }
  const supabase = (await createClient()) as unknown as AnySupabaseClient
  const { data } = await supabase.from('listings').select(columns).eq('id', listingId).maybeSingle()
  return (data as ConversationListing) ?? null
}

export default async function ConversationPage({ params, searchParams }: PageProps) {
  const { userId: otherUserId } = await params
  const { listing: listingParam } = await searchParams

  if (!UUID_RE.test(otherUserId)) notFound()
  const listingId = listingParam && UUID_RE.test(listingParam) ? listingParam : null

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  if (user.id === otherUserId) redirect('/messages')

  const db = supabase as unknown as AnySupabaseClient
  const [profileRes, listing] = await Promise.all([
    db.from('public_profiles').select(PUBLIC_PROFILE_COLUMNS).eq('id', otherUserId).maybeSingle(),
    listingId ? getListing(listingId) : Promise.resolve(null),
  ])

  const otherUser = (profileRes.data as PublicProfile | null) ?? null
  if (!otherUser) notFound()

  return (
    <ConversationView
      userId={user.id}
      otherUser={otherUser}
      listingId={listingId}
      listing={listing}
    />
  )
}
