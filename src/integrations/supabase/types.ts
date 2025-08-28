export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          client_email: string
          client_name: string
          client_phone: string
          created_at: string | null
          date: string
          id: string
          notes: string | null
          professional_id: string | null
          service: string
          service_id: string | null
          service_value_at_appointment: number | null
          status: string | null
          time: string
          user_id: string
        }
        Insert: {
          client_email: string
          client_name: string
          client_phone: string
          created_at?: string | null
          date: string
          id?: string
          notes?: string | null
          professional_id?: string | null
          service: string
          service_id?: string | null
          service_value_at_appointment?: number | null
          status?: string | null
          time: string
          user_id: string
        }
        Update: {
          client_email?: string
          client_name?: string
          client_phone?: string
          created_at?: string | null
          date?: string
          id?: string
          notes?: string | null
          professional_id?: string | null
          service?: string
          service_id?: string | null
          service_value_at_appointment?: number | null
          status?: string | null
          time?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          id: string
          nome: string
          telefone: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          id?: string
          nome: string
          telefone?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          id?: string
          nome?: string
          telefone?: string | null
          user_id?: string
        }
        Relationships: []
      }
      confirmation_tokens: {
        Row: {
          appointment_id: string
          created_at: string
          expires_at: string
          id: string
          token: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          appointment_id: string
          created_at?: string
          expires_at?: string
          id?: string
          token?: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          appointment_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          token?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      product_inventory: {
        Row: {
          cost_per_unit: number | null
          id: string
          min_stock: number | null
          product_id: string
          quantity: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cost_per_unit?: number | null
          id?: string
          min_stock?: number | null
          product_id: string
          quantity?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cost_per_unit?: number | null
          id?: string
          min_stock?: number | null
          product_id?: string
          quantity?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          min_stock_level: number | null
          name: string
          price: number
          supplier_name: string | null
          unit: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          min_stock_level?: number | null
          name: string
          price: number
          supplier_name?: string | null
          unit?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          min_stock_level?: number | null
          name?: string
          price?: number
          supplier_name?: string | null
          unit?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      professionals: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          business_name: string | null
          business_type: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          phone: string | null
        }
        Insert: {
          business_name?: string | null
          business_type?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
        }
        Update: {
          business_name?: string | null
          business_type?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string | null
          duracao: string | null
          id: string
          nome: string
          preco: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          duracao?: string | null
          id?: string
          nome: string
          preco: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          duracao?: string | null
          id?: string
          nome?: string
          preco?: number
          user_id?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string | null
          current_period_end: string | null
          id: string
          stripe_customer_id: string | null
          stripe_price_id: string | null
          stripe_subscription_id: string | null
          subscription_status: string | null
        }
        Insert: {
          created_at?: string | null
          current_period_end?: string | null
          id: string
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
        }
        Update: {
          created_at?: string | null
          current_period_end?: string | null
          id?: string
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          agendamento_id: string | null
          client_id: string | null
          created_at: string | null
          data: string
          descricao: string
          id: string
          nome: string | null
          professional_id: string | null
          tipo: string
          user_id: string
          valor: number
        }
        Insert: {
          agendamento_id?: string | null
          client_id?: string | null
          created_at?: string | null
          data: string
          descricao: string
          id?: string
          nome?: string | null
          professional_id?: string | null
          tipo: string
          user_id: string
          valor: number
        }
        Update: {
          agendamento_id?: string | null
          client_id?: string | null
          created_at?: string | null
          data?: string
          descricao?: string
          id?: string
          nome?: string | null
          professional_id?: string | null
          tipo?: string
          user_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_tokens: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
