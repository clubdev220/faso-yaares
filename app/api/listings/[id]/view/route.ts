import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const admin = await createAdminClient()

    // Try the RPC function first (atomic increment)
    const { error: rpcError } = await (admin.rpc as (fn: string, args: Record<string, string>) => Promise<{ error: unknown }>)(
      'increment_views',
      { listing_id: id }
    )

    if (rpcError) {
      // Fallback: read-then-write (non-atomic but acceptable for view counts)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (admin.from('listings') as any)
        .select('views_count')
        .eq('id', id)
        .eq('status', 'active')
        .single()

      if (data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (admin.from('listings') as any)
          .update({ views_count: (data.views_count || 0) + 1 })
          .eq('id', id)
          .eq('status', 'active')
      }
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true }) // never fail the page for a view count
  }
}
