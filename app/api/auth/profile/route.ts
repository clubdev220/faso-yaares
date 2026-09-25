import { NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'
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

// Choix produit (comme avant sur le web) : tout compte qui complète son
// profil reçoit le badge « Vérifié ». is_verified est écrit avec la clé
// serveur ; en cas d'échec, l'enregistrement du profil n'est pas bloqué.
async function markVerified(userId: string): Promise<boolean> {
  try {
    const admin = await createAdminClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (admin.from('users') as any)
      .update({ is_verified: true })
      .eq('id', userId)
      .select('id')
    if (error) {
      console.error('Profile verify error:', error)
      return false
    }
    return Array.isArray(data) && data.length > 0
  } catch (err) {
    console.error('Profile verify error:', err)
    return false
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

    const verified = await markVerified(user.id)

    return NextResponse.json({
      profile: { ...(profile as Profile), ...(verified ? { is_verified: true } : {}) },
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
