import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { RegisterForm } from '@/components/auth/RegisterForm'

export const metadata: Metadata = {
  title: 'Modifier le profil',
}

export default function EditProfilePage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-6 sm:px-6 lg:px-8">
      <Link
        href="/profile"
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
      >
        <ChevronLeft className="h-4 w-4" />
        Retour au profil
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold text-gray-900">
          Modifier le profil
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Ces informations seront visibles sur vos annonces.
        </p>
      </div>

      <Suspense fallback={<div className="skeleton h-64 rounded-2xl" />}>
        <RegisterForm mode="edit" redirectFallback="/profile" />
      </Suspense>
    </div>
  )
}
