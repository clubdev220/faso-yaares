import type { User as AuthUser } from '@supabase/supabase-js'
import type { AnySupabaseClient } from '@/lib/supabase/types'
import type { User as Profile } from '@/types'

export function getUserPhone(user: AuthUser): string {
  const metadataPhone =
    typeof user.user_metadata?.phone === 'string' ? user.user_metadata.phone : ''
  const rawPhone =
    typeof user.user_metadata?.phone_number === 'string' ? user.user_metadata.phone_number : ''
  const identityPhone = user.identities?.find((identity) => {
    return typeof identity.identity_data?.phone === 'string'
  })?.identity_data?.phone

  const phone =
    user.phone || metadataPhone || rawPhone || (typeof identityPhone === 'string' ? identityPhone : '')
  if (!phone) return ''
  return phone.startsWith('+') ? phone : `+${phone}`
}

// Nom fourni par le fournisseur (Google) ou saisi à l'inscription e-mail.
export function getUserMetadataName(user: AuthUser): string {
  const fullName =
    typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name.trim() : ''
  const name = typeof user.user_metadata?.name === 'string' ? user.user_metadata.name.trim() : ''
  return fullName || name
}

export function isProfileComplete(profile: Profile | null): boolean {
  const fullName = profile?.full_name?.trim()
  return Boolean(fullName && fullName !== 'Utilisateur' && profile?.city?.trim())
}

// Aucun trigger ne crée la ligne public.users : chaque connexion (SMS,
// e-mail, Google) passe par la RPC ensure_profile, qui ne fait rien si le
// profil existe déjà. Fonctionne avec la session de l'utilisateur (RLS).
export async function ensureProfile(supabase: AnySupabaseClient, user: AuthUser): Promise<Profile> {
  const phone = getUserPhone(user) || null
  const email = user.email || null

  const { error: rpcError } = await supabase.rpc('ensure_profile', {
    p_phone: phone,
    p_email: email,
  })
  if (rpcError) throw rpcError

  const { data, error } = await supabase.from('users').select('*').eq('id', user.id).single()
  if (error) throw error

  let profile = data as Profile
  const metadataName = getUserMetadataName(user)

  if (!profile.full_name && metadataName) {
    const { data: updated, error: updateError } = await supabase
      .from('users')
      .update({ full_name: metadataName })
      .eq('id', user.id)
      .select('*')
      .single()
    if (!updateError && updated) profile = updated as Profile
  }

  return profile
}
