import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase'
import { Sidebar } from './components/sidebar'
import { Header } from './components/header'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check authentication
  const supabase = createServerClient()
  const { data } = await supabase.auth.getSession()
  
  // If not authenticated, redirect to sign-in
  if (!data.session) {
    redirect('/sign-in')
  }
  
  // Fetch user profile data
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', data.session.user.id)
    .single()
  
  return (
    <div className="flex h-screen w-full flex-col md:flex-row">
      {/* Sidebar */}
      <Sidebar user={profile} />
      
      {/* Main content */}
      <main className="flex flex-1 flex-col overflow-hidden">
        <Header user={profile} />
        <div className="flex-1 overflow-auto p-4 md:p-6">{children}</div>
      </main>
    </div>
  )
} 