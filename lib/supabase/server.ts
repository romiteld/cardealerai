import { createServerClient as createServerClientFromSSR } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './types'

// Server-side Supabase client - only for use in Server Components or API routes
export const createServerClient = async () => {
  const cookieStore = cookies()
  
  // Use the supported createServerClient function from @supabase/ssr
  return createServerClientFromSSR<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          try {
            // Use synchronous cookie access here
            // Next.js warns about this but it's currently required for Supabase's cookie handling
            const cookie = cookieStore.get(name)
            return cookie?.value
          } catch (error) {
            console.error(`Error getting cookie ${name}:`, error)
            return undefined
          }
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({
              name,
              value,
              ...options
            })
          } catch (error) {
            console.error(`Error setting cookie ${name}:`, error)
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({
              name,
              value: '',
              ...options,
              maxAge: 0
            })
          } catch (error) {
            console.error(`Error removing cookie ${name}:`, error)
          }
        },
      },
    }
  )
}

// Admin client with service role key - use with caution, has full access to DB
export const createAdminClient = () => {
  return createServerClientFromSSR<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get() { return undefined },
        set() {},
        remove() {},
      },
    }
  )
}

export default createServerClient 