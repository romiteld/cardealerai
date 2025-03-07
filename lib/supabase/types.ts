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