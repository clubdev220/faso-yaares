'use client'

import { useState } from 'react'
import { Loader2, MessageCircle } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import toast from 'react-hot-toast'
import { createUntypedClient } from '@/lib/supabase/client'
import { cn, buildWhatsAppUrl } from '@/lib/utils'

interface WhatsAppButtonProps {
  listingId: string
  message: string
  className?: string
}

// Le numéro du vendeur n'est jamais écrit dans la page : il est demandé au
// clic via la RPC get_listing_seller_phone (connecté + annonce active),
// comme sur l'app mobile.
export function WhatsAppButton({ listingId, message, className }: WhatsAppButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const handleClick = async () => {
    const supabase = createUntypedClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
      return
    }

    // Fenêtre ouverte tout de suite (clic utilisateur) pour ne pas être
    // bloquée comme pop-up après l'appel réseau.
    const popup = window.open('', '_blank')
    setIsLoading(true)
    try {
      const { data, error } = await supabase.rpc('get_listing_seller_phone', {
        p_listing_id: listingId,
      })
      const phone = typeof data === 'string' ? data : ''
      if (error || !phone) {
        popup?.close()
        toast.error("Ce vendeur n'a pas de numéro WhatsApp. Envoyez-lui un message.")
        return
      }
      const url = buildWhatsAppUrl(phone, message)
      if (popup) {
        popup.opener = null
        popup.location.href = url
      } else {
        window.location.href = url
      }
    } catch {
      popup?.close()
      toast.error('Impossible de contacter le vendeur pour le moment.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      className={cn(
        'btn flex items-center justify-center gap-2 bg-[#25D366] text-white hover:bg-[#20BA5C] focus-visible:ring-[#25D366] shadow-sm disabled:opacity-60',
        className
      )}
      aria-label="Contacter le vendeur via WhatsApp"
    >
      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <MessageCircle className="w-5 h-5" />}
      WhatsApp
    </button>
  )
}
