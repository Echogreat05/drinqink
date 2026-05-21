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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          area: string | null
          city: string
          created_at: string
          id: string
          is_default: boolean
          label: string | null
          lat: number | null
          lng: number | null
          phone: string | null
          recipient_name: string | null
          state: string
          street: string
          user_id: string
        }
        Insert: {
          area?: string | null
          city: string
          created_at?: string
          id?: string
          is_default?: boolean
          label?: string | null
          lat?: number | null
          lng?: number | null
          phone?: string | null
          recipient_name?: string | null
          state: string
          street: string
          user_id: string
        }
        Update: {
          area?: string | null
          city?: string
          created_at?: string
          id?: string
          is_default?: boolean
          label?: string | null
          lat?: number | null
          lng?: number | null
          phone?: string | null
          recipient_name?: string | null
          state?: string
          street?: string
          user_id?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          created_at: string
          event_type: string | null
          guest_count: number | null
          id: string
          order_id: string
          slot_id: string | null
          special_requirements: string | null
        }
        Insert: {
          created_at?: string
          event_type?: string | null
          guest_count?: number | null
          id?: string
          order_id: string
          slot_id?: string | null
          special_requirements?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string | null
          guest_count?: number | null
          id?: string
          order_id?: string
          slot_id?: string | null
          special_requirements?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      bundles: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          items: Json
          name: string
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          items?: Json
          name: string
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          items?: Json
          name?: string
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bundles_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      corporate_accounts: {
        Row: {
          approval_required: boolean
          company_name: string
          created_at: string
          id: string
          monthly_invoice: boolean
          owner_id: string
          spending_limit: number | null
          updated_at: string
        }
        Insert: {
          approval_required?: boolean
          company_name: string
          created_at?: string
          id?: string
          monthly_invoice?: boolean
          owner_id: string
          spending_limit?: number | null
          updated_at?: string
        }
        Update: {
          approval_required?: boolean
          company_name?: string
          created_at?: string
          id?: string
          monthly_invoice?: boolean
          owner_id?: string
          spending_limit?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      disputes: {
        Row: {
          created_at: string
          evidence: Json | null
          id: string
          order_id: string
          raised_by: string
          reason: string
          resolution: string | null
          resolved_at: string | null
          status: Database["public"]["Enums"]["dispute_status"]
        }
        Insert: {
          created_at?: string
          evidence?: Json | null
          id?: string
          order_id: string
          raised_by: string
          reason: string
          resolution?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["dispute_status"]
        }
        Update: {
          created_at?: string
          evidence?: Json | null
          id?: string
          order_id?: string
          raised_by?: string
          reason?: string
          resolution?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["dispute_status"]
        }
        Relationships: [
          {
            foreignKeyName: "disputes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      flash_deals: {
        Row: {
          created_at: string
          discount_percent: number
          ends_at: string
          id: string
          product_id: string
          starts_at: string
          status: Database["public"]["Enums"]["flash_deal_status"]
          vendor_id: string
        }
        Insert: {
          created_at?: string
          discount_percent: number
          ends_at: string
          id?: string
          product_id: string
          starts_at: string
          status?: Database["public"]["Enums"]["flash_deal_status"]
          vendor_id: string
        }
        Update: {
          created_at?: string
          discount_percent?: number
          ends_at?: string
          id?: string
          product_id?: string
          starts_at?: string
          status?: Database["public"]["Enums"]["flash_deal_status"]
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flash_deals_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flash_deals_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_points: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          order_id: string | null
          points: number
          source: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          order_id?: string | null
          points: number
          source: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          order_id?: string | null
          points?: number
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_points_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          link: string | null
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          line_total: number
          order_id: string
          product_id: string | null
          product_name: string
          quantity: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          line_total: number
          order_id: string
          product_id?: string | null
          product_name: string
          quantity: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          line_total?: number
          order_id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          commission: number
          created_at: string
          customer_id: string | null
          delivery_address: Json | null
          delivery_date: string | null
          delivery_fee: number
          delivery_time_window: string | null
          id: string
          notes: string | null
          order_number: string
          paid_at: string | null
          paystack_reference: string | null
          proof_of_delivery: string | null
          service_fee: number
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total_amount: number
          updated_at: string
          vendor_id: string
          vendor_payout: number
        }
        Insert: {
          commission?: number
          created_at?: string
          customer_id?: string | null
          delivery_address?: Json | null
          delivery_date?: string | null
          delivery_fee?: number
          delivery_time_window?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          paid_at?: string | null
          paystack_reference?: string | null
          proof_of_delivery?: string | null
          service_fee?: number
          status?: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total_amount: number
          updated_at?: string
          vendor_id: string
          vendor_payout?: number
        }
        Update: {
          commission?: number
          created_at?: string
          customer_id?: string | null
          delivery_address?: Json | null
          delivery_date?: string | null
          delivery_fee?: number
          delivery_time_window?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          paid_at?: string | null
          paystack_reference?: string | null
          proof_of_delivery?: string | null
          service_fee?: number
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total_amount?: number
          updated_at?: string
          vendor_id?: string
          vendor_payout?: number
        }
        Relationships: [
          {
            foreignKeyName: "orders_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      packages: {
        Row: {
          created_at: string
          description: string | null
          event_type: string | null
          guest_count: number | null
          id: string
          image_url: string | null
          is_active: boolean
          items: Json
          name: string
          price: number
          updated_at: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_type?: string | null
          guest_count?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          items?: Json
          name: string
          price: number
          updated_at?: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          event_type?: string | null
          guest_count?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          items?: Json
          name?: string
          price?: number
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "packages_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      payouts: {
        Row: {
          commission_deducted: number
          created_at: string
          gross_amount: number
          id: string
          net_amount: number
          paid_at: string | null
          period_end: string
          period_start: string
          status: Database["public"]["Enums"]["payout_status"]
          vendor_id: string
        }
        Insert: {
          commission_deducted: number
          created_at?: string
          gross_amount: number
          id?: string
          net_amount: number
          paid_at?: string | null
          period_end: string
          period_start: string
          status?: Database["public"]["Enums"]["payout_status"]
          vendor_id: string
        }
        Update: {
          commission_deducted?: number
          created_at?: string
          gross_amount?: number
          id?: string
          net_amount?: number
          paid_at?: string | null
          period_end?: string
          period_start?: string
          status?: Database["public"]["Enums"]["payout_status"]
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payouts_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          abv: number | null
          category_id: string | null
          compare_at_price: number | null
          created_at: string
          description: string | null
          id: string
          images: string[]
          is_active: boolean
          is_featured: boolean
          min_qty: number
          name: string
          price: number
          slug: string
          stock_qty: number | null
          stock_status: Database["public"]["Enums"]["stock_status"]
          updated_at: string
          vendor_id: string
          volume_ml: number | null
        }
        Insert: {
          abv?: number | null
          category_id?: string | null
          compare_at_price?: number | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[]
          is_active?: boolean
          is_featured?: boolean
          min_qty?: number
          name: string
          price: number
          slug: string
          stock_qty?: number | null
          stock_status?: Database["public"]["Enums"]["stock_status"]
          updated_at?: string
          vendor_id: string
          volume_ml?: number | null
        }
        Update: {
          abv?: number | null
          category_id?: string | null
          compare_at_price?: number | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[]
          is_active?: boolean
          is_featured?: boolean
          min_qty?: number
          name?: string
          price?: number
          slug?: string
          stock_qty?: number | null
          stock_status?: Database["public"]["Enums"]["stock_status"]
          updated_at?: string
          vendor_id?: string
          volume_ml?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          phone: string | null
          referral_code: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          phone?: string | null
          referral_code?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          phone?: string | null
          referral_code?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          referred_id: string
          referrer_id: string
          reward_amount: number | null
          reward_given: boolean
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          referred_id: string
          referrer_id: string
          reward_amount?: number | null
          reward_given?: boolean
          type?: string
        }
        Update: {
          created_at?: string
          id?: string
          referred_id?: string
          referrer_id?: string
          reward_amount?: number | null
          reward_given?: boolean
          type?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          communication_score: number
          created_at: string
          customer_id: string
          delivery_score: number
          id: string
          order_id: string
          packaging_score: number
          quality_score: number
          value_score: number
          vendor_id: string
        }
        Insert: {
          comment?: string | null
          communication_score: number
          created_at?: string
          customer_id: string
          delivery_score: number
          id?: string
          order_id: string
          packaging_score: number
          quality_score: number
          value_score: number
          vendor_id: string
        }
        Update: {
          comment?: string | null
          communication_score?: number
          created_at?: string
          customer_id?: string
          delivery_score?: number
          id?: string
          order_id?: string
          packaging_score?: number
          quality_score?: number
          value_score?: number
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vendor_slots: {
        Row: {
          bookings_count: number
          created_at: string
          date: string
          id: string
          is_available: boolean
          max_bookings: number
          time_window: string
          vendor_id: string
        }
        Insert: {
          bookings_count?: number
          created_at?: string
          date: string
          id?: string
          is_available?: boolean
          max_bookings?: number
          time_window: string
          vendor_id: string
        }
        Update: {
          bookings_count?: number
          created_at?: string
          date?: string
          id?: string
          is_available?: boolean
          max_bookings?: number
          time_window?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_slots_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          badges: string[]
          banner_url: string | null
          business_name: string
          cac_number: string | null
          commission_rate: number
          contact_email: string | null
          contact_phone: string | null
          coverage_areas: string[]
          coverage_states: string[]
          created_at: string
          description: string | null
          id: string
          is_featured: boolean
          logo_url: string | null
          min_order: number
          operating_hours: Json | null
          paystack_subaccount_code: string | null
          rating_avg: number | null
          rating_count: number | null
          response_time_minutes: number | null
          slug: string
          status: Database["public"]["Enums"]["vendor_status"]
          updated_at: string
          user_id: string
          verified: boolean
        }
        Insert: {
          badges?: string[]
          banner_url?: string | null
          business_name: string
          cac_number?: string | null
          commission_rate?: number
          contact_email?: string | null
          contact_phone?: string | null
          coverage_areas?: string[]
          coverage_states?: string[]
          created_at?: string
          description?: string | null
          id?: string
          is_featured?: boolean
          logo_url?: string | null
          min_order?: number
          operating_hours?: Json | null
          paystack_subaccount_code?: string | null
          rating_avg?: number | null
          rating_count?: number | null
          response_time_minutes?: number | null
          slug: string
          status?: Database["public"]["Enums"]["vendor_status"]
          updated_at?: string
          user_id: string
          verified?: boolean
        }
        Update: {
          badges?: string[]
          banner_url?: string | null
          business_name?: string
          cac_number?: string | null
          commission_rate?: number
          contact_email?: string | null
          contact_phone?: string | null
          coverage_areas?: string[]
          coverage_states?: string[]
          created_at?: string
          description?: string | null
          id?: string
          is_featured?: boolean
          logo_url?: string | null
          min_order?: number
          operating_hours?: Json | null
          paystack_subaccount_code?: string | null
          rating_avg?: number | null
          rating_count?: number | null
          response_time_minutes?: number | null
          slug?: string
          status?: Database["public"]["Enums"]["vendor_status"]
          updated_at?: string
          user_id?: string
          verified?: boolean
        }
        Relationships: []
      }
      waitlists: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          notified: boolean
          product_id: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          notified?: boolean
          product_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          notified?: boolean
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "waitlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "customer" | "vendor" | "admin"
      dispute_status:
        | "open"
        | "under_review"
        | "resolved_customer"
        | "resolved_vendor"
        | "closed"
      flash_deal_status: "pending" | "active" | "expired" | "rejected"
      order_status:
        | "pending"
        | "confirmed"
        | "packing"
        | "dispatched"
        | "delivered"
        | "cancelled"
        | "disputed"
      payout_status: "pending" | "processing" | "paid" | "on_hold"
      stock_status: "in_stock" | "low_stock" | "out_of_stock"
      vendor_status: "pending" | "approved" | "suspended" | "rejected"
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
    Enums: {
      app_role: ["customer", "vendor", "admin"],
      dispute_status: [
        "open",
        "under_review",
        "resolved_customer",
        "resolved_vendor",
        "closed",
      ],
      flash_deal_status: ["pending", "active", "expired", "rejected"],
      order_status: [
        "pending",
        "confirmed",
        "packing",
        "dispatched",
        "delivered",
        "cancelled",
        "disputed",
      ],
      payout_status: ["pending", "processing", "paid", "on_hold"],
      stock_status: ["in_stock", "low_stock", "out_of_stock"],
      vendor_status: ["pending", "approved", "suspended", "rejected"],
    },
  },
} as const
