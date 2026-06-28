'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Flag, X, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { reportSchema, type ReportInput } from '@/lib/validations'
import { REPORT_REASONS } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface ReportModalProps {
  listingId: string
}

export function ReportModal({ listingId }: ReportModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReportInput>({
    resolver: zodResolver(reportSchema),
    defaultValues: { listing_id: listingId, reason: 'scam' },
  })

  const openModal = async () => {
    const { data: { user } } = await createClient().auth.getUser()
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
      return
    }
    setIsOpen(true)
  }

  const close = () => {
    setIsOpen(false)
    reset()
  }

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
      close()
    } catch {
      toast.error('Erreur lors du signalement')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <button
        onClick={openModal}
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-secondary transition-colors"
        aria-label="Signaler cette annonce"
      >
        <Flag className="w-3.5 h-3.5" />
        Signaler cette annonce
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60"
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-title"
          onClick={(e) => { if (e.target === e.currentTarget) close() }}
        >
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 id="report-title" className="font-heading font-semibold text-gray-900">
                Signaler cette annonce
              </h2>
              <button
                onClick={close}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable content — explicit max height so footer is always reachable */}
            <form id="report-form" onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto max-h-[45vh] p-5 space-y-4">
              <input type="hidden" {...register('listing_id')} />

              <div>
                <label className="label">
                  Raison du signalement <span className="text-secondary">*</span>
                </label>
                <div className="space-y-2">
                  {REPORT_REASONS.map((reason) => (
                    <label
                      key={reason.value}
                      className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-primary/30 hover:bg-primary/5 cursor-pointer transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/10"
                    >
                      <input
                        type="radio"
                        value={reason.value}
                        {...register('reason')}
                        className="text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-gray-700">{reason.label}</span>
                    </label>
                  ))}
                </div>
                {errors.reason && (
                  <p className="mt-1 text-xs text-red-500">{errors.reason.message}</p>
                )}
              </div>

              <div>
                <label className="label" htmlFor="report-details">
                  Détails supplémentaires (optionnel)
                </label>
                <textarea
                  id="report-details"
                  {...register('details')}
                  rows={3}
                  placeholder="Décrivez le problème..."
                  className={cn('input resize-none', errors.details && 'input-error')}
                  maxLength={500}
                />
                {errors.details && (
                  <p className="mt-1 text-xs text-red-500">{errors.details.message}</p>
                )}
              </div>
            </form>

            {/* Footer — always visible, outside the scroll zone */}
            <div className="flex gap-3 px-5 py-4 border-t border-gray-100">
              <button type="button" onClick={close} className="btn-ghost btn-md flex-1">
                Annuler
              </button>
              <button
                type="submit"
                form="report-form"
                disabled={isSubmitting}
                className="btn-secondary btn-md flex-1"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flag className="w-4 h-4" />}
                Signaler
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
