import { NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    const admin = await createAdminClient()
    const { data: profile } = await admin
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    return NextResponse.json({ user: { ...user, profile } })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
