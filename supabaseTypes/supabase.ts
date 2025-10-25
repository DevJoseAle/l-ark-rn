
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
      beneficiary_accounts: {
        Row: {
          connect_status: string | null
          country: Database["public"]["Enums"]["country_code"]
          created_at: string
          external_account_ref: string | null
          external_method: string | null
          id: string
          payout_mode: Database["public"]["Enums"]["payout_mode"]
          stripe_connect_account_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          connect_status?: string | null
          country: Database["public"]["Enums"]["country_code"]
          created_at?: string
          external_account_ref?: string | null
          external_method?: string | null
          id?: string
          payout_mode?: Database["public"]["Enums"]["payout_mode"]
          stripe_connect_account_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          connect_status?: string | null
          country?: Database["public"]["Enums"]["country_code"]
          created_at?: string
          external_account_ref?: string | null
          external_method?: string | null
          id?: string
          payout_mode?: Database["public"]["Enums"]["payout_mode"]
          stripe_connect_account_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "beneficiary_accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      beneficiary_payouts: {
        Row: {
          beneficiary_id: string
          beneficiary_user_id: string
          campaign_id: string
          created_at: string | null
          error_message: string | null
          gross_amount: number
          id: string
          metadata: Json | null
          net_amount: number
          operational_fee: number
          processed_at: string | null
          status: string
          stripe_account_id: string
          stripe_transfer_id: string | null
        }
        Insert: {
          beneficiary_id: string
          beneficiary_user_id: string
          campaign_id: string
          created_at?: string | null
          error_message?: string | null
          gross_amount: number
          id?: string
          metadata?: Json | null
          net_amount: number
          operational_fee: number
          processed_at?: string | null
          status?: string
          stripe_account_id: string
          stripe_transfer_id?: string | null
        }
        Update: {
          beneficiary_id?: string
          beneficiary_user_id?: string
          campaign_id?: string
          created_at?: string | null
          error_message?: string | null
          gross_amount?: number
          id?: string
          metadata?: Json | null
          net_amount?: number
          operational_fee?: number
          processed_at?: string | null
          status?: string
          stripe_account_id?: string
          stripe_transfer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "beneficiary_payouts_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "campaign_beneficiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beneficiary_payouts_beneficiary_user_id_fkey"
            columns: ["beneficiary_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beneficiary_payouts_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_distribution_summary"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "beneficiary_payouts_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beneficiary_payouts_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "vw_campaign_held"
            referencedColumns: ["campaign_id"]
          },
        ]
      }
      campaign_balance: {
        Row: {
          beneficiary_pool: number | null
          campaign_id: string
          created_at: string | null
          distribution_fee_collected: number | null
          id: string
          is_locked: boolean | null
          operational_fee_pending: number | null
          platform_fee_reserved: number | null
          total_distributed: number | null
          total_donated: number | null
          updated_at: string | null
        }
        Insert: {
          beneficiary_pool?: number | null
          campaign_id: string
          created_at?: string | null
          distribution_fee_collected?: number | null
          id?: string
          is_locked?: boolean | null
          operational_fee_pending?: number | null
          platform_fee_reserved?: number | null
          total_distributed?: number | null
          total_donated?: number | null
          updated_at?: string | null
        }
        Update: {
          beneficiary_pool?: number | null
          campaign_id?: string
          created_at?: string | null
          distribution_fee_collected?: number | null
          id?: string
          is_locked?: boolean | null
          operational_fee_pending?: number | null
          platform_fee_reserved?: number | null
          total_distributed?: number | null
          total_donated?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_balance_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_distribution_summary"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "campaign_balance_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_balance_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "vw_campaign_held"
            referencedColumns: ["campaign_id"]
          },
        ]
      }
      campaign_beneficiaries: {
        Row: {
          beneficiary_country: string | null
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
          beneficiary_country?: string | null
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
          beneficiary_country?: string | null
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
            referencedRelation: "campaign_distribution_summary"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "campaign_beneficiaries_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_beneficiaries_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "vw_campaign_held"
            referencedColumns: ["campaign_id"]
          },
        ]
      }
      campaign_images: {
        Row: {
          beneficiary_id: string | null
          campaign_id: string
          created_at: string
          display_order: number
          id: string
          image_type: Database["public"]["Enums"]["campaign_image_type"]
          image_url: string
          is_primary: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          beneficiary_id?: string | null
          campaign_id: string
          created_at?: string
          display_order?: number
          id?: string
          image_type?: Database["public"]["Enums"]["campaign_image_type"]
          image_url: string
          is_primary?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          beneficiary_id?: string | null
          campaign_id?: string
          created_at?: string
          display_order?: number
          id?: string
          image_type?: Database["public"]["Enums"]["campaign_image_type"]
          image_url?: string
          is_primary?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_images_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "campaign_beneficiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_images_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_distribution_summary"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "campaign_images_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_images_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "vw_campaign_held"
            referencedColumns: ["campaign_id"]
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
          country: string
          created_at: string
          currency: string
          description: string | null
          end_at: string | null
          goal_amount: number | null
          hard_cap: number | null
          has_diagnosis: boolean
          id: string
          owner_user_id: string
          short_code: string | null
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
          country?: string
          created_at?: string
          currency?: string
          description?: string | null
          end_at?: string | null
          goal_amount?: number | null
          hard_cap?: number | null
          has_diagnosis?: boolean
          id?: string
          owner_user_id: string
          short_code?: string | null
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
          country?: string
          created_at?: string
          currency?: string
          description?: string | null
          end_at?: string | null
          goal_amount?: number | null
          hard_cap?: number | null
          has_diagnosis?: boolean
          id?: string
          owner_user_id?: string
          short_code?: string | null
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
      country_config: {
        Row: {
          country_code: string
          currency: string
          metadata: Json | null
          operational_fee_percent: number | null
          platform_enabled: boolean | null
          stripe_minimum_transfer: number
          updated_at: string | null
        }
        Insert: {
          country_code: string
          currency: string
          metadata?: Json | null
          operational_fee_percent?: number | null
          platform_enabled?: boolean | null
          stripe_minimum_transfer: number
          updated_at?: string | null
        }
        Update: {
          country_code?: string
          currency?: string
          metadata?: Json | null
          operational_fee_percent?: number | null
          platform_enabled?: boolean | null
          stripe_minimum_transfer?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      distribution_logs: {
        Row: {
          campaign_id: string
          created_at: string | null
          event_type: string
          id: string
          message: string
          metadata: Json | null
          severity: string
          triggered_by: string | null
        }
        Insert: {
          campaign_id: string
          created_at?: string | null
          event_type: string
          id?: string
          message: string
          metadata?: Json | null
          severity?: string
          triggered_by?: string | null
        }
        Update: {
          campaign_id?: string
          created_at?: string | null
          event_type?: string
          id?: string
          message?: string
          metadata?: Json | null
          severity?: string
          triggered_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "distribution_logs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_distribution_summary"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "distribution_logs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "distribution_logs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "vw_campaign_held"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "distribution_logs_triggered_by_fkey"
            columns: ["triggered_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      donations: {
        Row: {
          amount: number
          amount_in_campaign_ccy: number
          beneficiary_amount: number | null
          campaign_id: string
          connect_account_id: string | null
          created_at: string
          currency: string
          donor_user_id: string | null
          exchange_rate: number | null
          external_payout_receipt_url: string | null
          external_payout_ref: string | null
          id: string
          message: string | null
          net_amount: number | null
          note: string | null
          paid_out_at: string | null
          payout_mode: Database["public"]["Enums"]["payout_mode"] | null
          payout_status: Database["public"]["Enums"]["payout_status"] | null
          platform_fee: number | null
          provider: Database["public"]["Enums"]["payment_provider"]
          provider_charge_id: string | null
          provider_fee: number | null
          provider_payment_id: string | null
          receipt_url: string | null
          released_at: string | null
          status: Database["public"]["Enums"]["donation_status"]
          transfer_group: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          amount_in_campaign_ccy?: number
          beneficiary_amount?: number | null
          campaign_id: string
          connect_account_id?: string | null
          created_at?: string
          currency: string
          donor_user_id?: string | null
          exchange_rate?: number | null
          external_payout_receipt_url?: string | null
          external_payout_ref?: string | null
          id?: string
          message?: string | null
          net_amount?: number | null
          note?: string | null
          paid_out_at?: string | null
          payout_mode?: Database["public"]["Enums"]["payout_mode"] | null
          payout_status?: Database["public"]["Enums"]["payout_status"] | null
          platform_fee?: number | null
          provider: Database["public"]["Enums"]["payment_provider"]
          provider_charge_id?: string | null
          provider_fee?: number | null
          provider_payment_id?: string | null
          receipt_url?: string | null
          released_at?: string | null
          status?: Database["public"]["Enums"]["donation_status"]
          transfer_group?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          amount_in_campaign_ccy?: number
          beneficiary_amount?: number | null
          campaign_id?: string
          connect_account_id?: string | null
          created_at?: string
          currency?: string
          donor_user_id?: string | null
          exchange_rate?: number | null
          external_payout_receipt_url?: string | null
          external_payout_ref?: string | null
          id?: string
          message?: string | null
          net_amount?: number | null
          note?: string | null
          paid_out_at?: string | null
          payout_mode?: Database["public"]["Enums"]["payout_mode"] | null
          payout_status?: Database["public"]["Enums"]["payout_status"] | null
          platform_fee?: number | null
          provider?: Database["public"]["Enums"]["payment_provider"]
          provider_charge_id?: string | null
          provider_fee?: number | null
          provider_payment_id?: string | null
          receipt_url?: string | null
          released_at?: string | null
          status?: Database["public"]["Enums"]["donation_status"]
          transfer_group?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "donations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_distribution_summary"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "donations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "vw_campaign_held"
            referencedColumns: ["campaign_id"]
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
      fund_ledger: {
        Row: {
          amount: number
          created_at: string
          currency: string
          donation_id: string
          entry_type: Database["public"]["Enums"]["ledger_type"]
          id: string
          meta: Json | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          donation_id: string
          entry_type: Database["public"]["Enums"]["ledger_type"]
          id?: string
          meta?: Json | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          donation_id?: string
          entry_type?: Database["public"]["Enums"]["ledger_type"]
          id?: string
          meta?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "fund_ledger_donation_id_fkey"
            columns: ["donation_id"]
            isOneToOne: false
            referencedRelation: "donations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fund_ledger_donation_id_fkey"
            columns: ["donation_id"]
            isOneToOne: false
            referencedRelation: "vw_donations_finance"
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
      kyc_verifications: {
        Row: {
          created_at: string
          id: string
          id_back_url: string
          id_front_url: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          selfie_url: string
          status: string
          submitted_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          id_back_url: string
          id_front_url: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          selfie_url: string
          status?: string
          submitted_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          id_back_url?: string
          id_front_url?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          selfie_url?: string
          status?: string
          submitted_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kyc_verifications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kyc_verifications_user_id_fkey"
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
          {
            foreignKeyName: "payment_events_donation_id_fkey"
            columns: ["donation_id"]
            isOneToOne: false
            referencedRelation: "vw_donations_finance"
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
            referencedRelation: "campaign_distribution_summary"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "vault_files_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vault_files_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "vw_campaign_held"
            referencedColumns: ["campaign_id"]
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
            referencedRelation: "campaign_distribution_summary"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "vault_subscriptions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vault_subscriptions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "vw_campaign_held"
            referencedColumns: ["campaign_id"]
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
      campaign_distribution_summary: {
        Row: {
          beneficiary_pool: number | null
          campaign_id: string | null
          campaign_status: Database["public"]["Enums"]["campaign_status"] | null
          completed_payouts: number | null
          failed_payouts: number | null
          is_locked: boolean | null
          pending_distribution: number | null
          platform_fee_reserved: number | null
          title: string | null
          total_beneficiaries: number | null
          total_distributed: number | null
          total_donated: number | null
          total_payouts: number | null
        }
        Relationships: []
      }
      vw_campaign_held: {
        Row: {
          campaign_id: string | null
          gross_campaign_ccy: number | null
          title: string | null
          total_beneficiary_net: number | null
          total_held: number | null
          total_paid_out: number | null
          total_platform_fee: number | null
          total_stripe_fee: number | null
        }
        Relationships: []
      }
      vw_donations_finance: {
        Row: {
          beneficiary_amount: number | null
          campaign_id: string | null
          connect_account_id: string | null
          currency: string | null
          gross_amount: number | null
          id: string | null
          net_after_stripe: number | null
          paid_out_at: string | null
          payout_mode: Database["public"]["Enums"]["payout_mode"] | null
          payout_status: Database["public"]["Enums"]["payout_status"] | null
          platform_fee: number | null
          released_at: string | null
          stripe_fee: number | null
          transfer_group: string | null
        }
        Insert: {
          beneficiary_amount?: never
          campaign_id?: string | null
          connect_account_id?: string | null
          currency?: string | null
          gross_amount?: never
          id?: string | null
          net_after_stripe?: never
          paid_out_at?: string | null
          payout_mode?: Database["public"]["Enums"]["payout_mode"] | null
          payout_status?: Database["public"]["Enums"]["payout_status"] | null
          platform_fee?: never
          released_at?: string | null
          stripe_fee?: never
          transfer_group?: string | null
        }
        Update: {
          beneficiary_amount?: never
          campaign_id?: string | null
          connect_account_id?: string | null
          currency?: string | null
          gross_amount?: never
          id?: string | null
          net_after_stripe?: never
          paid_out_at?: string | null
          payout_mode?: Database["public"]["Enums"]["payout_mode"] | null
          payout_status?: Database["public"]["Enums"]["payout_status"] | null
          platform_fee?: never
          released_at?: string | null
          stripe_fee?: never
          transfer_group?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_distribution_summary"
            referencedColumns: ["campaign_id"]
          },
          {
            foreignKeyName: "donations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "vw_campaign_held"
            referencedColumns: ["campaign_id"]
          },
        ]
      }
    }
    Functions: {
      _req_header: { Args: { key: string }; Returns: string }
      calculate_donation_split: {
        Args: { p_amount: number }
        Returns: {
          beneficiary_pool: number
          platform_fee: number
        }[]
      }
      check_storage_quota: {
        Args: { p_file_size: number; p_subscription_id: string }
        Returns: boolean
      }
      generate_short_code: { Args: never; Returns: string }
      get_available_balance: {
        Args: { p_campaign_id: string }
        Returns: number
      }
      is_connect_supported: { Args: { p_country: string }; Returns: boolean }
      search_users_for_beneficiaries: {
        Args: { exclude_user_id?: string; search_query: string }
        Returns: {
          display_name: string
          email: string
          id: string
          kyc_status: Database["public"]["Enums"]["kyc_status"]
        }[]
      }
      vault_get_or_create_free_subscription: {
        Args: { p_campaign_id: string; p_user_id: string }
        Returns: string
      }
      vault_plan_quota_bytes: { Args: { p_plan: string }; Returns: number }
    }
    Enums: {
      beneficiary_rule: "fixed_shares" | "priority" | "single_beneficiary"
      beneficiary_share_type: "percent" | "fixed_amount"
      campaign_image_type: "campaign" | "diagnosis" | "beneficiary"
      campaign_status: "draft" | "active" | "paused" | "completed" | "cancelled"
      campaign_visibility: "public" | "unlisted" | "private"
      country_code: "US" | "MX" | "CO" | "CL"
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
      ledger_type:
        | "in"
        | "platform_fee"
        | "stripe_fee"
        | "transfer"
        | "external_payout"
        | "refund"
        | "chargeback"
        | "adjustment"
      payment_provider: "mercado_pago" | "stripe" | "manual"
      payout_mode: "connect" | "external"
      payout_status:
        | "none"
        | "held"
        | "released"
        | "paid_out"
        | "paid_out_externally"
        | "failed"
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
      campaign_image_type: ["campaign", "diagnosis", "beneficiary"],
      campaign_status: ["draft", "active", "paused", "completed", "cancelled"],
      campaign_visibility: ["public", "unlisted", "private"],
      country_code: ["US", "MX", "CO", "CL"],
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
      ledger_type: [
        "in",
        "platform_fee",
        "stripe_fee",
        "transfer",
        "external_payout",
        "refund",
        "chargeback",
        "adjustment",
      ],
      payment_provider: ["mercado_pago", "stripe", "manual"],
      payout_mode: ["connect", "external"],
      payout_status: [
        "none",
        "held",
        "released",
        "paid_out",
        "paid_out_externally",
        "failed",
      ],
      vault_encryption: ["none", "server_side", "client_side"],
      vault_visibility: ["private", "beneficiaries", "public"],
    },
  },
} as const
