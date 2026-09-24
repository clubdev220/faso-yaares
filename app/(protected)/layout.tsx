import { redirect } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MobileNav } from '@/components/layout/MobileNav'
import { createClient } from '@/lib/supabase/server'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Lecture de son propre profil : la session suffit (RLS), pas besoin de
  // la clé service_role.
  const { data: userProfile } = await supabase
    .from('users')
    .select('full_name, avatar_url')
    .eq('id', user.id)
    .maybeSingle()

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={userProfile} />
      <main className="flex-1 content-with-bottom-nav">{children}</main>
      <Footer />
      <MobileNav />
    </div>
  )
}
