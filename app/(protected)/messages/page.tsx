import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { ThreadList } from '@/components/messages/ThreadList'

export const metadata: Metadata = {
  title: 'Messages',
}

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-heading font-bold text-gray-900 mb-6">Messages</h1>
      <ThreadList userId={user.id} />
    </div>
  )
}
