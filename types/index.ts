export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface User {
  id: string
  phone: string
  full_name: string | null
  avatar_url: string | null
  city: string | null
  neighborhood: string | null
  is_verified: boolean
  is_blocked: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  icon: string
  color: string
  parent_id: string | null
  display_order: number
  children?: Category[]
}

export type ListingCondition = 'new' | 'good' | 'fair'
export type ListingStatus = 'active' | 'sold' | 'expired' | 'deleted' | 'pending' | 'suspended'

export interface Listing {
  id: string
  user_id: string
  category_id: string
  title: string
  description: string
  price: number
  currency: string
  city: string
  neighborhood: string | null
  condition: ListingCondition
  is_delivery_available: boolean
  status: ListingStatus
  views_count: number
  published_at: string | null
  expires_at: string | null
  created_at: string
  updated_at: string
  user?: User
  category?: Category
  images?: ListingImage[]
}

export interface ListingImage {
  id: string
  listing_id: string
  url: string
  thumbnail_url: string
  display_order: number
  created_at: string
}

export interface Favorite {
  id: string
  user_id: string
  listing_id: string
  created_at: string
  listing?: Listing
}

export type ReportReason = 'scam' | 'inappropriate' | 'wrong_category' | 'duplicate' | 'spam' | 'other'
export type ReportStatus = 'pending' | 'reviewed' | 'resolved'

export interface Report {
  id: string
  listing_id: string
  reporter_id: string
  reason: ReportReason
  details: string | null
  status: ReportStatus
  created_at: string
  listing?: Listing
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
}

export interface SearchFilters {
  query?: string
  category_id?: string
  city?: string
  min_price?: number
  max_price?: number
  condition?: ListingCondition
  sort_by?: 'date_desc' | 'date_asc' | 'price_asc' | 'price_desc'
  page?: number
  page_size?: number
}
