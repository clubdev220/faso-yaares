import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import type { Category } from '@/types'

export async function GET() {
  try {
    const supabase = await createAdminClient()

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order')

    if (error) throw error

    const cats = (data || []) as unknown as Category[]
    const roots = cats.filter((c) => !c.parent_id)
    const hierarchy = roots.map((root) => ({
      ...root,
      children: cats.filter((c) => c.parent_id === root.id),
    }))

    return NextResponse.json({ categories: hierarchy })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
