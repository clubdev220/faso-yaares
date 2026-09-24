'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { cn, getSafeRedirectPath } from '@/lib/utils'
import {
  clearPendingEmailSignup,
  getPostLoginPath,
  readPendingEmailSignup,
  type PendingEmailSignup,
} from '@/lib/auth/client'

export function EmailOtpForm() {
  const [pending, setPending] = useState<PendingEmailSignup | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = getSafeRedirectPath(searchParams.get('redirect'), '/dashboard')

  useEffect(() => {
    setPending(readPendingEmailSignup())
    setIsReady(true)
  }, [])

  useEffect(() => {
    if (countdown <= 0) return
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000)
    return () => clearInterval(timer)
  }, [countdown])

  const handleVerify = async (code?: string) => {
    if (!pending) return
    const finalCode = code || otp.join('')
    if (finalCode.length !== 6) {
      toast.error('Entrez le code à 6 chiffres')
      return
    }

    setIsVerifying(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.verifyOtp({
        email: pending.email,
        token: finalCode,
        type: 'signup',
      })
      if (error) throw error

      // La session existe maintenant : on peut créer le profil puis y
      // écrire le nom et la ville saisis à l'inscription.
      if (pending.full_name && pending.city) {
        const res = await fetch('/api/auth/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ full_name: pending.full_name, city: pending.city }),
        })
        if (!res.ok) {
          const result = (await res.json()) as { error?: string }
          throw new Error(result.error || 'Erreur lors de la creation du profil')
        }
      }

      clearPendingEmailSignup()
      const nextPath = await getPostLoginPath(redirectTo)
      toast.success('Adresse confirmée ! Bienvenue sur Yaaré 🎉')
      router.push(nextPath)
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : ''
      toast.error(
        message.toLowerCase().includes('expired') || message.toLowerCase().includes('invalid')
          ? 'Code invalide ou expiré. Réessayez.'
          : 'Vérification échouée. Réessayez.'
      )
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setIsVerifying(false)
    }
  }

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    if (index === 5 && value) {
      const fullOtp = [...newOtp.slice(0, 5), value].join('')
      if (fullOtp.length === 6) {
        handleVerify(fullOtp)
      }
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (paste.length === 6) {
      setOtp(paste.split(''))
      inputRefs.current[5]?.focus()
      handleVerify(paste)
    }
  }

  const handleResend = async () => {
    if (!pending || countdown > 0) return
    setIsResending(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resend({ type: 'signup', email: pending.email })
      if (error) throw error
      toast.success('Nouveau code envoyé !')
      setCountdown(60)
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } catch {
      toast.error('Erreur lors du renvoi. Réessayez dans quelques minutes.')
    } finally {
      setIsResending(false)
    }
  }

  if (!isReady) {
    return <div className="skeleton h-48 rounded-2xl" />
  }

  if (!pending) {
    return (
      <div className="card p-6 text-center">
        <p className="text-sm text-gray-600 mb-4">
          Aucune inscription en cours dans ce navigateur. Recommencez depuis la page de connexion.
        </p>
        <Link href="/login" className="btn-primary btn-md">
          Retour à la connexion
        </Link>
      </div>
    )
  }

  return (
    <div className="card p-6">
      <p className="text-center text-sm text-gray-600 mb-6">
        Code envoyé à <strong className="break-all">{pending.email}</strong>
      </p>

      <div className="flex gap-2 sm:gap-3 justify-center mb-6" onPaste={handlePaste}>
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className={cn(
              'w-11 h-14 sm:w-12 sm:h-16 text-center text-xl font-bold border-2 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30',
              digit
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-gray-200 text-gray-900',
              isVerifying && 'opacity-50 cursor-not-allowed'
            )}
            disabled={isVerifying}
            aria-label={`Chiffre ${i + 1}`}
            autoFocus={i === 0}
          />
        ))}
      </div>

      <button
        onClick={() => handleVerify()}
        disabled={isVerifying || otp.join('').length !== 6}
        className="btn-primary btn-lg w-full mb-4"
      >
        {isVerifying ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
        {isVerifying ? 'Vérification...' : 'Confirmer mon adresse'}
      </button>

      <div className="flex items-center justify-center gap-2 text-sm">
        <button
          onClick={handleResend}
          disabled={countdown > 0 || isResending}
          className={cn(
            'flex items-center gap-1.5 text-sm transition-colors',
            countdown > 0
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-primary hover:text-primary-600'
          )}
        >
          {isResending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          {countdown > 0 ? `Renvoyer (${countdown}s)` : 'Renvoyer le code'}
        </button>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Changer d&apos;adresse
        </Link>
      </div>
    </div>
  )
}
