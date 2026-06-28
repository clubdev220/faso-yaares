import { NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { reportSchema } from '@/lib/validations'

export async function POST(request: Request) {
  try {
    const authClient = await createClient()
    const { data: { user } } = await authClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Connexion requise' }, { status: 401 })

    const body = await request.json().catch(() => ({}))
    const parsed = reportSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
    }

    const admin = await createAdminClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (admin.from('reports') as any).insert({
      listing_id: parsed.data.listing_id,
      reporter_id: user.id,
      reason: parsed.data.reason,
      details: parsed.data.details || null,
    })

    if (error) {
      console.error('Report insert error:', error)
      return NextResponse.json({ error: 'Erreur lors du signalement' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
