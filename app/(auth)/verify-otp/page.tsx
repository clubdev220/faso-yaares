import type { Metadata } from 'next'
import { Suspense } from 'react'
import { OtpForm } from '@/components/auth/OtpForm'

export const metadata: Metadata = {
  title: 'Vérification OTP',
  description: 'Vérifiez votre numéro de téléphone avec le code reçu par SMS.',
}

export default function VerifyOtpPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">📱</div>
        <h1 className="text-2xl font-heading font-bold text-gray-900">
          Code de vérification
        </h1>
        <p className="text-gray-500 mt-2 text-sm">
          Entrez le code à 6 chiffres reçu par SMS
        </p>
      </div>
      <Suspense fallback={<div className="skeleton h-48 rounded-2xl" />}>
        <OtpForm />
      </Suspense>
    </div>
  )
}
