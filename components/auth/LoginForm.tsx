'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Phone } from 'lucide-react'
import toast from 'react-hot-toast'
import { loginSchema, type LoginInput } from '@/lib/validations'
import { cn, getSafeRedirectPath, normalizePhone } from '@/lib/utils'
import { COUNTRY_CODE } from '@/lib/constants'

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = getSafeRedirectPath(searchParams.get('redirect'), '/dashboard')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true)
    try {
      const phone = normalizePhone(data.phone)

      const res = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })

      const result = await res.json() as { error?: string; code?: string; details?: string }

      if (!res.ok) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('OTP request failed:', result)
        }
        toast.error(result.error || 'Erreur lors de l\'envoi du code')
        return
      }

      toast.success('Code envoyé par SMS !')
      router.push(
        `/verify-otp?phone=${encodeURIComponent(phone)}&redirect=${encodeURIComponent(redirectTo)}`
      )
    } catch {
      toast.error('Erreur de connexion. Réessayez.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="card p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Phone Input */}
        <div>
          <label className="label" htmlFor="phone">
            Numéro de téléphone
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
              <span className="text-lg">🇧🇫</span>
              <span className="text-sm font-medium text-gray-500">{COUNTRY_CODE}</span>
            </div>
            <input
              id="phone"
              type="tel"
              inputMode="numeric"
              placeholder="XX XX XX XX"
              autoComplete="tel"
              {...register('phone')}
              className={cn('input pl-[72px]', errors.phone && 'input-error')}
              aria-describedby={errors.phone ? 'phone-error' : undefined}
            />
          </div>
          {errors.phone && (
            <p id="phone-error" className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
              <Phone className="w-3 h-3" />
              {errors.phone.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary btn-lg w-full"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Phone className="w-5 h-5" />
          )}
          {isLoading ? 'Envoi en cours...' : 'Recevoir le code SMS'}
        </button>
      </form>

      <p className="text-center text-xs text-gray-400 mt-4">
        Un code à 6 chiffres sera envoyé par SMS sur ce numéro.
      </p>
    </div>
  )
}
