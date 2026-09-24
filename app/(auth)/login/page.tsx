import type { Metadata } from 'next'
import { Suspense } from 'react'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Connexion',
  description: 'Connectez-vous à votre compte Yaaré par SMS, e-mail ou Google.',
}

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-heading font-bold text-gray-900">Connexion</h1>
        <p className="text-gray-500 mt-2 text-sm">
          Par SMS, par e-mail ou avec Google
        </p>
      </div>
      <Suspense fallback={<div className="skeleton h-48 rounded-2xl" />}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
