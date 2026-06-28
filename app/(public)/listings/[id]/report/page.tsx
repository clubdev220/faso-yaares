'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Flag, Loader2, ChevronLeft } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { reportSchema, type ReportInput } from '@/lib/validations'
import { REPORT_REASONS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

export default function ReportPage() {
  const params = useParams()
  const listingId = params.id as string
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReportInput>({
    resolver: zodResolver(reportSchema),
    defaultValues: { listing_id: listingId, reason: 'scam' },
  })

  // Check auth on mount — redirect to login if not connected
  useState(() => {
    createClient()
      .auth.getUser()
      .then(({ data: { user } }) => {
        if (!user) {
          router.replace(`/login?redirect=/listings/${listingId}/report`)
        } else {
          setAuthChecked(true)
        }
      })
  })

  const onSubmit = async (data: ReportInput) => {
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error()
      toast.success('Signalement envoyé. Merci !')
      router.push(`/listings/${listingId}`)
    } catch {
      toast.error('Erreur lors du signalement')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!authChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Back link */}
      <Link
        href={`/listings/${listingId}`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Retour à l&apos;annonce
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
          <Flag className="w-5 h-5 text-secondary" />
        </div>
        <div>
          <h1 className="text-xl font-heading font-bold text-gray-900">Signaler cette annonce</h1>
          <p className="text-sm text-gray-500">Aidez-nous à maintenir la qualité du marché</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <input type="hidden" {...register('listing_id')} />

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Raison du signalement <span className="text-secondary">*</span>
          </label>
          <div className="space-y-2">
            {REPORT_REASONS.map((reason) => (
              <label
                key={reason.value}
                className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-primary/40 hover:bg-primary/5 cursor-pointer transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/10"
              >
                <input
                  type="radio"
                  value={reason.value}
                  {...register('reason')}
                  className="text-primary focus:ring-primary w-4 h-4"
                />
                <span className="text-sm text-gray-700">{reason.label}</span>
              </label>
            ))}
          </div>
          {errors.reason && (
            <p className="mt-2 text-xs text-red-500">{errors.reason.message}</p>
          )}
        </div>

        {/* Details */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="details">
            Détails supplémentaires <span className="text-gray-400">(optionnel)</span>
          </label>
          <textarea
            id="details"
            {...register('details')}
            rows={4}
            placeholder="Décrivez le problème en détail..."
            className={cn('input resize-none w-full', errors.details && 'input-error')}
            maxLength={500}
          />
          {errors.details && (
            <p className="mt-1 text-xs text-red-500">{errors.details.message}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Link
            href={`/listings/${listingId}`}
            className="btn-ghost btn-lg flex-1 text-center"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-secondary btn-lg flex-1"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Flag className="w-4 h-4" />
            )}
            Envoyer le signalement
          </button>
        </div>
      </form>
    </div>
  )
}
