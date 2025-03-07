import type { Metadata } from 'next'
import Navbar from '../../components/shared/navbar'
import ChatAssistant from '../../components/shared/chat-assistant'

export const metadata: Metadata = {
  title: 'CarDealerAI',
  description: 'AI-powered tools for car dealerships',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <div className="pt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
      <ChatAssistant />
    </main>
  )
}