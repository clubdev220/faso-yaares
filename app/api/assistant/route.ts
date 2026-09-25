import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Relais vers l'Edge Function ai-search (déjà déployée, non modifiée).
// La fonction ne gère pas CORS : un appel direct depuis le navigateur est
// bloqué dès la requête de pré-vérification. Le serveur Next l'appelle donc
// à la place du navigateur, avec le jeton de l'utilisateur connecté (quota
// « connecté ») ou la clé anon (quota « visiteur », par appareil).

type Turn = { role: 'user' | 'assistant'; content: string }

const MAX_TURNS = 20
const MAX_CONTENT = 1000

function sanitize(raw: unknown): Turn[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter(
      (m): m is Turn =>
        Boolean(m) &&
        (m.role === 'user' || m.role === 'assistant') &&
        typeof m.content === 'string' &&
        m.content.trim().length > 0
    )
    .slice(-MAX_TURNS)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CONTENT) }))
}

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !anonKey) {
    return NextResponse.json({ error: 'assistant_unavailable' }, { status: 503 })
  }

  const body = (await request.json().catch(() => ({}))) as { messages?: unknown; deviceId?: unknown }
  const messages = sanitize(body.messages)
  if (messages.length === 0 || messages[messages.length - 1].role !== 'user') {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 })
  }
  const deviceId = typeof body.deviceId === 'string' ? body.deviceId.slice(0, 64) : 'none'

  let token = anonKey
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.access_token) token = session.access_token
    }
  } catch {
    // pas de session : visiteur
  }

  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim()

  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/ai-search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        apikey: anonKey,
        ...(clientIp ? { 'x-forwarded-for': clientIp } : {}),
      },
      body: JSON.stringify({ messages, deviceId }),
      cache: 'no-store',
    })

    const data = (await res.json().catch(() => ({}))) as {
      reply?: unknown
      listing_ids?: unknown
      error?: unknown
    }

    if (res.status === 429) {
      return NextResponse.json({ error: 'quota_exceeded' }, { status: 429 })
    }
    if (!res.ok) {
      return NextResponse.json({ error: 'assistant_unavailable' }, { status: 502 })
    }

    return NextResponse.json({
      reply: typeof data.reply === 'string' ? data.reply : '',
      listing_ids: Array.isArray(data.listing_ids)
        ? data.listing_ids.filter((id): id is string => typeof id === 'string')
        : [],
    })
  } catch {
    return NextResponse.json({ error: 'assistant_unavailable' }, { status: 502 })
  }
}
