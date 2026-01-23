import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type UserType = 'farmer' | 'consumer'

export interface Farmer {
  id: string
  user_id: string
  business_name: string
  latitude: number
  longitude: number
  phone: string
  address: string
  city: string
  state: string
  verified: boolean
  rating: number
  total_reviews: number
  created_at: string
}

export interface Product {
  id: string
  farmer_id: string
  name: string
  description: string
  price: number
  category: string
  image_url: string
  expiration_date: string
  quantity_available: number
  unit: string
  created_at: string
  updated_at: string
  farmer?: Farmer
}

export interface Order {
  id: string
  consumer_id: string
  farmer_id: string
  product_id: string
  quantity: number
  total_price: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  delivery_address: string
  payment_method: string
  notes: string
  created_at: string
  updated_at: string
}

export interface Review {
  id: string
  order_id: string
  reviewer_id: string
  farmer_id: string
  rating: number
  comment: string
  created_at: string
}
