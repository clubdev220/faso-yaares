import { NextResponse } from 'next/server'
import type { User as AuthUser } from '@supabase/supabase-js'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { profileSchema } from '@/lib/validations'
import type { User as Profile } from '@/types'

function getUserPhone(user: AuthUser): string {
  const metadataPhone =
    typeof user.user_metadata?.phone === 'string' ? user.user_metadata.phone : ''
  const rawPhone =
    typeof user.user_metadata?.phone_number === 'string' ? user.user_metadata.phone_number : ''
  const identityPhone = user.identities?.find((identity) => {
    return typeof identity.identity_data?.phone === 'string'
  })?.identity_data?.phone

  return user.phone || metadataPhone || rawPhone || (typeof identityPhone === 'string' ? identityPhone : '')
}

function isProfileComplete(profile: Profile | null): boolean {
  const fullName = profile?.full_name?.trim()
  return Boolean(fullName && fullName !== 'Utilisateur' && profile?.city?.trim())
}

async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return { user: null, error }
  }

  return { user, error: null }
}

async function ensureProfile(user: AuthUser): Promise<Profile> {
  const admin = await createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const usersTable = admin.from('users') as any

  const { data: existingProfile, error: lookupError } = await usersTable
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (lookupError) {
    throw lookupError
  }

  if (existingProfile) {
    return existingProfile as Profile
  }

  const phone = getUserPhone(user).trim() || `user:${user.id}`
  const { data: createdProfile, error: createError } = await usersTable
    .insert({
      id: user.id,
      phone,
      full_name: 'Utilisateur',
      is_verified: true,
    })
    .select('*')
    .single()

  if (createError) {
    throw createError
  }

  return createdProfile as Profile
}

export async function GET() {
  try {
    const { user } = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Non authentifie' }, { status: 401 })
    }

    const profile = await ensureProfile(user)
    return NextResponse.json({
      profile,
      isComplete: isProfileComplete(profile),
    })
  } catch (err) {
    console.error('Profile fetch error:', err)
    return NextResponse.json({ error: 'Erreur lors du chargement du profil' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { user } = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Non authentifie' }, { status: 401 })
    }

    const body = await request.json()
    const profileInput = profileSchema.parse(body)
    const phone = getUserPhone(user).trim() || `user:${user.id}`

    const admin = await createAdminClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const usersTable = admin.from('users') as any
    const { data: profile, error } = await usersTable
      .upsert(
        {
          id: user.id,
          phone,
          full_name: profileInput.full_name,
          city: profileInput.city,
          neighborhood: profileInput.neighborhood?.trim() || null,
          is_verified: true,
        },
        { onConflict: 'id' }
      )
      .select('*')
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      profile: profile as Profile,
      isComplete: true,
    })
  } catch (err) {
    if (err && typeof err === 'object' && 'issues' in err) {
      return NextResponse.json({ error: 'Donnees invalides' }, { status: 400 })
    }

    console.error('Profile update error:', err)
    return NextResponse.json({ error: 'Erreur lors de la mise a jour du profil' }, { status: 500 })
  }
}
