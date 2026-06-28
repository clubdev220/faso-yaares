'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Home, Loader2, MapPin, Phone, User } from 'lucide-react'
import toast from 'react-hot-toast'
import { registerSchema, type RegisterInput } from '@/lib/validations'
import { BURKINA_CITIES } from '@/lib/constants'
import { cn, getSafeRedirectPath } from '@/lib/utils'
import type { User as UserProfile } from '@/types'

type ProfileResponse = {
  profile?: UserProfile
  isComplete?: boolean
  error?: string
}

interface RegisterFormProps {
  mode?: 'complete' | 'edit'
  redirectFallback?: string
}

export function RegisterForm({
  mode = 'complete',
  redirectFallback = '/dashboard',
}: RegisterFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [phone, setPhone] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = getSafeRedirectPath(searchParams.get('redirect'), redirectFallback)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: '',
      city: '',
      neighborhood: '',
    },
  })

  useEffect(() => {
    let isMounted = true

    async function loadProfile() {
      setIsFetching(true)
      try {
        const res = await fetch('/api/auth/profile')
        const result = await res.json() as ProfileResponse

        if (res.status === 401) {
          const registerPath =
            redirectTo === redirectFallback
              ? '/register'
              : `/register?redirect=${encodeURIComponent(redirectTo)}`
          router.replace(`/login?redirect=${encodeURIComponent(registerPath)}`)
          return
        }

        if (!res.ok) {
          throw new Error(result.error || 'Erreur lors du chargement du profil')
        }

        if (!isMounted) return

        const profile = result.profile
        setPhone(profile?.phone || '')
        reset({
          full_name: profile?.full_name === 'Utilisateur' ? '' : profile?.full_name || '',
          city: profile?.city || '',
          neighborhood: profile?.neighborhood || '',
        })
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Erreur lors du chargement du profil')
      } finally {
        if (isMounted) setIsFetching(false)
      }
    }

    void loadProfile()

    return () => {
      isMounted = false
    }
  }, [redirectFallback, redirectTo, reset, router])

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json() as ProfileResponse

      if (!res.ok) {
        throw new Error(result.error || 'Erreur lors de la mise a jour du profil')
      }

      toast.success(
        mode === 'edit'
          ? 'Profil mis a jour.'
          : 'Profil cree avec succes. Bienvenue sur Yaare.'
      )
      router.push(redirectTo)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la mise a jour du profil')
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="card p-6 space-y-4">
        <div className="skeleton h-11 rounded-xl" />
        <div className="skeleton h-11 rounded-xl" />
        <div className="skeleton h-11 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="card p-6">
      {phone && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-primary/5 px-3 py-2 text-sm text-gray-700">
          <Phone className="h-4 w-4 text-primary" />
          <span>{phone}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label className="label" htmlFor="full-name">
            Nom complet <span className="text-secondary">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              id="full-name"
              type="text"
              placeholder="Ex: Jean Kabore"
              autoComplete="name"
              {...register('full_name')}
              className={cn('input pl-10', errors.full_name && 'input-error')}
            />
          </div>
          {errors.full_name && (
            <p className="mt-1 text-xs text-red-500">{errors.full_name.message}</p>
          )}
        </div>

        <div>
          <label className="label" htmlFor="city">
            Ville <span className="text-secondary">*</span>
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              id="city"
              {...register('city')}
              className={cn('input pl-10 appearance-none', errors.city && 'input-error')}
            >
              <option value="">Selectionnez votre ville</option>
              {BURKINA_CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
          {errors.city && (
            <p className="mt-1 text-xs text-red-500">{errors.city.message}</p>
          )}
        </div>

        <div>
          <label className="label" htmlFor="neighborhood">
            Quartier
          </label>
          <div className="relative">
            <Home className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              id="neighborhood"
              type="text"
              placeholder="Ex: Pissy, Dapoya, Samandin"
              autoComplete="address-level3"
              {...register('neighborhood')}
              className={cn('input pl-10', errors.neighborhood && 'input-error')}
            />
          </div>
          {errors.neighborhood && (
            <p className="mt-1 text-xs text-red-500">{errors.neighborhood.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary btn-lg w-full"
        >
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
          {isLoading
            ? 'Enregistrement...'
            : mode === 'edit'
              ? 'Enregistrer'
              : 'Terminer l inscription'}
        </button>
      </form>
    </div>
  )
}
