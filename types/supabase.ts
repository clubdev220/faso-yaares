export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          phone: string
          full_name: string
          avatar_url: string | null
          city: string | null
          neighborhood: string | null
          is_verified: boolean
          is_blocked: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          phone: string
          full_name?: string
          avatar_url?: string | null
          city?: string | null
          neighborhood?: string | null
          is_verified?: boolean
          is_blocked?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          phone?: string
          full_name?: string
          avatar_url?: string | null
          city?: string | null
          neighborhood?: string | null
          is_verified?: boolean
          is_blocked?: boolean
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          icon: string
          color: string
          parent_id: string | null
          display_order: number
        }
        Insert: {
          id?: string
          name: string
          slug: string
          icon: string
          color: string
          parent_id?: string | null
          display_order?: number
        }
        Update: {
          name?: string
          slug?: string
          icon?: string
          color?: string
          parent_id?: string | null
          display_order?: number
        }
      }
      listings: {
        Row: {
          id: string
          user_id: string
          category_id: string
          title: string
          description: string
          price: number
          currency: string
          city: string
          neighborhood: string | null
          condition: 'new' | 'good' | 'fair'
          is_delivery_available: boolean
          status: 'active' | 'sold' | 'expired' | 'deleted' | 'pending'
          views_count: number
          published_at: string | null
          expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id: string
          title: string
          description: string
          price: number
          currency?: string
          city: string
          neighborhood?: string | null
          condition: 'new' | 'good' | 'fair'
          is_delivery_available?: boolean
          status?: 'active' | 'sold' | 'expired' | 'deleted' | 'pending'
          views_count?: number
          published_at?: string | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          category_id?: string
          title?: string
          description?: string
          price?: number
          city?: string
          neighborhood?: string | null
          condition?: 'new' | 'good' | 'fair'
          is_delivery_available?: boolean
          status?: 'active' | 'sold' | 'expired' | 'deleted' | 'pending'
          views_count?: number
          updated_at?: string
        }
      }
      listing_images: {
        Row: {
          id: string
          listing_id: string
          url: string
          thumbnail_url: string
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          listing_id: string
          url: string
          thumbnail_url: string
          display_order?: number
          created_at?: string
        }
        Update: {
          url?: string
          thumbnail_url?: string
          display_order?: number
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          listing_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          listing_id: string
          created_at?: string
        }
        Update: never
      }
      reports: {
        Row: {
          id: string
          listing_id: string
          reporter_id: string
          reason: string
          details: string | null
          status: 'pending' | 'reviewed' | 'resolved'
          created_at: string
        }
        Insert: {
          id?: string
          listing_id: string
          reporter_id: string
          reason: string
          details?: string | null
          status?: 'pending' | 'reviewed' | 'resolved'
          created_at?: string
        }
        Update: {
          status?: 'pending' | 'reviewed' | 'resolved'
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
