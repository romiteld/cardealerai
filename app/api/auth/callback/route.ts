import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/lib/supabase'

export const GET = async (request: NextRequest) => {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  if (code) {
    // Create a response with a redirect
    const response = NextResponse.redirect(requestUrl.origin + '/dashboard')
    
    // Create a Supabase client using the code
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    // Exchange the code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    // If we have a session and access token, set cookies
    if (data?.session) {
      response.cookies.set('sb-access-token', data.session.access_token, {
        path: '/',
        maxAge: data.session.expires_in,
      })
      
      response.cookies.set('sb-refresh-token', data.session.refresh_token, {
        path: '/',
        maxAge: data.session.expires_in,
      })
    }
    
    return response
  }
  
  // If no code, redirect to home
  return NextResponse.redirect(requestUrl.origin)
} 