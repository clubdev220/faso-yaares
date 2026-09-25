'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { History, Loader2, Plus, Send, Sparkles, Trash2 } from 'lucide-react'
import { createUntypedClient } from '@/lib/supabase/client'
import { askAssistant, AssistantQuotaError, getListingsByIds, type AssistantTurn } from '@/lib/api/assistant'
import {
  getDeviceId,
  grantAssistantConsent,
  hasAssistantConsent,
  loadConversations,
  MAX_CONVERSATIONS,
  MAX_ITEMS_PER_CONVERSATION,
  saveConversations,
  type StoredChatItem,
  type StoredConversation,
} from '@/lib/assistant/storage'
import { ListingCard } from '@/components/listings/ListingCard'
import { APP_TIME_ZONE, cn } from '@/lib/utils'
import type { Listing } from '@/types'

interface ChatItem extends StoredChatItem {
  isError?: boolean
}

const SUGGESTIONS = [
  'Un téléphone pas cher à Ouagadougou',
  'Une moto en bon état à Bobo-Dioulasso',
  'Je cherche un appartement à louer',
  'Des vêtements pour enfants',
]

const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`

export function AssistantChat({ initialQuery }: { initialQuery?: string }) {
  const router = useRouter()
  const [consent, setConsent] = useState<'loading' | 'needed' | 'granted'>('loading')
  const [view, setView] = useState<'chat' | 'history'>('chat')
  const [conversations, setConversations] = useState<StoredConversation[]>([])
  const [items, setItems] = useState<ChatItem[]>([])
  const [listingsById, setListingsById] = useState<Record<string, Listing>>({})
  const [draft, setDraft] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const itemsRef = useRef<ChatItem[]>([])
  const conversationsRef = useRef<StoredConversation[]>([])
  const activeIdRef = useRef<string | null>(null)
  const initializedRef = useRef(false)

  const mergeListings = (listings: Listing[]) => {
    if (listings.length === 0) return
    setListingsById((prev) => {
      const next = { ...prev }
      for (const listing of listings) next[listing.id] = listing
      return next
    })
  }

  const commit = (id: string, nextItems: ChatItem[]) => {
    const stored: StoredChatItem[] = nextItems
      .filter((item) => !item.isError)
      .slice(-MAX_ITEMS_PER_CONVERSATION)
      .map(({ id: itemId, role, content, listingIds }) => ({ id: itemId, role, content, listingIds }))
    const title = stored.find((item) => item.role === 'user')?.content.slice(0, 40) ?? 'Conversation'
    const next = [
      { id, title, updatedAt: Date.now(), items: stored },
      ...conversationsRef.current.filter((c) => c.id !== id),
    ].slice(0, MAX_CONVERSATIONS)
    conversationsRef.current = next
    setConversations(next)
    saveConversations(next)
  }

  const setChatItems = (next: ChatItem[]) => {
    itemsRef.current = next
    setItems(next)
  }

  const openConversation = (conversation: StoredConversation) => {
    activeIdRef.current = conversation.id
    setChatItems(conversation.items)
    setView('chat')
    const ids = Array.from(new Set(conversation.items.flatMap((item) => item.listingIds ?? [])))
    if (ids.length > 0) {
      getListingsByIds(createUntypedClient(), ids).then(mergeListings).catch(() => {})
    }
  }

  const startNewConversation = () => {
    activeIdRef.current = null
    setChatItems([])
    setView('chat')
  }

  const send = async (text: string) => {
    const content = text.trim()
    if (!content || isThinking) return

    const id = activeIdRef.current ?? newId()
    activeIdRef.current = id

    const withUser = [...itemsRef.current, { id: newId(), role: 'user' as const, content }]
    setChatItems(withUser)
    setDraft('')
    setIsThinking(true)
    commit(id, withUser)

    const history: AssistantTurn[] = withUser
      .filter((item) => !item.isError)
      .map(({ role, content: c }) => ({ role, content: c }))

    try {
      const result = await askAssistant(history, getDeviceId())
      const listings = await getListingsByIds(createUntypedClient(), result.listingIds).catch(() => [])
      mergeListings(listings)
      const withReply = [
        ...itemsRef.current,
        {
          id: newId(),
          role: 'assistant' as const,
          content: result.reply,
          listingIds: listings.map((listing) => listing.id),
        },
      ]
      setChatItems(withReply)
      commit(id, withReply)
    } catch (error) {
      const message =
        error instanceof AssistantQuotaError
          ? "Vous avez atteint la limite de messages pour aujourd'hui. Revenez demain, ou parcourez les annonces pour continuer votre recherche."
          : "Désolé, l'assistant est indisponible pour le moment. Réessayez dans un instant ou parcourez les annonces."
      setChatItems([
        ...itemsRef.current,
        { id: newId(), role: 'assistant', content: message, isError: true },
      ])
    } finally {
      setIsThinking(false)
    }
  }

  const initialize = () => {
    if (initializedRef.current) return
    initializedRef.current = true
    const stored = loadConversations()
    conversationsRef.current = stored
    setConversations(stored)
    if (initialQuery?.trim()) {
      // La demande venue de l'accueil ne doit pas être renvoyée si la page
      // est rechargée.
      router.replace('/assistant', { scroll: false })
      void send(initialQuery)
    } else if (stored[0]) {
      openConversation(stored[0])
    }
  }

  // Rien n'est envoyé au service d'IA avant l'accord : ni la demande venue
  // de l'accueil, ni la réouverture d'une conversation.
  useEffect(() => {
    const granted = hasAssistantConsent()
    setConsent(granted ? 'granted' : 'needed')
    if (granted) initialize()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [items, isThinking, listingsById])

  const acceptConsent = () => {
    grantAssistantConsent()
    setConsent('granted')
    initialize()
  }

  const deleteConversation = (conversation: StoredConversation) => {
    if (!window.confirm(`Supprimer cette conversation ?\n\n« ${conversation.title} »`)) return
    const next = conversationsRef.current.filter((c) => c.id !== conversation.id)
    conversationsRef.current = next
    setConversations(next)
    saveConversations(next)
    if (activeIdRef.current === conversation.id) startNewConversation()
  }

  const header = (
    <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
      <Sparkles className="w-5 h-5 text-primary" />
      <h1 className="flex-1 font-heading font-bold text-gray-900">
        {view === 'history' ? 'Mes conversations' : 'Assistant Yaaré'}
      </h1>
      {consent === 'granted' && (
        <>
          <button
            type="button"
            onClick={() => setView(view === 'history' ? 'chat' : 'history')}
            disabled={isThinking}
            className={cn(
              'p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40',
              view === 'history' ? 'text-primary' : 'text-gray-600'
            )}
            aria-label="Historique des conversations"
          >
            <History className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={startNewConversation}
            disabled={isThinking}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-40"
            aria-label="Nouvelle conversation"
          >
            <Plus className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto sm:px-4 lg:py-4">
      <div className="card flex flex-col h-[calc(100dvh-6rem-5rem)] lg:h-[calc(100dvh-6rem-2rem)] rounded-none sm:rounded-2xl">
        {header}

        {consent === 'loading' ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : consent === 'needed' ? (
          <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col justify-center gap-5">
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-lg font-heading font-bold text-gray-900">Avant de commencer</h2>
            </div>
            <div className="rounded-2xl border border-gray-100 p-4 space-y-3 text-sm leading-relaxed text-gray-700">
              <p>
                L&apos;assistant utilise un service d&apos;intelligence artificielle tiers (OpenRouter et le
                modèle de langage qu&apos;il fait fonctionner) pour comprendre vos demandes.
              </p>
              <p>
                Les messages que vous écrivez ici lui sont envoyés pour préparer une réponse. Ils ne sont
                pas utilisés pour vous identifier : n&apos;y écrivez ni numéro de téléphone, ni mot de
                passe, ni information personnelle sensible.
              </p>
              <p>
                Ses réponses peuvent contenir des erreurs : vérifiez toujours l&apos;annonce avant
                d&apos;agir.{' '}
                <Link href="/privacy" className="text-primary hover:underline">
                  Politique de confidentialité
                </Link>
              </p>
            </div>
            <div className="space-y-2">
              <button type="button" onClick={acceptConsent} className="btn-primary btn-lg w-full">
                J&apos;accepte et je continue
              </button>
              <Link href="/listings" className="block text-center text-sm text-gray-500 hover:text-gray-700 py-2">
                Non merci, parcourir les annonces
              </Link>
            </div>
          </div>
        ) : view === 'history' ? (
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {conversations.length === 0 ? (
              <p className="mt-12 text-center text-sm text-gray-400">Aucune conversation pour le moment.</p>
            ) : (
              conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className="flex items-center gap-2 rounded-xl border border-gray-100 hover:border-primary/30 transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => openConversation(conversation)}
                    className="flex-1 min-w-0 text-left p-3"
                  >
                    <p className="text-sm font-semibold text-gray-900 truncate">{conversation.title}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(conversation.updatedAt).toLocaleDateString('fr-BF', {
                        day: 'numeric',
                        month: 'short',
                        timeZone: APP_TIME_ZONE,
                      })}{' '}
                      · {conversation.items.length} messages
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteConversation(conversation)}
                    className="p-3 text-gray-400 hover:text-secondary"
                    aria-label={`Supprimer la conversation « ${conversation.title} »`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        ) : (
          <>
            <div className="bg-accent/20 px-4 py-1.5 text-center text-[11px] text-gray-600">
              Assistant IA — il peut se tromper, vérifiez toujours l&apos;annonce.
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {items.length === 0 && !isThinking ? (
                <div className="flex-1 flex flex-col justify-center gap-4">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                      <Sparkles className="w-7 h-7 text-primary" />
                    </div>
                    <h2 className="text-lg font-heading font-bold text-gray-900">Que cherchez-vous ?</h2>
                    <p className="text-sm text-gray-500">
                      Décrivez-moi ce qu&apos;il vous faut, je trouve les annonces qui correspondent.
                    </p>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {SUGGESTIONS.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => void send(suggestion)}
                        className="rounded-xl border border-gray-200 px-4 py-3 text-left text-sm text-gray-700 hover:border-primary/50 hover:bg-primary/5 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                items.map((item) => {
                  const isMine = item.role === 'user'
                  const listings = (item.listingIds ?? [])
                    .map((listingId) => listingsById[listingId])
                    .filter((listing): listing is Listing => Boolean(listing))
                  return (
                    <div key={item.id} className={cn('flex flex-col', isMine ? 'items-end' : 'items-start')}>
                      <div
                        className={cn(
                          'max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap break-words',
                          isMine
                            ? 'bg-primary text-white rounded-br-md'
                            : item.isError
                              ? 'bg-red-50 text-red-700 rounded-bl-md'
                              : 'bg-gray-100 text-gray-900 rounded-bl-md'
                        )}
                      >
                        {item.content}
                      </div>
                      {listings.length > 0 && (
                        <div className="mt-3 w-full grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {listings.map((listing) => (
                            <ListingCard key={listing.id} listing={listing} />
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })
              )}
              {isThinking && (
                <div className="self-start flex items-center gap-2 rounded-2xl bg-gray-100 px-4 py-3">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-sm text-gray-500">Je cherche...</span>
                </div>
              )}
            </div>

            <form
              className="flex items-end gap-2 border-t border-gray-100 px-3 py-3"
              onSubmit={(e) => {
                e.preventDefault()
                void send(draft)
              }}
            >
              <textarea
                className="input flex-1 resize-none max-h-32 min-h-[44px] py-2.5 rounded-2xl"
                placeholder="Décrivez ce que vous cherchez..."
                rows={1}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                    e.preventDefault()
                    void send(draft)
                  }
                }}
                maxLength={1000}
                aria-label="Votre demande"
              />
              <button
                type="submit"
                className="w-11 h-11 flex-shrink-0 rounded-full bg-primary text-white flex items-center justify-center disabled:opacity-50"
                disabled={isThinking || !draft.trim()}
                aria-label="Envoyer"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
