import { NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'

async function getAuthUser() {
  const authClient = await createClient()
  const { data: { user }, error } = await authClient.auth.getUser()
  if (error || !user) return null
  return user
}

// GET /api/favorites?listing_id=xxx — check if the current user favorited a listing
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const listingId = searchParams.get('listing_id')
  if (!listingId) return NextResponse.json({ isFavorite: false })

  const user = await getAuthUser()
  if (!user) return NextResponse.json({ isFavorite: false })

  const admin = await createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (admin.from('favorites') as any)
    .select('id')
    .eq('user_id', user.id)
    .eq('listing_id', listingId)
    .maybeSingle()

  return NextResponse.json({ isFavorite: !!data })
}

// POST /api/favorites — add a favorite
export async function POST(request: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Connexion requise' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const listingId = body.listing_id
  if (!listingId) return NextResponse.json({ error: 'listing_id requis' }, { status: 400 })

  const admin = await createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin.from('favorites') as any)
    .insert({ user_id: user.id, listing_id: listingId })

  if (error && !error.message?.includes('duplicate')) {
    console.error('Favorites insert error:', error)
    return NextResponse.json({ error: 'Erreur lors de l\'ajout' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

// DELETE /api/favorites?listing_id=xxx — remove a favorite
export async function DELETE(request: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Connexion requise' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const listingId = searchParams.get('listing_id')
  if (!listingId) return NextResponse.json({ error: 'listing_id requis' }, { status: 400 })

  const admin = await createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin.from('favorites') as any)
    .delete()
    .eq('user_id', user.id)
    .eq('listing_id', listingId)

  if (error) {
    console.error('Favorites delete error:', error)
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
