import React from 'react'
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import ClientLayout from '../components/layouts/client-layout'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CarDealerAI',
  description: 'AI-powered tools for car dealerships',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ClientLayout>{children}</ClientLayout>
        </ThemeProvider>
      </body>
    </html>
  )
}