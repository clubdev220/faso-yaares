import type { RealtimeChannel } from '@supabase/supabase-js'
import type { AnySupabaseClient } from '@/lib/supabase/types'
import { PUBLIC_PROFILE_COLUMNS } from '@/lib/api/select'
import type { Listing, Message, MessageThread, PublicProfile } from '@/types'

// Nom de canal unique à chaque abonnement : removeChannel() étant
// asynchrone, réutiliser un nom renverrait l'ancien canal déjà abonné.
let channelCounter = 0
export function uniqueChannelName(prefix: string): string {
  channelCounter += 1
  return `${prefix}-${Date.now()}-${channelCounter}`
}

function threadKey(otherUserId: string, listingId: string | null): string {
  return `${otherUserId}:${listingId ?? 'none'}`
}

export function belongsToThread(
  message: Message,
  userId: string,
  otherUserId: string,
  listingId: string | null
): boolean {
  const participants =
    (message.sender_id === userId && message.receiver_id === otherUserId) ||
    (message.sender_id === otherUserId && message.receiver_id === userId)
  return participants && (listingId ? message.listing_id === listingId : message.listing_id === null)
}

// Une conversation = (autre participant, annonce). Regroupe tous mes
// messages par conversation puis charge profils et annonces en deux requêtes.
export async function getThreads(supabase: AnySupabaseClient, userId: string): Promise<MessageThread[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('created_at', { ascending: false })
  if (error) throw error

  const messages = (data ?? []) as Message[]
  if (messages.length === 0) return []

  const byThread = new Map<string, Message[]>()
  for (const message of messages) {
    const otherId = message.sender_id === userId ? message.receiver_id : message.sender_id
    const key = threadKey(otherId, message.listing_id)
    byThread.set(key, [...(byThread.get(key) ?? []), message])
  }

  const threads: MessageThread[] = Array.from(byThread.values()).map((group) => {
    const last = group[0]
    const otherId = last.sender_id === userId ? last.receiver_id : last.sender_id
    return {
      other_user_id: otherId,
      listing_id: last.listing_id,
      last_message: last,
      unread_count: group.filter((m) => m.receiver_id === userId && !m.is_read).length,
    }
  })

  const otherIds = Array.from(new Set(threads.map((t) => t.other_user_id)))
  const listingIds = Array.from(
    new Set(threads.map((t) => t.listing_id).filter((id): id is string => Boolean(id)))
  )

  const [profilesRes, listingsRes] = await Promise.all([
    supabase.from('public_profiles').select(PUBLIC_PROFILE_COLUMNS).in('id', otherIds),
    listingIds.length
      ? supabase
          .from('listings')
          .select('id, title, images:listing_images(id, url, thumbnail_url, display_order)')
          .in('id', listingIds)
      : Promise.resolve({ data: [] as unknown[] }),
  ])

  const profileById = new Map(
    ((profilesRes.data ?? []) as PublicProfile[]).map((p) => [p.id, p])
  )
  const listingById = new Map(
    ((listingsRes.data ?? []) as Pick<Listing, 'id' | 'title' | 'images'>[]).map((l) => [l.id, l])
  )

  return threads
    .map((thread) => ({
      ...thread,
      other_participant: profileById.get(thread.other_user_id) ?? null,
      listing: thread.listing_id ? listingById.get(thread.listing_id) ?? null : null,
    }))
    .sort((a, b) => (a.last_message.created_at < b.last_message.created_at ? 1 : -1))
}

export async function getThreadMessages(
  supabase: AnySupabaseClient,
  userId: string,
  otherUserId: string,
  listingId: string | null
): Promise<Message[]> {
  let query = supabase
    .from('messages')
    .select('*')
    .or(
      `and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`
    )
  query = listingId ? query.eq('listing_id', listingId) : query.is('listing_id', null)

  const { data, error } = await query.order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as Message[]
}

export async function sendMessage(
  supabase: AnySupabaseClient,
  senderId: string,
  receiverId: string,
  listingId: string | null,
  content: string
): Promise<Message> {
  const { data, error } = await supabase
    .from('messages')
    .insert({ sender_id: senderId, receiver_id: receiverId, listing_id: listingId, content })
    .select('*')
    .single()
  if (error) throw error
  return data as Message
}

export async function markThreadRead(
  supabase: AnySupabaseClient,
  userId: string,
  otherUserId: string,
  listingId: string | null
): Promise<void> {
  let query = supabase
    .from('messages')
    .update({ is_read: true, delivered_at: new Date().toISOString() })
    .eq('receiver_id', userId)
    .eq('sender_id', otherUserId)
    .eq('is_read', false)
  query = listingId ? query.eq('listing_id', listingId) : query.is('listing_id', null)

  const { error } = await query
  if (error) throw error
}

// Ouverture de la liste des messages = « distribué » (deux coches grises)
// sans toucher à is_read : seule l'ouverture de la conversation vaut lecture.
export async function markAllDelivered(supabase: AnySupabaseClient, userId: string): Promise<void> {
  const { error } = await supabase
    .from('messages')
    .update({ delivered_at: new Date().toISOString() })
    .eq('receiver_id', userId)
    .is('delivered_at', null)
  if (error) throw error
}

export async function getUnreadCount(supabase: AnySupabaseClient, userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .eq('receiver_id', userId)
    .eq('is_read', false)
  if (error) return 0
  return count ?? 0
}

// Les filtres Realtime n'acceptent qu'une égalité : les nouveaux messages
// viennent de l'autre (sender_id = autre), les accusés de lecture sont des
// UPDATE sur mes propres messages (sender_id = moi).
// Nettoyage : supabase.removeChannel(channel), jamais channel.unsubscribe()
// seul (un remontage réutiliserait un canal déjà abonné et planterait).
export function subscribeToThreadMessages(
  supabase: AnySupabaseClient,
  userId: string,
  otherUserId: string,
  onInsert: (message: Message) => void,
  onUpdate: (message: Message) => void
): RealtimeChannel {
  return supabase
    .channel(uniqueChannelName(`messages-${userId}-${otherUserId}`))
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `sender_id=eq.${otherUserId}` },
      (payload) => onInsert(payload.new as Message)
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'messages', filter: `sender_id=eq.${userId}` },
      (payload) => onUpdate(payload.new as Message)
    )
    .subscribe()
}

// Nouveaux messages reçus, toutes conversations confondues (liste, badge).
export function subscribeToIncomingMessages(
  supabase: AnySupabaseClient,
  userId: string,
  onChange: () => void
): RealtimeChannel {
  return supabase
    .channel(uniqueChannelName(`inbox-${userId}`))
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'messages', filter: `receiver_id=eq.${userId}` },
      () => onChange()
    )
    .subscribe()
}

// --- Indicateur « écrit… » ------------------------------------------------
// Éphémère, rien en base : canal Broadcast au nom déterministe (ids triés)
// que les deux participants rejoignent. Le nom étant fixe, un remontage
// rapide (StrictMode, navigation) retomberait sur le canal encore en cours
// de suppression (removeChannel est asynchrone) : on partage donc le canal
// par nom, avec un compteur, et on ne le retire qu'au tick suivant.
type TypingListener = (payload: { userId?: string; isTyping?: boolean }) => void

const typingChannels = new Map<
  string,
  { channel: RealtimeChannel; listeners: Set<TypingListener>; refs: number }
>()

function typingChannelName(userId: string, otherUserId: string, listingId: string | null): string {
  const [a, b] = [userId, otherUserId].sort()
  return `typing-${a}-${b}-${listingId ?? 'none'}`
}

export function subscribeToTyping(
  supabase: AnySupabaseClient,
  userId: string,
  otherUserId: string,
  listingId: string | null,
  onTypingChange: (isTyping: boolean) => void
): { channel: RealtimeChannel; release: () => void } {
  const name = typingChannelName(userId, otherUserId, listingId)
  let entry = typingChannels.get(name)

  if (!entry) {
    const listeners = new Set<TypingListener>()
    const channel = supabase.channel(name)
    channel
      .on('broadcast', { event: 'typing' }, (message) => {
        listeners.forEach((listener) => listener(message.payload ?? {}))
      })
      .subscribe()
    entry = { channel, listeners, refs: 0 }
    typingChannels.set(name, entry)
  }

  const listener: TypingListener = (payload) => {
    if (payload.userId === otherUserId) onTypingChange(Boolean(payload.isTyping))
  }
  entry.listeners.add(listener)
  entry.refs += 1
  const current = entry

  return {
    channel: current.channel,
    release: () => {
      current.listeners.delete(listener)
      current.refs -= 1
      setTimeout(() => {
        if (current.refs === 0 && typingChannels.get(name) === current) {
          typingChannels.delete(name)
          void supabase.removeChannel(current.channel)
        }
      }, 0)
    },
  }
}

export function sendTypingSignal(channel: RealtimeChannel, userId: string, isTyping: boolean): void {
  void channel.send({ type: 'broadcast', event: 'typing', payload: { userId, isTyping } })
}
