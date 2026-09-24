'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, Lock, Mail, MapPin, User } from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { BURKINA_CITIES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { getPostLoginPath, isValidEmail, savePendingEmailSignup } from '@/lib/auth/client'

type Mode = 'signin' | 'signup'

interface EmailAuthFormProps {
  redirectTo: string
}

export function EmailAuthForm({ redirectTo }: EmailAuthFormProps) {
  const [mode, setMode] = useState<Mode>('signin')
  const [fullName, setFullName] = useState('')
  const [city, setCity] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSendingReset, setIsSendingReset] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const trimmedEmail = email.trim()
    if (!isValidEmail(trimmedEmail)) {
      setError('Adresse e-mail invalide')
      return
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }
    if (mode === 'signup' && fullName.trim().length < 2) {
      setError('Entrez votre nom complet')
      return
    }
    if (mode === 'signup' && !city) {
      setError('Sélectionnez votre ville')
      return
    }

    setIsLoading(true)
    try {
      if (mode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: { data: { full_name: fullName.trim() } },
        })
        if (signUpError) throw signUpError

        // Adresse déjà confirmée : Supabase ne renvoie pas d'erreur mais un
        // utilisateur sans identité, et n'envoie aucun code.
        if (data.user && data.user.identities?.length === 0) {
          setError('Un compte existe déjà avec cette adresse. Connectez-vous.')
          setMode('signin')
          return
        }

        savePendingEmailSignup({ email: trimmedEmail, full_name: fullName.trim(), city })
        toast.success('Code envoyé par e-mail !')
        router.push(`/verify-email?redirect=${encodeURIComponent(redirectTo)}`)
        return
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      })
      if (signInError) {
        if (signInError.message.toLowerCase().includes('not confirmed')) {
          await supabase.auth.resend({ type: 'signup', email: trimmedEmail })
          savePendingEmailSignup({ email: trimmedEmail, full_name: '', city: '' })
          toast('Adresse non confirmée : un nouveau code vous a été envoyé.')
          router.push(`/verify-email?redirect=${encodeURIComponent(redirectTo)}`)
          return
        }
        throw signInError
      }

      const nextPath = await getPostLoginPath(redirectTo)
      toast.success('Connexion réussie ! 🎉')
      router.push(nextPath)
      router.refresh()
    } catch {
      setError(
        mode === 'signup'
          ? 'Impossible de créer le compte. Cette adresse est peut-être déjà utilisée.'
          : 'E-mail ou mot de passe incorrect.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    setError(null)
    const trimmedEmail = email.trim()
    if (!isValidEmail(trimmedEmail)) {
      setError('Entrez votre adresse e-mail ci-dessus pour réinitialiser le mot de passe')
      return
    }

    setIsSendingReset(true)
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: `${window.location.origin}/auth/callback?redirect=/reset-password`,
      })
      if (resetError) throw resetError
      toast.success('E-mail envoyé. Consultez votre boîte de réception.')
    } catch {
      toast.error("Impossible d'envoyer l'e-mail pour le moment.")
    } finally {
      setIsSendingReset(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="flex rounded-xl bg-gray-100 p-1 text-sm font-medium">
        {(['signin', 'signup'] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m)
              setError(null)
            }}
            className={cn(
              'flex-1 rounded-lg py-1.5 transition-colors',
              mode === m ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {m === 'signin' ? 'Se connecter' : 'Créer un compte'}
          </button>
        ))}
      </div>

      {mode === 'signup' && (
        <>
          <div>
            <label className="label" htmlFor="signup-name">
              Nom complet
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                id="signup-name"
                type="text"
                autoComplete="name"
                placeholder="Ex: Jean Kabore"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="signup-city">
              Ville
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <select
                id="signup-city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="input pl-10 appearance-none"
              >
                <option value="">Sélectionnez votre ville</option>
                {BURKINA_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </>
      )}

      <div>
        <label className="label" htmlFor="email">
          Adresse e-mail
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="vous@exemple.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="password">
          Mot de passe
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            placeholder="6 caractères minimum"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input pl-10 pr-11"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600"
            aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {mode === 'signin' && (
          <button
            type="button"
            onClick={handleForgotPassword}
            disabled={isSendingReset}
            className="mt-2 text-xs font-medium text-primary hover:text-primary-600"
          >
            {isSendingReset ? 'Envoi…' : 'Mot de passe oublié ?'}
          </button>
        )}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <button type="submit" disabled={isLoading} className="btn-primary btn-lg w-full">
        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5" />}
        {isLoading
          ? 'Patientez...'
          : mode === 'signup'
            ? 'Créer mon compte'
            : 'Se connecter'}
      </button>

      {mode === 'signup' && (
        <p className="text-center text-xs text-gray-400">
          Un code à 6 chiffres sera envoyé à cette adresse pour la confirmer.
        </p>
      )}
    </form>
  )
}
