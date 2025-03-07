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
  
  // Create a Supabase client for the middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: { path: string; maxAge: number; domain?: string }) {
          res.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: { path: string; domain?: string }) {
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
  
  // Get the pathname
  const path = req.nextUrl.pathname
  
  // If the path is a public route, allow access
  if (publicRoutes.includes(path)) {
    return res
  }
  
  // If it's an API route, allow access
  if (path.startsWith('/api/public/')) {
    return res
  }
  
  // Check authentication for protected routes
  if (!session && !publicRoutes.includes(path)) {
    const url = new URL('/sign-in', req.url)
    url.searchParams.set('redirect', path)
    return NextResponse.redirect(url)
  }
  
  return res
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