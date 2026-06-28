'use client'

import { useState, useEffect } from 'react'
import { MessageCircle } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn, buildWhatsAppUrl } from '@/lib/utils'

interface WhatsAppButtonProps {
  phone: string
  message: string
  className?: string
}

export function WhatsAppButton({ phone, message, className }: WhatsAppButtonProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data: { user } }) => setIsLoggedIn(!!user))
  }, [])

  if (!phone) return null

  const handleClick = () => {
    if (!isLoggedIn) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
      return
    }
    window.open(buildWhatsAppUrl(phone, message), '_blank', 'noopener,noreferrer')
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        'btn flex items-center justify-center gap-2 bg-[#25D366] text-white hover:bg-[#20BA5C] focus-visible:ring-[#25D366] shadow-sm',
        className
      )}
      aria-label="Contacter via WhatsApp"
    >
      <MessageCircle className="w-5 h-5" />
      {isLoggedIn ? 'WhatsApp' : 'Contacter le vendeur'}
    </button>
  )
}
