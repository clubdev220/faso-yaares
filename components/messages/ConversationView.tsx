'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, CheckCheck, HandCoins, Loader2, Package, Send, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import { createUntypedClient } from '@/lib/supabase/client'
import {
  belongsToThread,
  getThreadMessages,
  markThreadRead,
  sendMessage,
  sendTypingSignal,
  subscribeToThreadMessages,
  subscribeToTyping,
} from '@/lib/api/messaging'
import { createOffer, getOfferThread, respondToOffer, subscribeToOffers } from '@/lib/api/offers'
import { canReviewSeller, createReview, getMyReviewForListing } from '@/lib/api/reviews'
import { SellerAvatar } from '@/components/sellers/SellerAvatar'
import { VerifiedBadge } from '@/components/sellers/VerifiedBadge'
import { StarRating } from '@/components/reviews/StarRating'
import {
  cn,
  formatMessageDateDivider,
  formatMessageTimestamp,
  formatPrice,
  getMessageDayKey,
} from '@/lib/utils'
import type { ListingImage, Message, Offer, PublicProfile, Review } from '@/types'

export interface ConversationListing {
  id: string
  title: string
  price: number
  currency: string | null
  status: string
  user_id: string
  images?: Pick<ListingImage, 'id' | 'url' | 'thumbnail_url' | 'display_order'>[]
}

interface ConversationViewProps {
  userId: string
  otherUser: PublicProfile
  listingId: string | null
  listing: ConversationListing | null
}

type ThreadRow =
  | { type: 'divider'; id: string; label: string }
  | { type: 'message'; id: string; message: Message }
  | { type: 'offer'; id: string; offer: Offer }

// Messages et offres mélangés par date, avec un séparateur par jour
// (jour calculé à l'heure de Ouagadougou).
function buildRows(messages: Message[], offers: Offer[]): ThreadRow[] {
  const items = [
    ...messages.map((message) => ({ kind: 'message' as const, message, ts: message.created_at })),
    ...offers.map((offer) => ({ kind: 'offer' as const, offer, ts: offer.created_at })),
  ].sort((a, b) => (a.ts < b.ts ? -1 : 1))

  const rows: ThreadRow[] = []
  let lastDayKey: string | null = null
  for (const item of items) {
    const dayKey = getMessageDayKey(item.ts)
    if (dayKey !== lastDayKey) {
      rows.push({ type: 'divider', id: `divider-${dayKey}`, label: formatMessageDateDivider(item.ts) })
      lastDayKey = dayKey
    }
    if (item.kind === 'message') {
      rows.push({ type: 'message', id: item.message.id, message: item.message })
    } else {
      rows.push({ type: 'offer', id: `offer-${item.offer.id}`, offer: item.offer })
    }
  }
  return rows
}

const OFFER_STATUS_LABEL: Record<Offer['status'], string> = {
  pending: 'En attente',
  accepted: 'Offre acceptée',
  rejected: 'Offre refusée',
  countered: 'Contre-proposée',
}

function parseAmount(value: string): number {
  return Number(value.replace(/[^\d]/g, ''))
}

function MessageTicks({ message }: { message: Message }) {
  if (message.is_read) {
    return <CheckCheck className="w-3.5 h-3.5 text-primary" aria-label="Lu" />
  }
  if (message.delivered_at) {
    return <CheckCheck className="w-3.5 h-3.5 text-gray-400" aria-label="Distribué" />
  }
  return <Check className="w-3.5 h-3.5 text-gray-400" aria-label="Envoyé" />
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 self-start rounded-2xl bg-gray-100 px-4 py-3" aria-label="En train d'écrire">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  )
}

export function ConversationView({ userId, otherUser, listingId, listing }: ConversationViewProps) {
  const otherUserId = otherUser.id
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [draft, setDraft] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isOtherTyping, setIsOtherTyping] = useState(false)

  const [offers, setOffers] = useState<Offer[]>([])
  const [isOfferFormOpen, setIsOfferFormOpen] = useState(false)
  const [counterOfferId, setCounterOfferId] = useState<string | null>(null)
  const [offerAmount, setOfferAmount] = useState('')
  const [isSubmittingOffer, setIsSubmittingOffer] = useState(false)

  const [canReview, setCanReview] = useState(false)
  const [myReview, setMyReview] = useState<Review | null>(null)
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const typingRef = useRef<ReturnType<typeof subscribeToTyping> | null>(null)
  const wasTypingRef = useRef(false)
  const stopTypingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Le vendeur est toujours listing.user_id ; l'acheteur est l'autre.
  const sellerId = listing?.user_id ?? null
  const buyerId = sellerId ? (sellerId === userId ? otherUserId : userId) : null
  const isParticipantOfListing = sellerId === userId || sellerId === otherUserId

  const markRead = useCallback(() => {
    markThreadRead(createUntypedClient(), userId, otherUserId, listingId).catch(() => {})
  }, [userId, otherUserId, listingId])

  // Messages + temps réel (nouveaux messages, accusés) + « écrit… »
  useEffect(() => {
    const supabase = createUntypedClient()
    let cancelled = false

    getThreadMessages(supabase, userId, otherUserId, listingId)
      .then((rows) => {
        if (!cancelled) setMessages(rows)
      })
      .catch(() => {
        if (!cancelled) toast.error('Impossible de charger la conversation.')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    markRead()

    const channel = subscribeToThreadMessages(
      supabase,
      userId,
      otherUserId,
      (message) => {
        if (!belongsToThread(message, userId, otherUserId, listingId)) return
        setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]))
        setIsOtherTyping(false)
        if (document.visibilityState === 'visible') markRead()
      },
      (updated) => {
        // L'abonnement UPDATE couvre tous mes messages envoyés : on ne garde
        // que ceux de cette conversation.
        if (!belongsToThread(updated, userId, otherUserId, listingId)) return
        setMessages((prev) => prev.map((m) => (m.id === updated.id ? updated : m)))
      }
    )

    const typing = subscribeToTyping(supabase, userId, otherUserId, listingId, setIsOtherTyping)
    typingRef.current = typing

    const onVisible = () => {
      if (document.visibilityState === 'visible') markRead()
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisible)
      if (stopTypingTimeoutRef.current) clearTimeout(stopTypingTimeoutRef.current)
      if (wasTypingRef.current) {
        wasTypingRef.current = false
        sendTypingSignal(typing.channel, userId, false)
      }
      typingRef.current = null
      typing.release()
      void supabase.removeChannel(channel)
    }
  }, [userId, otherUserId, listingId, markRead])

  // Offres (seulement pour une conversation liée à une annonce)
  useEffect(() => {
    if (!listingId || !sellerId || !buyerId || !isParticipantOfListing) {
      setOffers([])
      return
    }
    const supabase = createUntypedClient()
    getOfferThread(supabase, listingId, buyerId, sellerId)
      .then(setOffers)
      .catch(() => {})

    const channel = subscribeToOffers(supabase, listingId, (offer) => {
      if (offer.buyer_id !== buyerId || offer.seller_id !== sellerId) return
      setOffers((prev) =>
        prev.some((o) => o.id === offer.id)
          ? prev.map((o) => (o.id === offer.id ? offer : o))
          : [...prev, offer]
      )
    })
    return () => {
      void supabase.removeChannel(channel)
    }
  }, [listingId, sellerId, buyerId, isParticipantOfListing])

  // Avis : seulement l'acheteur envers le vendeur, s'il y a eu un échange
  // (la vraie garde est dans la RPC create_review).
  useEffect(() => {
    if (!listingId || sellerId !== otherUserId) {
      setCanReview(false)
      return
    }
    const supabase = createUntypedClient()
    canReviewSeller(supabase, userId, otherUserId, listingId).then(setCanReview)
    getMyReviewForListing(supabase, userId, listingId)
      .then((review) => {
        setMyReview(review)
        if (review) {
          setReviewRating(review.rating)
          setReviewComment(review.comment ?? '')
        }
      })
      .catch(() => {})
  }, [userId, otherUserId, listingId, sellerId, messages.length])

  const rows = useMemo(() => buildRows(messages, offers), [messages, offers])

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [rows.length, isOtherTyping])

  const activeOffer = offers.length > 0 ? offers[offers.length - 1] : null
  const isMyTurnToRespond =
    !!activeOffer && activeOffer.status === 'pending' && activeOffer.last_actor_id !== userId
  const iAmBuyer = Boolean(sellerId) && sellerId !== userId && isParticipantOfListing

  const handleDraftChange = (text: string) => {
    setDraft(text)
    const typing = typingRef.current
    if (!typing) return

    const isTyping = text.trim().length > 0
    if (isTyping !== wasTypingRef.current) {
      wasTypingRef.current = isTyping
      sendTypingSignal(typing.channel, userId, isTyping)
    }
    if (stopTypingTimeoutRef.current) clearTimeout(stopTypingTimeoutRef.current)
    if (isTyping) {
      stopTypingTimeoutRef.current = setTimeout(() => {
        wasTypingRef.current = false
        sendTypingSignal(typing.channel, userId, false)
      }, 2000)
    }
  }

  const handleSend = async () => {
    const content = draft.trim()
    if (!content || isSending) return
    setDraft('')
    setIsSending(true)
    if (stopTypingTimeoutRef.current) clearTimeout(stopTypingTimeoutRef.current)
    if (wasTypingRef.current && typingRef.current) {
      wasTypingRef.current = false
      sendTypingSignal(typingRef.current.channel, userId, false)
    }
    try {
      const message = await sendMessage(createUntypedClient(), userId, otherUserId, listingId, content)
      setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]))
    } catch {
      setDraft(content)
      toast.error("Le message n'a pas pu être envoyé.")
    } finally {
      setIsSending(false)
    }
  }

  const handleCreateOffer = async () => {
    const amount = parseAmount(offerAmount)
    if (!listingId || !amount) return
    setIsSubmittingOffer(true)
    try {
      const offer = await createOffer(createUntypedClient(), listingId, amount)
      setOffers((prev) => (prev.some((o) => o.id === offer.id) ? prev : [...prev, offer]))
      setIsOfferFormOpen(false)
      setOfferAmount('')
    } catch {
      toast.error("Impossible d'envoyer cette offre pour le moment.")
    } finally {
      setIsSubmittingOffer(false)
    }
  }

  const handleSubmitCounter = async () => {
    const amount = parseAmount(offerAmount)
    if (!counterOfferId || !amount) return
    setIsSubmittingOffer(true)
    try {
      const offer = await respondToOffer(createUntypedClient(), counterOfferId, 'counter', amount)
      setOffers((prev) => [
        ...prev.map((o) => (o.id === counterOfferId ? { ...o, status: 'countered' as const } : o)),
        ...(prev.some((o) => o.id === offer.id) ? [] : [offer]),
      ])
      setCounterOfferId(null)
      setOfferAmount('')
    } catch {
      toast.error("Impossible d'envoyer cette contre-offre pour le moment.")
    } finally {
      setIsSubmittingOffer(false)
    }
  }

  const handleRespondToOffer = async (offerId: string, action: 'accept' | 'reject') => {
    setIsSubmittingOffer(true)
    try {
      const offer = await respondToOffer(createUntypedClient(), offerId, action)
      setOffers((prev) => prev.map((o) => (o.id === offerId ? offer : o)))
    } catch {
      toast.error('Impossible de répondre à cette offre pour le moment.')
    } finally {
      setIsSubmittingOffer(false)
    }
  }

  const handleSubmitReview = async () => {
    if (!listingId || reviewRating < 1) return
    setIsSubmittingReview(true)
    try {
      const review = await createReview(
        createUntypedClient(),
        listingId,
        otherUserId,
        reviewRating,
        reviewComment.trim() || null
      )
      setMyReview(review)
      setIsReviewFormOpen(false)
      toast.success('Merci pour votre avis !')
    } catch {
      toast.error("Impossible d'enregistrer votre avis pour le moment.")
    } finally {
      setIsSubmittingReview(false)
    }
  }

  const listingImages = [...(listing?.images ?? [])].sort((a, b) => a.display_order - b.display_order)
  const listingCover = listingImages[0]?.thumbnail_url || listingImages[0]?.url
  // Seul l'acheteur ouvre une offre ; le vendeur ne voit la barre que pour
  // une offre en attente ou pendant qu'il saisit une contre-offre.
  const showOfferBar = Boolean(
    listingId &&
      isParticipantOfListing &&
      (iAmBuyer || counterOfferId || activeOffer?.status === 'pending')
  )

  return (
    <div className="max-w-3xl mx-auto sm:px-4 lg:py-4">
      <div className="card flex flex-col h-[calc(100dvh-6rem-5rem)] lg:h-[calc(100dvh-6rem-2rem)] rounded-none sm:rounded-2xl">
        {/* En-tête */}
        <div className="flex items-center gap-3 border-b border-gray-100 px-3 py-3">
          <Link
            href="/messages"
            className="p-1.5 text-gray-500 hover:text-gray-900 rounded-lg"
            aria-label="Retour aux messages"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Link href={`/vendeur/${otherUserId}`} className="flex items-center gap-2 min-w-0 flex-1 group">
            <SellerAvatar
              url={otherUser.avatar_url}
              name={otherUser.full_name}
              className="w-10 h-10"
              textClassName="text-base"
            />
            <div className="min-w-0">
              <p className="font-heading font-semibold text-gray-900 truncate group-hover:text-primary">
                {otherUser.full_name || 'Utilisateur'}
              </p>
              {isOtherTyping ? (
                <p className="text-xs text-primary">écrit…</p>
              ) : otherUser.is_verified ? (
                <VerifiedBadge variant="inline" />
              ) : null}
            </div>
          </Link>
        </div>

        {listing && (
          <Link
            href={`/listings/${listing.id}`}
            className="flex items-center gap-3 border-b border-gray-100 px-4 py-2 hover:bg-gray-50"
          >
            {listingCover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={listingCover} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Package className="w-5 h-5 text-gray-300" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-800 truncate">{listing.title}</p>
              <p className="text-sm font-semibold text-primary">
                {formatPrice(listing.price, listing.currency || 'XOF')}
                {listing.status === 'sold' && (
                  <span className="ml-2 text-xs font-medium text-secondary">Vendu</span>
                )}
              </p>
            </div>
          </Link>
        )}

        {/* Avis */}
        {canReview && (
          <div className="border-b border-gray-100 bg-primary/5 px-4 py-2">
            {isReviewFormOpen ? (
              <div className="space-y-2 py-1">
                <StarRating rating={reviewRating} onChange={setReviewRating} size="lg" />
                <textarea
                  className="input min-h-[60px] text-sm"
                  placeholder="Un commentaire (facultatif)"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  maxLength={500}
                />
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="btn-primary btn-sm"
                    onClick={handleSubmitReview}
                    disabled={isSubmittingReview || reviewRating < 1}
                  >
                    {isSubmittingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Envoyer
                  </button>
                  <button
                    type="button"
                    className="text-sm text-gray-500 hover:text-gray-700"
                    onClick={() => setIsReviewFormOpen(false)}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 py-1 text-sm font-semibold text-primary"
                onClick={() => setIsReviewFormOpen(true)}
              >
                <Star className="w-4 h-4" />
                {myReview ? 'Modifier mon avis' : 'Laisser un avis'}
              </button>
            )}
          </div>
        )}

        {/* Offres */}
        {showOfferBar && (
          <div className="border-b border-gray-100 bg-primary/5 px-4 py-2">
            {isOfferFormOpen || counterOfferId ? (
              <form
                className="space-y-2 py-1"
                onSubmit={(e) => {
                  e.preventDefault()
                  void (counterOfferId ? handleSubmitCounter() : handleCreateOffer())
                }}
              >
                <p className="text-xs text-gray-500">
                  {counterOfferId
                    ? 'Votre contre-offre'
                    : `Votre offre pour « ${listing?.title ?? "l'annonce"} »`}
                </p>
                <div className="flex items-center gap-2">
                  <input
                    className="input flex-1 text-sm"
                    placeholder="Montant en FCFA"
                    inputMode="numeric"
                    value={offerAmount}
                    onChange={(e) => setOfferAmount(e.target.value)}
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="btn-primary btn-md"
                    disabled={isSubmittingOffer || !parseAmount(offerAmount)}
                  >
                    {isSubmittingOffer ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Envoyer
                  </button>
                  <button
                    type="button"
                    className="text-sm text-gray-500 hover:text-gray-700"
                    onClick={() => {
                      setIsOfferFormOpen(false)
                      setCounterOfferId(null)
                      setOfferAmount('')
                    }}
                  >
                    Annuler
                  </button>
                </div>
              </form>
            ) : activeOffer?.status === 'pending' ? (
              <p className="py-1 text-center text-sm text-gray-500">
                {isMyTurnToRespond
                  ? "Répondez à l'offre ci-dessous ↓"
                  : 'En attente de la réponse à votre offre'}
              </p>
            ) : iAmBuyer ? (
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 py-1 text-sm font-semibold text-primary"
                onClick={() => setIsOfferFormOpen(true)}
              >
                <HandCoins className="w-4 h-4" />
                Faire une offre
              </button>
            ) : null}
          </div>
        )}

        {/* Fil */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2 bg-gray-50/50">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : rows.length === 0 ? (
            <p className="mt-12 text-center text-sm text-gray-400">
              Dites bonjour pour démarrer la conversation.
            </p>
          ) : (
            rows.map((row) => {
              if (row.type === 'divider') {
                return (
                  <div key={row.id} className="my-2 flex justify-center">
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500 first-letter:uppercase">
                      {row.label}
                    </span>
                  </div>
                )
              }

              if (row.type === 'offer') {
                const offer = row.offer
                const isMine = offer.last_actor_id === userId
                const canRespond = offer.status === 'pending' && !isMine
                return (
                  <div
                    key={row.id}
                    className={cn(
                      'max-w-[85%] space-y-2 rounded-2xl border border-primary/30 bg-primary/5 p-3',
                      isMine ? 'self-end' : 'self-start'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <HandCoins className="w-4 h-4 text-primary" />
                      <span className="text-sm font-bold text-gray-900">{formatPrice(offer.amount)}</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {isMine ? 'Vous avez proposé' : 'Offre reçue'} · {OFFER_STATUS_LABEL[offer.status]}
                      {' · '}
                      {formatMessageTimestamp(offer.created_at)}
                    </p>
                    {canRespond && (
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <button
                          type="button"
                          className="btn-primary btn-sm"
                          disabled={isSubmittingOffer}
                          onClick={() => handleRespondToOffer(offer.id, 'accept')}
                        >
                          Accepter
                        </button>
                        <button
                          type="button"
                          className="btn-outline btn-sm"
                          disabled={isSubmittingOffer}
                          onClick={() => handleRespondToOffer(offer.id, 'reject')}
                        >
                          Refuser
                        </button>
                        <button
                          type="button"
                          className="btn-outline btn-sm"
                          disabled={isSubmittingOffer}
                          onClick={() => {
                            setCounterOfferId(offer.id)
                            setOfferAmount('')
                            setIsOfferFormOpen(false)
                          }}
                        >
                          Contre-offre
                        </button>
                      </div>
                    )}
                  </div>
                )
              }

              const message = row.message
              const isMine = message.sender_id === userId
              return (
                <div
                  key={row.id}
                  className={cn('max-w-[80%] flex flex-col gap-0.5', isMine ? 'self-end items-end' : 'self-start items-start')}
                >
                  <div
                    className={cn(
                      'rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap break-words',
                      isMine ? 'bg-primary text-white rounded-br-md' : 'bg-white border border-gray-100 text-gray-900 rounded-bl-md'
                    )}
                  >
                    {message.content}
                  </div>
                  <div className="flex items-center gap-1 px-1">
                    <span className="text-[11px] text-gray-400">{formatMessageTimestamp(message.created_at)}</span>
                    {isMine && <MessageTicks message={message} />}
                  </div>
                </div>
              )
            })
          )}
          {isOtherTyping && <TypingDots />}
        </div>

        {/* Saisie */}
        <form
          className="flex items-end gap-2 border-t border-gray-100 px-3 py-3"
          onSubmit={(e) => {
            e.preventDefault()
            void handleSend()
          }}
        >
          <textarea
            className="input flex-1 resize-none max-h-32 min-h-[44px] py-2.5 rounded-2xl"
            placeholder="Écrire un message..."
            rows={1}
            value={draft}
            onChange={(e) => handleDraftChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault()
                void handleSend()
              }
            }}
            maxLength={2000}
            aria-label="Message"
          />
          <button
            type="submit"
            className="w-11 h-11 flex-shrink-0 rounded-full bg-primary text-white flex items-center justify-center disabled:opacity-50 transition-opacity"
            disabled={isSending || !draft.trim()}
            aria-label="Envoyer"
          >
            {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
      </div>
    </div>
  )
}
