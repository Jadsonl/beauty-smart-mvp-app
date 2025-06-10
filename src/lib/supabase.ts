
import { createClient } from '@supabase/supabase-js';

// Usar variáveis de ambiente do Lovable (hardcoded para funcionar corretamente)
const supabaseUrl = 'https://dyauabkczodvhsgyqouq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5YXVhYmtjem9kdmhzZ3lxb3VxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0Njk3MjAsImV4cCI6MjA2NTA0NTcyMH0.0Qt-5fv_OBxzqltbTQR4gdPtwvot9laLBt_vdS4djgo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para as tabelas do banco de dados
export interface Profile {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  stripe_customer_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Appointment {
  id: string;
  user_id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  service_name: string;
  service_price: number;
  appointment_date: string;
  appointment_time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  created_at?: string;
}

export interface Product {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  created_at?: string;
}

export interface ProductInventory {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  min_stock_alert: number;
  updated_at?: string;
}
