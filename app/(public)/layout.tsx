import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MobileNav } from '@/components/layout/MobileNav'
import { AssistantFab } from '@/components/assistant/AssistantFab'
import { isSupabaseConfigured } from '@/lib/supabase/is-configured'

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let userProfile = null

  if (isSupabaseConfigured()) {
    try {
      const { createClient } = await import('@/lib/supabase/server')
      const supabase = await createClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()

      if (authUser) {
        // Son propre profil se lit avec la session (RLS). Connecté sans ligne
        // de profil : l'en-tête doit quand même afficher l'état connecté.
        const { data } = await supabase
          .from('users')
          .select('full_name, avatar_url')
          .eq('id', authUser.id)
          .maybeSingle()
        userProfile =
          (data as { full_name: string | null; avatar_url: string | null } | null) ??
          { full_name: null, avatar_url: null }
      }
    } catch {
      // ignore
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={userProfile} />
      <main className="flex-1 content-with-bottom-nav">{children}</main>
      <Footer />
      <MobileNav />
      <AssistantFab />
    </div>
  )
}
