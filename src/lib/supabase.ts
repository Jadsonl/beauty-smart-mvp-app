
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dyauabkczodvhsgyqouq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5YXVhYmtjem9kdmhzZ3lxb3VxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0Njk3MjAsImV4cCI6MjA2NTA0NTcyMH0.0Qt-5fv_OBxzqltbTQR4gdPtwvot9laLBt_vdS4djgo'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          subscription_plan: string
          subscription_status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          subscription_plan?: string
          subscription_status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          subscription_plan?: string
          subscription_status?: string
          updated_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          user_id: string
          client_name: string
          client_email: string
          client_phone: string
          service_name: string
          price: number
          appointment_date: string
          status: 'scheduled' | 'completed' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          client_name: string
          client_email: string
          client_phone: string
          service_name: string
          price: number
          appointment_date: string
          status?: 'scheduled' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          client_name?: string
          client_email?: string
          client_phone?: string
          service_name?: string
          price?: number
          appointment_date?: string
          status?: 'scheduled' | 'completed' | 'cancelled'
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          category: string | null
          unit_price: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          category?: string | null
          unit_price?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          category?: string | null
          unit_price?: number | null
          updated_at?: string
        }
      }
      product_inventory: {
        Row: {
          id: string
          user_id: string
          product_id: string
          quantity: number
          minimum_stock: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          quantity: number
          minimum_stock: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          quantity?: number
          minimum_stock?: number
          updated_at?: string
        }
      }
    }
  }
}
