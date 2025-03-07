import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

// Client-side Supabase client - safe to use in client components
export const createClientComponentClient = () => {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export default createClientComponentClient 