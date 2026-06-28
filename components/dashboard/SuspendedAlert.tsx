'use client'

import { useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'

interface SuspendedAlertProps {
  count: number
}

export function SuspendedAlert({ count }: SuspendedAlertProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed || count === 0) return null

  return (
    <div className="mb-6 flex items-start gap-3 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
      <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-orange-800">
          {count === 1 ? '1 annonce suspendue' : `${count} annonces suspendues`}
        </p>
        <p className="text-xs text-orange-600 mt-0.5">
          Ces annonces ne sont plus visibles par les visiteurs. Cliquez sur l&apos;annonce pour la modifier et la resoumettre.
        </p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Fermer"
        className="flex-shrink-0 text-orange-400 hover:text-orange-600 transition-colors p-0.5 rounded"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
