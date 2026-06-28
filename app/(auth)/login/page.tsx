import type { Metadata } from 'next'
import { Suspense } from 'react'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Connexion',
  description: 'Connectez-vous à votre compte Yaaré avec votre numéro de téléphone.',
}

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-heading font-bold text-gray-900">Connexion</h1>
        <p className="text-gray-500 mt-2 text-sm">
          Entrez votre numéro de téléphone pour recevoir un code SMS
        </p>
      </div>
      <Suspense fallback={<div className="skeleton h-48 rounded-2xl" />}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
