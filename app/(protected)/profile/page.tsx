import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { User, MapPin, Phone, Edit2, Shield } from 'lucide-react'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import { LogoutButton } from '@/components/auth/LogoutButton'
import type { User as UserType } from '@/types'

export const metadata: Metadata = {
  title: 'Mon profil',
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const admin = await createAdminClient()
  const { data } = await admin
    .from('users')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  const profile = data as UserType | null

  if (!profile?.full_name || profile.full_name === 'Utilisateur' || !profile?.city) {
    redirect('/register?redirect=/profile')
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-heading font-bold text-gray-900 mb-6">Mon profil</h1>

      <div className="card p-6 mb-4">
        {/* Avatar + Name */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt={profile.full_name || 'Avatar'}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-10 h-10 text-primary" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-heading font-bold text-gray-900">
              {profile?.full_name || 'Utilisateur'}
            </h2>
            {profile?.is_verified && (
              <span className="badge-success badge mt-1">
                <Shield className="w-3 h-3" />
                Vérifié
              </span>
            )}
            <p className="text-sm text-gray-400 mt-1">
              Membre depuis {formatDate(profile?.created_at || user.created_at || '')}
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-3 border-t border-gray-100 pt-4">
          <div className="flex items-center gap-3 text-sm">
            <Phone className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-gray-700">{profile?.phone || user.phone}</span>
          </div>
          {profile?.city && (
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-gray-700">
                {profile.neighborhood ? `${profile.neighborhood}, ` : ''}{profile.city}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <Link href="/profile/edit" className="btn-outline btn-md flex-1">
            <Edit2 className="w-4 h-4" />
            Modifier le profil
          </Link>
          <LogoutButton />
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/dashboard" className="card p-4 text-center hover:shadow-md transition-shadow">
          <p className="text-2xl mb-1">📋</p>
          <p className="text-sm font-medium text-gray-700">Mes annonces</p>
        </Link>
        <Link href="/favorites" className="card p-4 text-center hover:shadow-md transition-shadow">
          <p className="text-2xl mb-1">❤️</p>
          <p className="text-sm font-medium text-gray-700">Mes favoris</p>
        </Link>
      </div>
    </div>
  )
}
