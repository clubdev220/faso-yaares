'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      await supabase.auth.signOut()
      toast.success('Déconnexion réussie')
      router.push('/')
      router.refresh()
    } catch {
      toast.error('Erreur lors de la déconnexion')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className="btn-ghost btn-md text-secondary hover:bg-red-50 hover:text-secondary"
      aria-label="Se déconnecter"
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
      {isLoading ? '' : 'Déconnexion'}
    </button>
  )
}
