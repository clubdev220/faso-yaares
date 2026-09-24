import type { Metadata } from 'next'
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'

export const metadata: Metadata = {
  title: 'Nouveau mot de passe',
  description: 'Choisissez un nouveau mot de passe pour votre compte Yaaré.',
}

export default function ResetPasswordPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">🔑</div>
        <h1 className="text-2xl font-heading font-bold text-gray-900">
          Nouveau mot de passe
        </h1>
        <p className="text-gray-500 mt-2 text-sm">
          Choisissez un nouveau mot de passe pour votre compte.
        </p>
      </div>
      <ResetPasswordForm />
    </div>
  )
}
