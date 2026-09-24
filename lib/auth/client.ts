'use client'

// Garde le nom et la ville saisis à l'inscription e-mail jusqu'à la
// confirmation par code : avant, il n'y a pas de session, donc rien ne peut
// être écrit dans le profil.
const PENDING_SIGNUP_KEY = 'yaare:pending-email-signup'

export type PendingEmailSignup = {
  email: string
  full_name: string
  city: string
}

export function savePendingEmailSignup(value: PendingEmailSignup) {
  try {
    sessionStorage.setItem(PENDING_SIGNUP_KEY, JSON.stringify(value))
  } catch {
    // stockage indisponible (navigation privée) : la page de code le signalera
  }
}

export function readPendingEmailSignup(): PendingEmailSignup | null {
  try {
    const raw = sessionStorage.getItem(PENDING_SIGNUP_KEY)
    return raw ? (JSON.parse(raw) as PendingEmailSignup) : null
  } catch {
    return null
  }
}

export function clearPendingEmailSignup() {
  try {
    sessionStorage.removeItem(PENDING_SIGNUP_KEY)
  } catch {
    // ignore
  }
}

// Après toute connexion : /api/auth/profile appelle ensure_profile puis dit
// si le profil est complet (nom + ville).
export async function getPostLoginPath(redirectTo: string): Promise<string> {
  const res = await fetch('/api/auth/profile')
  const result = (await res.json()) as { isComplete?: boolean; error?: string }

  if (!res.ok) {
    throw new Error(result.error || 'Erreur lors de la verification du profil')
  }

  if (!result.isComplete) {
    return redirectTo.startsWith('/register')
      ? redirectTo
      : `/register?redirect=${encodeURIComponent(redirectTo)}`
  }

  return redirectTo.startsWith('/register') ? '/dashboard' : redirectTo
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}
