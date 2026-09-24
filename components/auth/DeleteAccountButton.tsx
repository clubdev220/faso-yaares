'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Loader2, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'

const CONFIRM_WORD = 'SUPPRIMER'

export function DeleteAccountButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const close = () => {
    if (isDeleting) return
    setIsOpen(false)
    setConfirmText('')
  }

  const handleDelete = async () => {
    if (confirmText.trim().toUpperCase() !== CONFIRM_WORD) return
    setIsDeleting(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.rpc('delete_my_account')
      if (error) throw error

      // L'identifiant de connexion n'existe plus : on vide la session locale.
      await supabase.auth.signOut({ scope: 'local' })
      toast.success('Votre compte a été supprimé.')
      router.push('/')
      router.refresh()
    } catch {
      toast.error('Suppression impossible pour le moment. Réessayez plus tard.')
      setIsDeleting(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-secondary py-3 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
        Supprimer mon compte
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-account-title"
          onClick={close}
        >
          <div className="card w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-secondary" />
                </div>
                <h2 id="delete-account-title" className="text-lg font-heading font-bold text-gray-900">
                  Supprimer votre compte ?
                </h2>
              </div>
              <button
                type="button"
                onClick={close}
                className="p-1 text-gray-400 hover:text-gray-600"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ul className="text-sm text-gray-600 space-y-1.5 mb-4 list-disc pl-5">
              <li>Vos annonces seront retirées du site.</li>
              <li>Votre nom, photo, ville et quartier seront effacés.</li>
              <li>Vous ne pourrez plus vous reconnecter avec ce compte.</li>
              <li>Cette action est définitive.</li>
            </ul>

            <label className="label" htmlFor="delete-confirm">
              Tapez <strong>{CONFIRM_WORD}</strong> pour confirmer
            </label>
            <input
              id="delete-confirm"
              type="text"
              autoComplete="off"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="input mb-4"
              disabled={isDeleting}
            />

            <div className="flex gap-3">
              <button type="button" onClick={close} disabled={isDeleting} className="btn-outline btn-md flex-1">
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting || confirmText.trim().toUpperCase() !== CONFIRM_WORD}
                className="btn-md flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-secondary font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
