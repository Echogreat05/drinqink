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
      corporate_activity_log: {
        Row: {
          action: string
          actor_id: string
          corporate_account_id: string
          created_at: string
          details: Json | null
          id: string
          resource_id: string | null
          resource_type: string | null
        }
        Insert: {
          action: string
          actor_id: string
          corporate_account_id: string
          created_at?: string
          details?: Json | null
          id?: string
          resource_id?: string | null
          resource_type?: string | null
        }
        Update: {
          action?: string
          actor_id?: string
          corporate_account_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          resource_id?: string | null
          resource_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "corporate_activity_log_corporate_account_id_fkey"
            columns: ["corporate_account_id"]
            isOneToOne: false
            referencedRelation: "corporate_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      corporate_approvals: {
        Row: {
          approval_amount: number
          approved_at: string | null
          assigned_to: string | null
          corporate_account_id: string
          created_at: string
          id: string
          notes: string | null
          order_id: string
          rejected_at: string | null
          requested_by: string
          status: Database["public"]["Enums"]["approval_status"]
        }
        Insert: {
          approval_amount: number
          approved_at?: string | null
          assigned_to?: string | null
          corporate_account_id: string
          created_at?: string
          id?: string
          notes?: string | null
          order_id: string
          rejected_at?: string | null
          requested_by: string
          status?: Database["public"]["Enums"]["approval_status"]
        }
        Update: {
          approval_amount?: number
          approved_at?: string | null
          assigned_to?: string | null
          corporate_account_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          order_id?: string
          rejected_at?: string | null
          requested_by?: string
          status?: Database["public"]["Enums"]["approval_status"]
        }
        Relationships: [
          {
            foreignKeyName: "corporate_approvals_corporate_account_id_fkey"
            columns: ["corporate_account_id"]
            isOneToOne: false
            referencedRelation: "corporate_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "corporate_approvals_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      corporate_budgets: {
        Row: {
          budget_amount: number
          corporate_account_id: string
          created_at: string
          department_name: string
          id: string
          member_id: string | null
          period_end: string
          period_start: string
          spent_amount: number | null
          updated_at: string
        }
        Insert: {
          budget_amount: number
          corporate_account_id: string
          created_at?: string
          department_name: string
          id?: string
          member_id?: string | null
          period_end: string
          period_start: string
          spent_amount?: number | null
          updated_at?: string
        }
        Update: {
          budget_amount?: number
          corporate_account_id?: string
          created_at?: string
          department_name?: string
          id?: string
          member_id?: string | null
          period_end?: string
          period_start?: string
          spent_amount?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "corporate_budgets_corporate_account_id_fkey"
            columns: ["corporate_account_id"]
            isOneToOne: false
            referencedRelation: "corporate_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      corporate_team_members: {
        Row: {
          added_at: string
          corporate_account_id: string
          id: string
          is_approver: boolean
          role: string
          spending_limit: number | null
          user_id: string
        }
        Insert: {
          added_at?: string
          corporate_account_id: string
          id?: string
          is_approver?: boolean
          role?: string
          spending_limit?: number | null
          user_id: string
        }
        Update: {
          added_at?: string
          corporate_account_id?: string
          id?: string
          is_approver?: boolean
          role?: string
          spending_limit?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "corporate_team_members_corporate_account_id_fkey"
            columns: ["corporate_account_id"]
            isOneToOne: false
            referencedRelation: "corporate_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      dispute_comments: {
        Row: {
          attachments: Json | null
          comment: string
          created_at: string
          dispute_id: string
          id: string
          user_id: string
        }
        Insert: {
          attachments?: Json | null
          comment: string
          created_at?: string
          dispute_id: string
          id?: string
          user_id: string
        }
        Update: {
          attachments?: Json | null
          comment?: string
          created_at?: string
          dispute_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dispute_comments_dispute_id_fkey"
            columns: ["dispute_id"]
            isOneToOne: false
            referencedRelation: "disputes"
            referencedColumns: ["id"]
          },
        ]
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
      event_bookings: {
        Row: {
          accepted_at: string | null
          created_at: string
          event_plan_id: string
          id: string
          order_id: string | null
          status: string
          vendor_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          event_plan_id: string
          id?: string
          order_id?: string | null
          status?: string
          vendor_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          event_plan_id?: string
          id?: string
          order_id?: string | null
          status?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_bookings_event_plan_id_fkey"
            columns: ["event_plan_id"]
            isOneToOne: false
            referencedRelation: "event_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_bookings_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_bookings_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      event_plan_items: {
        Row: {
          created_at: string
          event_plan_id: string
          id: string
          notes: string | null
          product_id: string | null
          product_name: string
          recommended_qty: number
          unit_price: number
          vendor_id: string | null
        }
        Insert: {
          created_at?: string
          event_plan_id: string
          id?: string
          notes?: string | null
          product_id?: string | null
          product_name: string
          recommended_qty: number
          unit_price: number
          vendor_id?: string | null
        }
        Update: {
          created_at?: string
          event_plan_id?: string
          id?: string
          notes?: string | null
          product_id?: string | null
          product_name?: string
          recommended_qty?: number
          unit_price?: number
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_plan_items_event_plan_id_fkey"
            columns: ["event_plan_id"]
            isOneToOne: false
            referencedRelation: "event_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_plan_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_plan_items_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      event_plans: {
        Row: {
          ai_recommendations: Json | null
          budget: number | null
          created_at: string
          customer_id: string
          dietary_preferences: Json | null
          event_type: string
          guest_count: number
          id: string
          special_requests: string | null
          status: Database["public"]["Enums"]["event_plan_status"]
          updated_at: string
        }
        Insert: {
          ai_recommendations?: Json | null
          budget?: number | null
          created_at?: string
          customer_id: string
          dietary_preferences?: Json | null
          event_type: string
          guest_count: number
          id?: string
          special_requests?: string | null
          status?: Database["public"]["Enums"]["event_plan_status"]
          updated_at?: string
        }
        Update: {
          ai_recommendations?: Json | null
          budget?: number | null
          created_at?: string
          customer_id?: string
          dietary_preferences?: Json | null
          event_type?: string
          guest_count?: number
          id?: string
          special_requests?: string | null
          status?: Database["public"]["Enums"]["event_plan_status"]
          updated_at?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          product_id: string | null
          user_id: string
          vendor_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          product_id?: string | null
          user_id: string
          vendor_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string | null
          user_id?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "favorites_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
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
      group_order_items: {
        Row: {
          created_at: string
          group_order_id: string
          id: string
          line_total: number
          member_id: string
          product_id: string | null
          product_name: string
          quantity: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          group_order_id: string
          id?: string
          line_total: number
          member_id: string
          product_id?: string | null
          product_name: string
          quantity: number
          unit_price: number
        }
        Update: {
          created_at?: string
          group_order_id?: string
          id?: string
          line_total?: number
          member_id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "group_order_items_group_order_id_fkey"
            columns: ["group_order_id"]
            isOneToOne: false
            referencedRelation: "group_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      group_order_members: {
        Row: {
          group_order_id: string
          id: string
          joined_at: string
          member_amount: number
          member_id: string
          status: string
        }
        Insert: {
          group_order_id: string
          id?: string
          joined_at?: string
          member_amount?: number
          member_id: string
          status?: string
        }
        Update: {
          group_order_id?: string
          id?: string
          joined_at?: string
          member_amount?: number
          member_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_order_members_group_order_id_fkey"
            columns: ["group_order_id"]
            isOneToOne: false
            referencedRelation: "group_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      group_orders: {
        Row: {
          closing_at: string
          created_at: string
          delivery_fee: number
          description: string | null
          event_date: string | null
          event_time: string | null
          id: string
          location: string | null
          max_participants: number | null
          min_participants: number
          notes: string | null
          organizer_id: string
          participants_count: number
          service_fee: number
          status: Database["public"]["Enums"]["group_order_status"]
          subtotal: number
          title: string
          total_amount: number
          updated_at: string
          vendor_id: string
        }
        Insert: {
          closing_at: string
          created_at?: string
          delivery_fee?: number
          description?: string | null
          event_date?: string | null
          event_time?: string | null
          id?: string
          location?: string | null
          max_participants?: number | null
          min_participants?: number
          notes?: string | null
          organizer_id: string
          participants_count?: number
          service_fee?: number
          status?: Database["public"]["Enums"]["group_order_status"]
          subtotal?: number
          title: string
          total_amount?: number
          updated_at?: string
          vendor_id: string
        }
        Update: {
          closing_at?: string
          created_at?: string
          delivery_fee?: number
          description?: string | null
          event_date?: string | null
          event_time?: string | null
          id?: string
          location?: string | null
          max_participants?: number | null
          min_participants?: number
          notes?: string | null
          organizer_id?: string
          participants_count?: number
          service_fee?: number
          status?: Database["public"]["Enums"]["group_order_status"]
          subtotal?: number
          title?: string
          total_amount?: number
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_orders_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_points: {
        Row: {
          balance: number | null
          created_at: string
          customer_id: string
          id: string
          order_id: string | null
          points: number
          source: string
          tier_id: string | null
        }
        Insert: {
          balance?: number | null
          created_at?: string
          customer_id: string
          id?: string
          order_id?: string | null
          points: number
          source: string
          tier_id?: string | null
        }
        Update: {
          balance?: number | null
          created_at?: string
          customer_id?: string
          id?: string
          order_id?: string | null
          points?: number
          source?: string
          tier_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_points_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loyalty_points_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "loyalty_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_rewards: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          discount_amount: number | null
          discount_percent: number | null
          expires_at: string | null
          id: string
          max_uses: number | null
          name: string
          points_required: number
          uses: number | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          name: string
          points_required: number
          uses?: number | null
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          name?: string
          points_required?: number
          uses?: number | null
        }
        Relationships: []
      }
      loyalty_tiers: {
        Row: {
          benefits: Json | null
          created_at: string
          id: string
          level: number
          max_points: number | null
          min_points: number
          multiplier: number
          name: string
        }
        Insert: {
          benefits?: Json | null
          created_at?: string
          id?: string
          level: number
          max_points?: number | null
          min_points: number
          multiplier?: number
          name: string
        }
        Update: {
          benefits?: Json | null
          created_at?: string
          id?: string
          level?: number
          max_points?: number | null
          min_points?: number
          multiplier?: number
          name?: string
        }
        Relationships: []
      }
      loyalty_transactions: {
        Row: {
          balance_after: number | null
          balance_before: number | null
          created_at: string
          customer_id: string
          description: string | null
          id: string
          order_id: string | null
          points_amount: number
          source: string | null
          transaction_type: Database["public"]["Enums"]["loyalty_transaction_type"]
        }
        Insert: {
          balance_after?: number | null
          balance_before?: number | null
          created_at?: string
          customer_id: string
          description?: string | null
          id?: string
          order_id?: string | null
          points_amount: number
          source?: string | null
          transaction_type: Database["public"]["Enums"]["loyalty_transaction_type"]
        }
        Update: {
          balance_after?: number | null
          balance_before?: number | null
          created_at?: string
          customer_id?: string
          description?: string | null
          id?: string
          order_id?: string | null
          points_amount?: number
          source?: string | null
          transaction_type?: Database["public"]["Enums"]["loyalty_transaction_type"]
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_channels: {
        Row: {
          channel_identifier: string
          channel_type: Database["public"]["Enums"]["notification_channel_type"]
          created_at: string
          id: string
          is_primary: boolean
          is_verified: boolean
          user_id: string
        }
        Insert: {
          channel_identifier: string
          channel_type: Database["public"]["Enums"]["notification_channel_type"]
          created_at?: string
          id?: string
          is_primary?: boolean
          is_verified?: boolean
          user_id: string
        }
        Update: {
          channel_identifier?: string
          channel_type?: Database["public"]["Enums"]["notification_channel_type"]
          created_at?: string
          id?: string
          is_primary?: boolean
          is_verified?: boolean
          user_id?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string
          flash_deals: boolean
          id: string
          loyalty_rewards: boolean
          new_products: boolean
          order_updates: boolean
          promotional: boolean
          system_alerts: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          flash_deals?: boolean
          id?: string
          loyalty_rewards?: boolean
          new_products?: boolean
          order_updates?: boolean
          promotional?: boolean
          system_alerts?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          flash_deals?: boolean
          id?: string
          loyalty_rewards?: boolean
          new_products?: boolean
          order_updates?: boolean
          promotional?: boolean
          system_alerts?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_sent_log: {
        Row: {
          channel_id: string | null
          channel_type: Database["public"]["Enums"]["notification_channel_type"]
          content: string | null
          created_at: string
          error_message: string | null
          id: string
          notification_id: string | null
          recipient: string
          sent_at: string | null
          status: Database["public"]["Enums"]["notification_status"]
          subject: string | null
          user_id: string
        }
        Insert: {
          channel_id?: string | null
          channel_type: Database["public"]["Enums"]["notification_channel_type"]
          content?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          notification_id?: string | null
          recipient: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
          subject?: string | null
          user_id: string
        }
        Update: {
          channel_id?: string | null
          channel_type?: Database["public"]["Enums"]["notification_channel_type"]
          content?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          notification_id?: string | null
          recipient?: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
          subject?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_sent_log_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "notification_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_sent_log_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
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
      order_item_customizations: {
        Row: {
          created_at: string
          customization_name: string
          customization_value: string
          id: string
          order_item_id: string
          price_adjustment: number | null
        }
        Insert: {
          created_at?: string
          customization_name: string
          customization_value: string
          id?: string
          order_item_id: string
          price_adjustment?: number | null
        }
        Update: {
          created_at?: string
          customization_name?: string
          customization_value?: string
          id?: string
          order_item_id?: string
          price_adjustment?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "order_item_customizations_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
        ]
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
      product_analytics: {
        Row: {
          analytics_date: string
          created_at: string
          id: string
          product_id: string
          revenue: number | null
          units_sold: number | null
          vendor_id: string
          views: number | null
        }
        Insert: {
          analytics_date: string
          created_at?: string
          id?: string
          product_id: string
          revenue?: number | null
          units_sold?: number | null
          vendor_id: string
          views?: number | null
        }
        Update: {
          analytics_date?: string
          created_at?: string
          id?: string
          product_id?: string
          revenue?: number | null
          units_sold?: number | null
          vendor_id?: string
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_analytics_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_analytics_vendor_id_fkey"
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
      referral_bonuses: {
        Row: {
          active: boolean
          created_at: string
          id: string
          min_order_amount: number | null
          referral_type: string
          referred_bonus: number
          referrer_bonus: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          min_order_amount?: number | null
          referral_type: string
          referred_bonus: number
          referrer_bonus: number
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          min_order_amount?: number | null
          referral_type?: string
          referred_bonus?: number
          referrer_bonus?: number
        }
        Relationships: []
      }
      referral_redemptions: {
        Row: {
          bonus_amount: number
          id: string
          method: string | null
          redeemed_at: string
          referral_id: string
        }
        Insert: {
          bonus_amount: number
          id?: string
          method?: string | null
          redeemed_at?: string
          referral_id: string
        }
        Update: {
          bonus_amount?: number
          id?: string
          method?: string | null
          redeemed_at?: string
          referral_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_redemptions_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
        ]
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
      subscription_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          quantity: number
          subscription_id: string
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          subscription_id: string
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          subscription_id?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "subscription_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_items_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_orders: {
        Row: {
          created_at: string
          id: string
          order_id: string
          scheduled_for: string
          subscription_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          scheduled_for: string
          subscription_id: string
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          scheduled_for?: string
          subscription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_orders_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_orders_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          customer_id: string
          delivery_fee: number
          description: string | null
          frequency: Database["public"]["Enums"]["subscription_frequency"]
          id: string
          last_order_date: string | null
          name: string
          next_order_date: string
          pause_until: string | null
          service_fee: number
          status: Database["public"]["Enums"]["subscription_status"]
          subtotal: number
          total_spent: number | null
          updated_at: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          delivery_fee?: number
          description?: string | null
          frequency?: Database["public"]["Enums"]["subscription_frequency"]
          id?: string
          last_order_date?: string | null
          name: string
          next_order_date: string
          pause_until?: string | null
          service_fee?: number
          status?: Database["public"]["Enums"]["subscription_status"]
          subtotal?: number
          total_spent?: number | null
          updated_at?: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          delivery_fee?: number
          description?: string | null
          frequency?: Database["public"]["Enums"]["subscription_frequency"]
          id?: string
          last_order_date?: string | null
          name?: string
          next_order_date?: string
          pause_until?: string | null
          service_fee?: number
          status?: Database["public"]["Enums"]["subscription_status"]
          subtotal?: number
          total_spent?: number | null
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      traffic_logs: {
        Row: {
          created_at: string
          event_type: string
          id: string
          product_id: string | null
          session_id: string | null
          user_id: string | null
          vendor_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          product_id?: string | null
          session_id?: string | null
          user_id?: string | null
          vendor_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          product_id?: string | null
          session_id?: string | null
          user_id?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "traffic_logs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "traffic_logs_vendor_id_fkey"
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
      vendor_analytics: {
        Row: {
          analytics_date: string
          average_order_value: number | null
          cancellation_rate: number | null
          created_at: string
          id: string
          orders_count: number | null
          page_views: number | null
          total_items_sold: number | null
          total_sales: number | null
          unique_customers: number | null
          vendor_id: string
        }
        Insert: {
          analytics_date: string
          average_order_value?: number | null
          cancellation_rate?: number | null
          created_at?: string
          id?: string
          orders_count?: number | null
          page_views?: number | null
          total_items_sold?: number | null
          total_sales?: number | null
          unique_customers?: number | null
          vendor_id: string
        }
        Update: {
          analytics_date?: string
          average_order_value?: number | null
          cancellation_rate?: number | null
          created_at?: string
          id?: string
          orders_count?: number | null
          page_views?: number | null
          total_items_sold?: number | null
          total_sales?: number | null
          unique_customers?: number | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_analytics_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
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
      approval_status: "pending" | "approved" | "rejected"
      dispute_status:
        | "open"
        | "under_review"
        | "resolved_customer"
        | "resolved_vendor"
        | "closed"
      event_plan_status:
        | "draft"
        | "recommended"
        | "accepted"
        | "rejected"
        | "completed"
      flash_deal_status: "pending" | "active" | "expired" | "rejected"
      group_order_status:
        | "open"
        | "closing_soon"
        | "closed"
        | "confirmed"
        | "preparing"
        | "ready"
        | "completed"
        | "cancelled"
      loyalty_transaction_type:
        | "earned"
        | "redeemed"
        | "adjusted"
        | "expired"
        | "bonus"
      notification_channel_type: "email" | "sms" | "push" | "in_app"
      notification_status: "pending" | "sent" | "failed" | "bounced"
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
      subscription_frequency: "weekly" | "biweekly" | "monthly"
      subscription_status:
        | "active"
        | "paused"
        | "cancelled"
        | "pending_first_order"
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
      approval_status: ["pending", "approved", "rejected"],
      dispute_status: [
        "open",
        "under_review",
        "resolved_customer",
        "resolved_vendor",
        "closed",
      ],
      event_plan_status: [
        "draft",
        "recommended",
        "accepted",
        "rejected",
        "completed",
      ],
      flash_deal_status: ["pending", "active", "expired", "rejected"],
      group_order_status: [
        "open",
        "closing_soon",
        "closed",
        "confirmed",
        "preparing",
        "ready",
        "completed",
        "cancelled",
      ],
      loyalty_transaction_type: [
        "earned",
        "redeemed",
        "adjusted",
        "expired",
        "bonus",
      ],
      notification_channel_type: ["email", "sms", "push", "in_app"],
      notification_status: ["pending", "sent", "failed", "bounced"],
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
      subscription_frequency: ["weekly", "biweekly", "monthly"],
      subscription_status: [
        "active",
        "paused",
        "cancelled",
        "pending_first_order",
      ],
      vendor_status: ["pending", "approved", "suspended", "rejected"],
    },
  },
} as const
