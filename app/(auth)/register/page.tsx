import type { Metadata } from 'next'
import { Suspense } from 'react'
import { RegisterForm } from '@/components/auth/RegisterForm'

export const metadata: Metadata = {
  title: 'Completer le profil',
  description: 'Completez votre profil Yaare apres verification du numero de telephone.',
}

export default function RegisterPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-heading font-bold text-gray-900">
          Completer votre profil
        </h1>
        <p className="text-gray-500 mt-2 text-sm">
          Ajoutez vos informations avant de continuer.
        </p>
      </div>
      <Suspense fallback={<div className="skeleton h-64 rounded-2xl" />}>
        <RegisterForm />
      </Suspense>
    </div>
  )
}
