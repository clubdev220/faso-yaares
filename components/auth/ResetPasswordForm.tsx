'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'

// On arrive ici via /auth/callback, qui a ouvert une session à partir du
// lien reçu par e-mail : il suffit de changer le mot de passe de la session.
export function ResetPasswordForm() {
  const [hasSession, setHasSession] = useState<boolean | null>(null)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => setHasSession(Boolean(data.user)))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }
    if (password !== confirm) {
      setError('Les deux mots de passe ne correspondent pas')
      return
    }

    setIsLoading(true)
    try {
      const { error: updateError } = await createClient().auth.updateUser({ password })
      if (updateError) throw updateError
      toast.success('Mot de passe modifié.')
      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Impossible de modifier le mot de passe. Le lien a peut-être expiré.')
    } finally {
      setIsLoading(false)
    }
  }

  if (hasSession === null) {
    return <div className="skeleton h-48 rounded-2xl" />
  }

  if (!hasSession) {
    return (
      <div className="card p-6 text-center">
        <p className="text-sm text-gray-600 mb-4">
          Ce lien a expiré ou a déjà été utilisé. Demandez un nouveau lien depuis la page de
          connexion (onglet E-mail, « Mot de passe oublié ? »).
        </p>
        <Link href="/login" className="btn-primary btn-md">
          Retour à la connexion
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-4" noValidate>
      {[
        { id: 'new-password', label: 'Nouveau mot de passe', value: password, set: setPassword },
        { id: 'confirm-password', label: 'Confirmer le mot de passe', value: confirm, set: setConfirm },
      ].map((field) => (
        <div key={field.id}>
          <label className="label" htmlFor={field.id}>
            {field.label}
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              id={field.id}
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={field.value}
              onChange={(e) => field.set(e.target.value)}
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
        </div>
      ))}

      {error && <p className="text-xs text-red-500">{error}</p>}

      <button type="submit" disabled={isLoading} className="btn-primary btn-lg w-full">
        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
        {isLoading ? 'Enregistrement...' : 'Enregistrer le mot de passe'}
      </button>
    </form>
  )
}
