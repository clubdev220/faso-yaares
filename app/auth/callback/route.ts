import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ensureProfile, isProfileComplete } from '@/lib/auth/profile'
import { getSafeRedirectPath } from '@/lib/utils'

// Derrière le proxy de l'hébergeur, request.url peut porter l'hôte ou le
// protocole internes : on privilégie les en-têtes transmis par le proxy.
function getOrigin(request: Request, url: URL): string {
  const host = request.headers.get('x-forwarded-host')
  const proto = request.headers.get('x-forwarded-proto')
  if (host) return `${proto || 'https'}://${host}`
  return url.origin
}

// Retour de Google (signInWithOAuth) et des liens e-mail (mot de passe
// oublié) : échange le code PKCE contre une session, crée le profil si
// besoin, puis envoie vers la complétion du profil ou la page demandée.
export async function GET(request: Request) {
  const url = new URL(request.url)
  const origin = getOrigin(request, url)
  const code = url.searchParams.get('code')
  const redirectTo = getSafeRedirectPath(url.searchParams.get('redirect'), '/dashboard')
  const loginUrl = new URL('/login', origin)

  if (!code) {
    loginUrl.searchParams.set('error', 'auth')
    return NextResponse.redirect(loginUrl)
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.user) {
    loginUrl.searchParams.set('error', 'auth')
    return NextResponse.redirect(loginUrl)
  }

  try {
    const profile = await ensureProfile(supabase, data.user)

    if (redirectTo !== '/reset-password' && !isProfileComplete(profile)) {
      const registerUrl = new URL('/register', origin)
      registerUrl.searchParams.set('redirect', redirectTo)
      return NextResponse.redirect(registerUrl)
    }
  } catch (err) {
    console.error('Auth callback profile error:', err)
  }

  return NextResponse.redirect(new URL(redirectTo, origin))
}
