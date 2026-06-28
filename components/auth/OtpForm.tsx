'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, ArrowLeft, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { cn, getSafeRedirectPath } from '@/lib/utils'

export function OtpForm() {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])
  const router = useRouter()
  const searchParams = useSearchParams()
  const phone = searchParams.get('phone') || ''
  const redirectTo = getSafeRedirectPath(searchParams.get('redirect'), '/dashboard')

  const supabase = createClient()

  useEffect(() => {
    if (countdown <= 0) return
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000)
    return () => clearInterval(timer)
  }, [countdown])

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)

    // Auto-advance
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when complete
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

  const handleVerify = async (code?: string) => {
    const finalCode = code || otp.join('')
    if (finalCode.length !== 6) {
      toast.error('Entrez le code à 6 chiffres')
      return
    }

    setIsVerifying(true)
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token: finalCode,
        type: 'sms',
      })

      if (error) throw error

      if (data.user) {
        const profileRes = await fetch('/api/auth/profile')
        const profileResult = await profileRes.json() as {
          isComplete?: boolean
          error?: string
        }

        if (!profileRes.ok) {
          throw new Error(profileResult.error || 'Erreur lors de la verification du profil')
        }

        if (!profileResult.isComplete) {
          const profilePath = redirectTo.startsWith('/register')
            ? redirectTo
            : `/register?redirect=${encodeURIComponent(redirectTo)}`
          router.push(profilePath)
        } else {
          toast.success('Connexion réussie ! 🎉')
          router.push(redirectTo.startsWith('/register') ? '/dashboard' : redirectTo)
          router.refresh()
        }
      }
    } catch (err) {
      const error = err as Error
      toast.error(error.message === 'Token has expired or is invalid'
        ? 'Code invalide ou expiré. Réessayez.'
        : 'Vérification échouée. Réessayez.')
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    if (countdown > 0) return
    setIsResending(true)
    try {
      const res = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })
      const result = await res.json() as { error?: string; code?: string; details?: string }
      if (!res.ok) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('OTP resend failed:', result)
        }
        throw new Error(result.error || 'Erreur lors du renvoi')
      }
      toast.success('Nouveau code envoyé !')
      setCountdown(60)
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors du renvoi')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="card p-6">
      {phone && (
        <p className="text-center text-sm text-gray-600 mb-6">
          Code envoyé au <strong>{phone}</strong>
        </p>
      )}

      {/* OTP Inputs */}
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

      {/* Submit */}
      <button
        onClick={() => handleVerify()}
        disabled={isVerifying || otp.join('').length !== 6}
        className="btn-primary btn-lg w-full mb-4"
      >
        {isVerifying ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : null}
        {isVerifying ? 'Vérification...' : 'Vérifier le code'}
      </button>

      {/* Resend */}
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

      {/* Back */}
      <div className="mt-4 pt-4 border-t border-gray-100 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Changer de numéro
        </Link>
      </div>
    </div>
  )
}
