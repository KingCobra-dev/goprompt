import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

// Database types (will be generated from Supabase)
export type Database = {
  public: {
    Tables: {
      // Add your table types here as you create them
      profiles: {
        Row: {
          id: string
          username: string | null
          name: string | null
          email: string | null
          bio: string | null
          website: string | null
          github: string | null
          twitter: string | null
          reputation: number
          created_at: string
          last_login: string | null
          role: 'general' | 'pro' | 'admin'
          subscription_status: 'active' | 'cancelled' | 'past_due' | 'trialing'
          save_count: number
        }
        Insert: {
          id: string
          username?: string | null
          name?: string | null
          email?: string | null
          bio?: string | null
          website?: string | null
          github?: string | null
          twitter?: string | null
          reputation?: number
          created_at?: string
          last_login?: string | null
          role?: 'general' | 'pro' | 'admin'
          subscription_status?: 'active' | 'cancelled' | 'past_due' | 'trialing'
          save_count?: number
        }
        Update: {
          id?: string
          username?: string | null
          name?: string | null
          email?: string | null
          bio?: string | null
          website?: string | null
          github?: string | null
          twitter?: string | null
          reputation?: number
          created_at?: string
          last_login?: string | null
          role?: 'general' | 'pro' | 'admin'
          subscription_status?: 'active' | 'cancelled' | 'past_due' | 'trialing'
          save_count?: number
        }
      }
      prompts: {
        Row: {
          id: string
          user_id: string
          title: string
          slug: string
          description: string
          content: string
          type: string
          model_compatibility: string[]
          tags: string[]
          visibility: string
          category: string
          language: string | null
          version: string
          parent_id: string | null
          view_count: number
          hearts: number
          save_count: number
          fork_count: number
          comment_count: number
          success_rate: number | null
          success_votes_count: number | null
          template: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          slug: string
          description: string
          content: string
          type?: string
          model_compatibility?: string[]
          tags?: string[]
          visibility?: string
          category?: string
          language?: string | null
          version?: string
          parent_id?: string | null
          view_count?: number
          hearts?: number
          save_count?: number
          fork_count?: number
          comment_count?: number
          success_rate?: number | null
          success_votes_count?: number | null
          template?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          slug?: string
          description?: string
          content?: string
          type?: string
          model_compatibility?: string[]
          tags?: string[]
          visibility?: string
          category?: string
          language?: string | null
          version?: string
          parent_id?: string | null
          view_count?: number
          hearts?: number
          save_count?: number
          fork_count?: number
          comment_count?: number
          success_rate?: number | null
          success_votes_count?: number | null
          template?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          prompt_id: string
          user_id: string
          parent_id: string | null
          content: string
          hearts: number
          is_edited: boolean
          is_deleted: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          prompt_id: string
          user_id: string
          parent_id?: string | null
          content: string
          hearts?: number
          is_edited?: boolean
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          prompt_id?: string
          user_id?: string
          parent_id?: string | null
          content?: string
          hearts?: number
          is_edited?: boolean
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      collections: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string
          visibility: string
          prompt_ids: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string
          visibility?: string
          prompt_ids?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string
          visibility?: string
          prompt_ids?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      portfolios: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string
          subdomain: string
          prompt_ids: string[]
          is_password_protected: boolean
          password: string | null
          is_published: boolean
          view_count: number
          client_access_count: number
          show_pack_attribution: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string
          subdomain: string
          prompt_ids?: string[]
          is_password_protected?: boolean
          password?: string | null
          is_published?: boolean
          view_count?: number
          client_access_count?: number
          show_pack_attribution?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string
          subdomain?: string
          prompt_ids?: string[]
          is_password_protected?: boolean
          password?: string | null
          is_published?: boolean
          view_count?: number
          client_access_count?: number
          show_pack_attribution?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
      prompt_templates: {
        Row: {
          id: string
          prompt_id: string
          name: string
          description: string | null
          fields: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          prompt_id: string
          name: string
          description?: string | null
          fields?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          prompt_id?: string
          name?: string
          description?: string | null
          fields?: any
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
