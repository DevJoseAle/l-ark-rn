
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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      campaign_beneficiaries: {
        Row: {
          beneficiary_user_id: string
          campaign_id: string
          created_at: string
          id: string
          is_active: boolean
          priority: number | null
          share_type: Database["public"]["Enums"]["beneficiary_share_type"]
          share_value: number
          updated_at: string
        }
        Insert: {
          beneficiary_user_id: string
          campaign_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          priority?: number | null
          share_type: Database["public"]["Enums"]["beneficiary_share_type"]
          share_value: number
          updated_at?: string
        }
        Update: {
          beneficiary_user_id?: string
          campaign_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          priority?: number | null
          share_type?: Database["public"]["Enums"]["beneficiary_share_type"]
          share_value?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_beneficiaries_beneficiary_user_id_fkey"
            columns: ["beneficiary_user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_beneficiaries_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_images: {
        Row: {
          campaign_id: string
          created_at: string
          display_order: number
          id: string
          image_url: string
          is_primary: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
          is_primary?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
          is_primary?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_images_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_images_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          beneficiary_rule:
            | Database["public"]["Enums"]["beneficiary_rule"]
            | null
          created_at: string
          currency: string
          description: string | null
          end_at: string | null
          goal_amount: number | null
          hard_cap: number | null
          has_diagnosis: boolean
          id: string
          owner_user_id: string
          soft_cap: number | null
          start_at: string | null
          status: Database["public"]["Enums"]["campaign_status"]
          title: string
          total_raised: number
          updated_at: string
          visibility: Database["public"]["Enums"]["campaign_visibility"]
        }
        Insert: {
          beneficiary_rule?:
            | Database["public"]["Enums"]["beneficiary_rule"]
            | null
          created_at?: string
          currency?: string
          description?: string | null
          end_at?: string | null
          goal_amount?: number | null
          hard_cap?: number | null
          has_diagnosis?: boolean
          id?: string
          owner_user_id: string
          soft_cap?: number | null
          start_at?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
          title: string
          total_raised?: number
          updated_at?: string
          visibility?: Database["public"]["Enums"]["campaign_visibility"]
        }
        Update: {
          beneficiary_rule?:
            | Database["public"]["Enums"]["beneficiary_rule"]
            | null
          created_at?: string
          currency?: string
          description?: string | null
          end_at?: string | null
          goal_amount?: number | null
          hard_cap?: number | null
          has_diagnosis?: boolean
          id?: string
          owner_user_id?: string
          soft_cap?: number | null
          start_at?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
          title?: string
          total_raised?: number
          updated_at?: string
          visibility?: Database["public"]["Enums"]["campaign_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      donations: {
        Row: {
          amount: number
          amount_in_campaign_ccy: number
          campaign_id: string
          created_at: string
          currency: string
          donor_user_id: string | null
          exchange_rate: number | null
          id: string
          message: string | null
          net_amount: number | null
          provider: Database["public"]["Enums"]["payment_provider"]
          provider_charge_id: string | null
          provider_fee: number | null
          provider_payment_id: string | null
          receipt_url: string | null
          status: Database["public"]["Enums"]["donation_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          amount_in_campaign_ccy?: number
          campaign_id: string
          created_at?: string
          currency: string
          donor_user_id?: string | null
          exchange_rate?: number | null
          id?: string
          message?: string | null
          net_amount?: number | null
          provider: Database["public"]["Enums"]["payment_provider"]
          provider_charge_id?: string | null
          provider_fee?: number | null
          provider_payment_id?: string | null
          receipt_url?: string | null
          status?: Database["public"]["Enums"]["donation_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          amount_in_campaign_ccy?: number
          campaign_id?: string
          created_at?: string
          currency?: string
          donor_user_id?: string | null
          exchange_rate?: number | null
          id?: string
          message?: string | null
          net_amount?: number | null
          provider?: Database["public"]["Enums"]["payment_provider"]
          provider_charge_id?: string | null
          provider_fee?: number | null
          provider_payment_id?: string | null
          receipt_url?: string | null
          status?: Database["public"]["Enums"]["donation_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "donations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_donor_user_id_fkey"
            columns: ["donor_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      kyc_documents: {
        Row: {
          created_at: string
          doc_type: Database["public"]["Enums"]["kyc_doc_type"]
          id: string
          issued_at: string | null
          rejection_reason: string | null
          status: Database["public"]["Enums"]["kyc_doc_status"]
          storage_path: string
          updated_at: string
          user_id: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          doc_type: Database["public"]["Enums"]["kyc_doc_type"]
          id?: string
          issued_at?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["kyc_doc_status"]
          storage_path: string
          updated_at?: string
          user_id: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          doc_type?: Database["public"]["Enums"]["kyc_doc_type"]
          id?: string
          issued_at?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["kyc_doc_status"]
          storage_path?: string
          updated_at?: string
          user_id?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kyc_documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_events: {
        Row: {
          created_at: string
          donation_id: string
          event_type: string
          id: string
          provider: Database["public"]["Enums"]["payment_provider"]
          raw_payload: Json
          signature_valid: boolean
        }
        Insert: {
          created_at?: string
          donation_id: string
          event_type: string
          id?: string
          provider: Database["public"]["Enums"]["payment_provider"]
          raw_payload: Json
          signature_valid?: boolean
        }
        Update: {
          created_at?: string
          donation_id?: string
          event_type?: string
          id?: string
          provider?: Database["public"]["Enums"]["payment_provider"]
          raw_payload?: Json
          signature_valid?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "payment_events_donation_id_fkey"
            columns: ["donation_id"]
            isOneToOne: false
            referencedRelation: "donations"
            referencedColumns: ["id"]
          },
        ]
      }
      todos: {
        Row: {
          created_at: string
          id: number
          is_complete: boolean
          title: string
          updated_at: string
          uuid_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          is_complete?: boolean
          title: string
          updated_at?: string
          uuid_id?: string
        }
        Update: {
          created_at?: string
          id?: number
          is_complete?: boolean
          title?: string
          updated_at?: string
          uuid_id?: string
        }
        Relationships: []
      }
      user_devices: {
        Row: {
          app_version: string | null
          created_at: string
          device_id: string
          device_model: string | null
          id: string
          is_active: boolean
          last_seen_at: string
          os_version: string | null
          platform: string
          push_token: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          app_version?: string | null
          created_at?: string
          device_id: string
          device_model?: string | null
          id?: string
          is_active?: boolean
          last_seen_at?: string
          os_version?: string | null
          platform: string
          push_token?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          app_version?: string | null
          created_at?: string
          device_id?: string
          device_model?: string | null
          id?: string
          is_active?: boolean
          last_seen_at?: string
          os_version?: string | null
          platform?: string
          push_token?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_devices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          country: string | null
          created_at: string
          default_currency: string
          display_name: string
          email: string
          id: string
          kyc_status: Database["public"]["Enums"]["kyc_status"]
          phone: string | null
          pin_set: boolean
          updated_at: string
        }
        Insert: {
          country?: string | null
          created_at?: string
          default_currency?: string
          display_name: string
          email: string
          id: string
          kyc_status?: Database["public"]["Enums"]["kyc_status"]
          phone?: string | null
          pin_set?: boolean
          updated_at?: string
        }
        Update: {
          country?: string | null
          created_at?: string
          default_currency?: string
          display_name?: string
          email?: string
          id?: string
          kyc_status?: Database["public"]["Enums"]["kyc_status"]
          phone?: string | null
          pin_set?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      vault_files: {
        Row: {
          campaign_id: string
          created_at: string
          file_name: string
          file_size_bytes: number
          file_type: string
          id: string
          mime_type: string
          storage_path: string
          subscription_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          file_name: string
          file_size_bytes: number
          file_type?: string
          id?: string
          mime_type: string
          storage_path: string
          subscription_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          file_name?: string
          file_size_bytes?: number
          file_type?: string
          id?: string
          mime_type?: string
          storage_path?: string
          subscription_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vault_files_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vault_files_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "vault_subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vault_files_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      vault_subscriptions: {
        Row: {
          apple_original_transaction_id: string | null
          apple_transaction_id: string | null
          billing_interval: string | null
          campaign_id: string
          created_at: string
          current_period_end: string | null
          current_period_start: string
          id: string
          plan_type: string
          status: string
          storage_quota_bytes: number
          storage_used_bytes: number
          updated_at: string
          user_id: string
        }
        Insert: {
          apple_original_transaction_id?: string | null
          apple_transaction_id?: string | null
          billing_interval?: string | null
          campaign_id: string
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string
          id?: string
          plan_type: string
          status?: string
          storage_quota_bytes: number
          storage_used_bytes?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          apple_original_transaction_id?: string | null
          apple_transaction_id?: string | null
          billing_interval?: string | null
          campaign_id?: string
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string
          id?: string
          plan_type?: string
          status?: string
          storage_quota_bytes?: number
          storage_used_bytes?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vault_subscriptions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vault_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      vault_usage_logs: {
        Row: {
          action: string
          created_at: string
          delta_bytes: number
          id: string
          ip: string | null
          metadata: Json | null
          storage_used_after: number
          storage_used_before: number
          subscription_id: string
          user_agent: string | null
        }
        Insert: {
          action: string
          created_at?: string
          delta_bytes: number
          id?: string
          ip?: string | null
          metadata?: Json | null
          storage_used_after: number
          storage_used_before: number
          subscription_id: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          delta_bytes?: number
          id?: string
          ip?: string | null
          metadata?: Json | null
          storage_used_after?: number
          storage_used_before?: number
          subscription_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vault_usage_logs_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "vault_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      _req_header: {
        Args: { key: string }
        Returns: string
      }
      check_storage_quota: {
        Args: { p_file_size: number; p_subscription_id: string }
        Returns: boolean
      }
      vault_get_or_create_free_subscription: {
        Args: { p_campaign_id: string; p_user_id: string }
        Returns: string
      }
      vault_plan_quota_bytes: {
        Args: { p_plan: string }
        Returns: number
      }
    }
    Enums: {
      beneficiary_rule: "fixed_shares" | "priority" | "single_beneficiary"
      beneficiary_share_type: "percent" | "fixed_amount"
      campaign_status: "draft" | "active" | "paused" | "completed" | "cancelled"
      campaign_visibility: "public" | "unlisted" | "private"
      donation_status:
        | "initiated"
        | "authorized"
        | "paid"
        | "refunded"
        | "chargeback"
        | "failed"
        | "cancelled"
      kyc_doc_status: "uploaded" | "in_review" | "approved" | "rejected"
      kyc_doc_type: "selfie" | "dni_front" | "dni_back" | "proof_of_residence"
      kyc_status: "kyc_pending" | "kyc_review" | "kyc_verified" | "kyc_rejected"
      payment_provider: "mercado_pago" | "stripe" | "manual"
      vault_encryption: "none" | "server_side" | "client_side"
      vault_visibility: "private" | "beneficiaries" | "public"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      beneficiary_rule: ["fixed_shares", "priority", "single_beneficiary"],
      beneficiary_share_type: ["percent", "fixed_amount"],
      campaign_status: ["draft", "active", "paused", "completed", "cancelled"],
      campaign_visibility: ["public", "unlisted", "private"],
      donation_status: [
        "initiated",
        "authorized",
        "paid",
        "refunded",
        "chargeback",
        "failed",
        "cancelled",
      ],
      kyc_doc_status: ["uploaded", "in_review", "approved", "rejected"],
      kyc_doc_type: ["selfie", "dni_front", "dni_back", "proof_of_residence"],
      kyc_status: ["kyc_pending", "kyc_review", "kyc_verified", "kyc_rejected"],
      payment_provider: ["mercado_pago", "stripe", "manual"],
      vault_encryption: ["none", "server_side", "client_side"],
      vault_visibility: ["private", "beneficiaries", "public"],
    },
  },
} as const
