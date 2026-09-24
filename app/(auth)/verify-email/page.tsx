import type { Metadata } from 'next'
import { Suspense } from 'react'
import { EmailOtpForm } from '@/components/auth/EmailOtpForm'

export const metadata: Metadata = {
  title: 'Confirmer votre e-mail',
  description: 'Confirmez votre adresse e-mail avec le code reçu.',
}

export default function VerifyEmailPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">✉️</div>
        <h1 className="text-2xl font-heading font-bold text-gray-900">
          Confirmez votre adresse
        </h1>
        <p className="text-gray-500 mt-2 text-sm">
          Entrez le code à 6 chiffres reçu par e-mail
        </p>
      </div>
      <Suspense fallback={<div className="skeleton h-48 rounded-2xl" />}>
        <EmailOtpForm />
      </Suspense>
    </div>
  )
}
