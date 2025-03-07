import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/lib/supabase'

export const GET = async (request: NextRequest) => {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  console.log('Auth callback called with code:', code ? 'Present' : 'Missing')
  
  if (code) {
    try {
      // Create a Supabase client using the code
      const supabase = createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      
      // Exchange the code for a session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Error exchanging code for session:', error)
        return NextResponse.redirect(requestUrl.origin + '/sign-in?error=' + encodeURIComponent(error.message))
      }
      
      console.log('Session exchange successful:', data.session ? 'Session present' : 'No session')
      
      // Instead of just redirecting, return an HTML response with a script to store the session in localStorage
      // and then redirect. This ensures the session is available client-side.
      if (data.session) {
        const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Authentication Successful</title>
            <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'unsafe-inline';">
          </head>
          <body>
            <p>Authentication successful. Redirecting...</p>
            <script>
              // Store the tokens in localStorage
              localStorage.setItem('supabase.auth.token', JSON.stringify({
                access_token: "${data.session.access_token}",
                refresh_token: "${data.session.refresh_token}"
              }));
              
              // Store authenticated status
              localStorage.setItem('auth_status', 'authenticated');
              
              // Get the stored redirect path or use default
              const redirectPath = localStorage.getItem('auth_redirect') || '/dashboard';
              localStorage.removeItem('auth_redirect'); // Clear after use
              
              // Redirect to the destination
              window.location.href = "${requestUrl.origin}" + redirectPath;
            </script>
          </body>
        </html>
        `
        
        return new NextResponse(html, {
          status: 200,
          headers: {
            'Content-Type': 'text/html',
          }
        })
      }
      
      // Standard redirect fallback
      return NextResponse.redirect(requestUrl.origin + '/dashboard')
    } catch (err) {
      console.error('Exception in auth callback:', err)
      return NextResponse.redirect(requestUrl.origin + '/sign-in?error=' + encodeURIComponent('An error occurred during authentication'))
    }
  }
  
  // If no code, redirect to home with error
  console.log('No code provided, redirecting to sign-in')
  return NextResponse.redirect(requestUrl.origin + '/sign-in?error=' + encodeURIComponent('No authentication code provided'))
} 