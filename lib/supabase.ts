import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Environment variables types
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_SUPABASE_URL: string
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string
      SUPABASE_SERVICE_ROLE_KEY: string
    }
  }
}

// Types for our database schema
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          role: 'admin' | 'manager' | 'user'
          dealership_id: string | null
          subscription_tier: 'pro' | 'growth' | 'enterprise' | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          first_name?: string | null
          last_name?: string | null
          role?: 'admin' | 'manager' | 'user'
          dealership_id?: string | null
          subscription_tier?: 'pro' | 'growth' | 'enterprise' | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          role?: 'admin' | 'manager' | 'user'
          dealership_id?: string | null
          subscription_tier?: 'pro' | 'growth' | 'enterprise' | null
          updated_at?: string
        }
      }
      dealerships: {
        Row: {
          id: string
          name: string
          address: string | null
          city: string | null
          state: string | null
          zip: string | null
          phone: string | null
          website: string | null
          subscription_tier: 'pro' | 'growth' | 'enterprise' | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          phone?: string | null
          website?: string | null
          subscription_tier?: 'pro' | 'growth' | 'enterprise' | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          phone?: string | null
          website?: string | null
          subscription_tier?: 'pro' | 'growth' | 'enterprise' | null
          updated_at?: string
        }
      }
      vehicles: {
        Row: {
          id: string
          dealership_id: string
          make: string
          model: string
          year: number
          price: number
          description: string | null
          status: 'available' | 'sold' | 'pending' | 'draft'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          dealership_id: string
          make: string
          model: string
          year: number
          price: number
          description?: string | null
          status?: 'available' | 'sold' | 'pending' | 'draft'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          dealership_id?: string
          make?: string
          model?: string
          year?: number
          price?: number
          description?: string | null
          status?: 'available' | 'sold' | 'pending' | 'draft'
          updated_at?: string
        }
      }
      vehicle_images: {
        Row: {
          id: string
          vehicle_id: string
          url: string
          public_id: string
          is_primary: boolean
          is_enhanced: boolean
          original_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vehicle_id: string
          url: string
          public_id: string
          is_primary?: boolean
          is_enhanced?: boolean
          original_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vehicle_id?: string
          url?: string
          public_id?: string
          is_primary?: boolean
          is_enhanced?: boolean
          original_url?: string | null
          updated_at?: string
        }
      }
      social_accounts: {
        Row: {
          id: string
          dealership_id: string
          platform: 'twitter' | 'facebook' | 'instagram'
          access_token: string
          refresh_token: string | null
          expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          dealership_id: string
          platform: 'twitter' | 'facebook' | 'instagram'
          access_token: string
          refresh_token?: string | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          dealership_id?: string
          platform?: 'twitter' | 'facebook' | 'instagram'
          access_token?: string
          refresh_token?: string | null
          expires_at?: string | null
          updated_at?: string
        }
      }
      social_posts: {
        Row: {
          id: string
          dealership_id: string
          vehicle_id: string
          platform: 'twitter' | 'facebook' | 'instagram'
          content: string
          image_url: string | null
          status: 'draft' | 'scheduled' | 'published' | 'failed'
          platform_post_id: string | null
          scheduled_for: string | null
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          dealership_id: string
          vehicle_id: string
          platform: 'twitter' | 'facebook' | 'instagram'
          content: string
          image_url?: string | null
          status?: 'draft' | 'scheduled' | 'published' | 'failed'
          platform_post_id?: string | null
          scheduled_for?: string | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          dealership_id?: string
          vehicle_id?: string
          platform?: 'twitter' | 'facebook' | 'instagram'
          content?: string
          image_url?: string | null
          status?: 'draft' | 'scheduled' | 'published' | 'failed'
          platform_post_id?: string | null
          scheduled_for?: string | null
          published_at?: string | null
          updated_at?: string
        }
      }
    }
  }
}

// Server-side Supabase client
export const createServerClient = () => {
  const cookieStore = cookies()
  
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false,
      },
      global: {
        headers: {
          Cookie: cookieStore.toString(),
        },
      },
    }
  )
}

// Admin client with higher privileges
export const createAdminClient = () => {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

// Client-side Supabase client
export const createClientComponentClient = () => {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
} 