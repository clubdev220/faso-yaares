'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { createUntypedClient } from '@/lib/supabase/client'
import { getUnreadCount, subscribeToIncomingMessages } from '@/lib/api/messaging'
import { cn } from '@/lib/utils'

interface MessagesLinkProps {
  className?: string
  onClick?: () => void
  showLabel?: boolean
}

// Lien vers /messages avec le nombre de messages non lus, mis à jour en
// temps réel.
export function MessagesLink({ className, onClick, showLabel = false }: MessagesLinkProps) {
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    const supabase = createUntypedClient()
    let channel: ReturnType<typeof subscribeToIncomingMessages> | null = null
    let cancelled = false

    supabase.auth.getUser().then(({ data }) => {
      const userId = data.user?.id
      if (!userId || cancelled) return
      const refresh = () => {
        getUnreadCount(supabase, userId).then((count) => {
          if (!cancelled) setUnread(count)
        })
      }
      refresh()
      channel = subscribeToIncomingMessages(supabase, userId, refresh)
    })

    return () => {
      cancelled = true
      if (channel) void supabase.removeChannel(channel)
    }
  }, [])

  return (
    <Link
      href="/messages"
      onClick={onClick}
      className={cn('relative', className)}
      aria-label={unread > 0 ? `Messages (${unread} non lus)` : 'Messages'}
    >
      <span className="relative inline-flex">
        <MessageCircle className={showLabel ? 'w-4 h-4 text-primary' : 'w-5 h-5'} />
        {unread > 0 && (
          <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-secondary text-white text-[10px] font-bold flex items-center justify-center">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </span>
      {showLabel && <span>Messages</span>}
    </Link>
  )
}
