'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Check, CheckCheck, MessageCircle } from 'lucide-react'
import { createUntypedClient } from '@/lib/supabase/client'
import {
  getThreads,
  markAllDelivered,
  subscribeToIncomingMessages,
} from '@/lib/api/messaging'
import { SellerAvatar } from '@/components/sellers/SellerAvatar'
import { cn, formatMessageTimestamp } from '@/lib/utils'
import type { MessageThread } from '@/types'

export function ThreadList({ userId }: { userId: string }) {
  const [threads, setThreads] = useState<MessageThread[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    const supabase = createUntypedClient()
    try {
      // Ouvrir la liste = messages « distribués » (pas encore lus).
      await markAllDelivered(supabase, userId).catch(() => {})
      setThreads(await getThreads(supabase, userId))
      setError(null)
    } catch {
      setError('Impossible de charger les messages pour le moment.')
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    void load()
    const supabase = createUntypedClient()
    const channel = subscribeToIncomingMessages(supabase, userId, () => void load())
    return () => {
      void supabase.removeChannel(channel)
    }
  }, [load, userId])

  if (isLoading) {
    return (
      <div className="card divide-y divide-gray-100">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-3 p-4">
            <div className="skeleton w-12 h-12 rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-4 w-1/3 rounded" />
              <div className="skeleton h-3 w-2/3 rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return <p className="text-center text-sm text-gray-500 py-12">{error}</p>
  }

  if (threads.length === 0) {
    return (
      <div className="text-center py-16">
        <MessageCircle className="w-16 h-16 text-gray-200 mx-auto mb-4" />
        <h2 className="text-lg font-heading font-semibold text-gray-900 mb-2">
          Aucune conversation
        </h2>
        <p className="text-gray-500 mb-6 text-sm">
          Contactez un vendeur depuis une annonce pour démarrer une conversation.
        </p>
        <Link href="/listings" className="btn-primary btn-md">
          Voir les annonces
        </Link>
      </div>
    )
  }

  return (
    <ul className="card divide-y divide-gray-100 overflow-hidden">
      {threads.map((thread) => {
        const images = [...(thread.listing?.images ?? [])].sort(
          (a, b) => a.display_order - b.display_order
        )
        const cover = images[0]?.thumbnail_url || images[0]?.url
        const isUnread = thread.unread_count > 0
        const last = thread.last_message
        const isMine = last.sender_id === userId
        const href = `/messages/${thread.other_user_id}${
          thread.listing_id ? `?listing=${thread.listing_id}` : ''
        }`

        return (
          <li key={`${thread.other_user_id}:${thread.listing_id ?? 'none'}`}>
            <Link
              href={href}
              className={cn(
                'flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors',
                isUnread && 'bg-primary/5'
              )}
            >
              {cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cover} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
              ) : (
                <SellerAvatar
                  url={thread.other_participant?.avatar_url}
                  name={thread.other_participant?.full_name}
                  className="w-12 h-12"
                  textClassName="text-lg"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <p
                    className={cn(
                      'text-sm truncate',
                      isUnread ? 'font-bold text-gray-900' : 'font-medium text-gray-800'
                    )}
                  >
                    {thread.other_participant?.full_name || 'Utilisateur'}
                  </p>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {formatMessageTimestamp(last.created_at)}
                  </span>
                </div>
                {thread.listing && (
                  <p className="text-xs text-gray-400 truncate">{thread.listing.title}</p>
                )}
                <div className="flex items-center gap-1.5 mt-0.5">
                  {isMine &&
                    (last.is_read ? (
                      <CheckCheck className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    ) : last.delivered_at ? (
                      <CheckCheck className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    ) : (
                      <Check className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    ))}
                  <p
                    className={cn(
                      'text-sm truncate flex-1',
                      isUnread ? 'text-gray-900 font-medium' : 'text-gray-500'
                    )}
                  >
                    {last.content}
                  </p>
                  {isUnread && (
                    <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {thread.unread_count}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
