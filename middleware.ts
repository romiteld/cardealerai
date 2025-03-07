import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/lib/supabase'

// List of public routes that don't require authentication
const publicRoutes = [
  '/',
  '/sign-in',
  '/sign-up',
  '/forgot-password',
  '/reset-password',
  '/api/auth/callback',
]

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // Get the pathname
  const path = req.nextUrl.pathname
  
  // Debug information
  console.log('Middleware processing path:', path)
  
  // If the path is a public route, allow access immediately without checking auth
  if (publicRoutes.includes(path)) {
    console.log('Public route detected, allowing access without auth check')
    return res
  }
  
  // If it's an API route, allow access
  if (path.startsWith('/api/public/')) {
    console.log('Public API route detected, allowing access without auth check')
    return res
  }
  
  // Check for authentication only for protected routes
  try {
    // Create a Supabase client for the middleware
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name: string) => {
            const cookie = req.cookies.get(name)
            console.log(`Cookie ${name}:`, cookie ? 'present' : 'missing')
            return cookie?.value
          },
          set: (name: string, value: string, options: { path: string; maxAge: number; domain?: string }) => {
            console.log(`Setting cookie ${name}`)
            res.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove: (name: string, options: { path: string; domain?: string }) => {
            console.log(`Removing cookie ${name}`)
            res.cookies.set({
              name,
              value: '',
              ...options,
              maxAge: 0,
            })
          },
        },
      }
    )
    
    // Get the session
    const {
      data: { session },
    } = await supabase.auth.getSession()
    
    console.log('Session check result:', session ? 'Authenticated' : 'Not authenticated')
    
    // Check authentication for protected routes
    if (!session) {
      console.log('No session found, redirecting to sign-in')
      const url = new URL('/sign-in', req.url)
      url.searchParams.set('redirect', path)
      return NextResponse.redirect(url)
    }
    
    // User is authenticated, allow access
    console.log('User authenticated, allowing access to protected route')
    return res
  } catch (error) {
    console.error('Error in middleware:', error)
    // In case of any error, redirect to sign-in
    const url = new URL('/sign-in', req.url)
    url.searchParams.set('error', 'An error occurred during authentication check')
    return NextResponse.redirect(url)
  }
}

// Define which paths this middleware should run on
export const config = {
  matcher: [
    // Match all paths except:
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico, robots.txt (basic browser files)
    // - public assets
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|public).*)',
  ],
} 