import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ensureProfile, isProfileComplete } from '@/lib/auth/profile'
import { profileSchema } from '@/lib/validations'
import type { User as Profile } from '@/types'

async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return { supabase, user: null }
  }

  return { supabase, user }
}

export async function GET() {
  try {
    const { supabase, user } = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Non authentifie' }, { status: 401 })
    }

    const profile = await ensureProfile(supabase, user)
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
    const { supabase, user } = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Non authentifie' }, { status: 401 })
    }

    const body = await request.json()
    const profileInput = profileSchema.parse(body)

    await ensureProfile(supabase, user)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const usersTable = supabase.from('users') as any
    const { data: profile, error } = await usersTable
      .update({
        full_name: profileInput.full_name,
        city: profileInput.city,
        neighborhood: profileInput.neighborhood?.trim() || null,
      })
      .eq('id', user.id)
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
