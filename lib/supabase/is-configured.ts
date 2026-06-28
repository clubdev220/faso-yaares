export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  return (
    url.startsWith('https://') &&
    !url.includes('your-project') &&
    key.length > 20 &&
    !key.includes('your-anon-key')
  )
}
