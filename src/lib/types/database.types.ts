export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Enum types matching the database
export type UserRoleEnum = 'super_admin' | 'admin' | 'manager' | 'staff' | 'readonly'
export type ShopRoleEnum = 'owner' | 'manager' | 'assistant' | 'staff'
export type AuditActionEnum = 'create' | 'update' | 'delete' | 'login' | 'logout' | 'data_upload' | 'report_generation'
export type VerificationStatusEnum = 'pending' | 'approved' | 'rejected' | 'needs_review' | 'manual_override'
export type ProcessingStatusEnum = 'uploaded' | 'processing' | 'completed' | 'failed'
export type FlagStatusEnum = 'open' | 'disputed' | 'resolved'

export interface Database {
  public: {
    Tables: {
      shops: {
        Row: {
          id: string
          shop_name: string
          dp_code: string
          corporation_id: number | null
          state: string
          district: string
          address: string | null
          contact_info: string | null
          license_details: string | null
          capacity_limit: number | null
          is_active: boolean
          alternate_names: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          shop_name: string
          dp_code: string
          corporation_id?: number | null
          state: string
          district: string
          address?: string | null
          contact_info?: string | null
          license_details?: string | null
          capacity_limit?: number | null
          is_active?: boolean
          alternate_names?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          shop_name?: string
          dp_code?: string
          corporation_id?: number | null
          state?: string
          district?: string
          address?: string | null
          contact_info?: string | null
          license_details?: string | null
          capacity_limit?: number | null
          is_active?: boolean
          alternate_names?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      skus: {
        Row: {
          id: string
          brand_name: string
          product_name: string
          size_ml: number
          mrp: number
          category: string
          brand_code: string
          supplier_details: string | null
          alternate_names: string[] | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          brand_name: string
          product_name: string
          size_ml: number
          mrp: number
          category: string
          brand_code: string
          supplier_details?: string | null
          alternate_names?: string[] | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          brand_name?: string
          product_name?: string
          size_ml?: number
          mrp?: number
          category?: string
          brand_code?: string
          supplier_details?: string | null
          alternate_names?: string[] | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          auth_user_id: string
          email: string
          first_name: string
          last_name: string
          phone: string | null
          role: UserRoleEnum
          is_active: boolean
          last_login_at: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          auth_user_id: string
          email: string
          first_name: string
          last_name: string
          phone?: string | null
          role?: UserRoleEnum
          is_active?: boolean
          last_login_at?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          auth_user_id?: string
          email?: string
          first_name?: string
          last_name?: string
          phone?: string | null
          role?: UserRoleEnum
          is_active?: boolean
          last_login_at?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      user_shops: {
        Row: {
          id: string
          user_id: string
          shop_id: string
          role_in_shop: ShopRoleEnum
          assigned_at: string
          assigned_by: string | null
          is_active: boolean
          notes: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          shop_id: string
          role_in_shop?: ShopRoleEnum
          assigned_at?: string
          assigned_by?: string | null
          is_active?: boolean
          notes?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          shop_id?: string
          role_in_shop?: ShopRoleEnum
          assigned_at?: string
          assigned_by?: string | null
          is_active?: boolean
          notes?: string | null
          updated_at?: string
        }
      }
      upload_sessions: {
        Row: {
          id: string
          filename: string
          file_size: number
          file_type: string
          uploaded_by: string
          upload_timestamp: string
          processing_status: ProcessingStatusEnum
          total_records: number
          processed_records: number
          successful_records: number
          failed_records: number
          ai_model_used: string | null
          processing_start_time: string | null
          processing_end_time: string | null
          processing_duration_ms: number | null
          session_expires_at: string
          is_active: boolean
          error_summary: Json | null
        }
        Insert: {
          id?: string
          filename: string
          file_size: number
          file_type: string
          uploaded_by: string
          upload_timestamp?: string
          processing_status?: ProcessingStatusEnum
          total_records?: number
          processed_records?: number
          successful_records?: number
          failed_records?: number
          ai_model_used?: string | null
          processing_start_time?: string | null
          processing_end_time?: string | null
          processing_duration_ms?: number | null
          session_expires_at?: string
          is_active?: boolean
          error_summary?: Json | null
        }
        Update: {
          id?: string
          filename?: string
          file_size?: number
          file_type?: string
          uploaded_by?: string
          upload_timestamp?: string
          processing_status?: ProcessingStatusEnum
          total_records?: number
          processed_records?: number
          successful_records?: number
          failed_records?: number
          ai_model_used?: string | null
          processing_start_time?: string | null
          processing_end_time?: string | null
          processing_duration_ms?: number | null
          session_expires_at?: string
          is_active?: boolean
          error_summary?: Json | null
        }
      }
      parsed_data_staging: {
        Row: {
          id: string
          session_id: string
          record_index: number
          raw_shop_name: string
          raw_brand_name: string
          raw_product_name: string | null
          raw_stock: number
          raw_additional_data: Json | null
          parsing_confidence: number | null
          ai_confidence: number | null
          matched_shop_id: string | null
          matched_sku_id: string | null
          shop_match_confidence: number | null
          sku_match_confidence: number | null
          alternative_shop_matches: Json | null
          alternative_sku_matches: Json | null
          verification_status: VerificationStatusEnum
          manager_notes: string | null
          manual_shop_selection: string | null
          manual_sku_selection: string | null
          manual_stock_override: number | null
          final_shop_id: string | null
          final_sku_id: string | null
          final_stock: number | null
          verified_at: string | null
          verified_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          record_index: number
          raw_shop_name: string
          raw_brand_name: string
          raw_product_name?: string | null
          raw_stock: number
          raw_additional_data?: Json | null
          parsing_confidence?: number | null
          ai_confidence?: number | null
          matched_shop_id?: string | null
          matched_sku_id?: string | null
          shop_match_confidence?: number | null
          sku_match_confidence?: number | null
          alternative_shop_matches?: Json | null
          alternative_sku_matches?: Json | null
          verification_status?: VerificationStatusEnum
          manager_notes?: string | null
          manual_shop_selection?: string | null
          manual_sku_selection?: string | null
          manual_stock_override?: number | null
          final_shop_id?: string | null
          final_sku_id?: string | null
          final_stock?: number | null
          verified_at?: string | null
          verified_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          record_index?: number
          raw_shop_name?: string
          raw_brand_name?: string
          raw_product_name?: string | null
          raw_stock?: number
          raw_additional_data?: Json | null
          parsing_confidence?: number | null
          ai_confidence?: number | null
          matched_shop_id?: string | null
          matched_sku_id?: string | null
          shop_match_confidence?: number | null
          sku_match_confidence?: number | null
          alternative_shop_matches?: Json | null
          alternative_sku_matches?: Json | null
          verification_status?: VerificationStatusEnum
          manager_notes?: string | null
          manual_shop_selection?: string | null
          manual_sku_selection?: string | null
          manual_stock_override?: number | null
          final_shop_id?: string | null
          final_sku_id?: string | null
          final_stock?: number | null
          verified_at?: string | null
          verified_by?: string | null
          created_at?: string
        }
      }
   daily_stocks: {
  Row: {
    id: string
    shop_id: string
    sku_id: string
    report_date: string
    closing_stock: number
    breakage: number
    reported_by: string
    notes: string | null
    photo_url: string | null
    created_at: string
    updated_at: string
  }
  Insert: {
    id?: string
    shop_id: string
    sku_id: string
    report_date: string
    closing_stock: number
    breakage?: number
    reported_by: string
    notes?: string | null
    photo_url?: string | null
    created_at?: string
    updated_at?: string
  }
  Update: {
    id?: string
    shop_id?: string
    sku_id?: string
    report_date?: string
    closing_stock?: number
    breakage?: number
    reported_by?: string
    notes?: string | null
    photo_url?: string | null
    created_at?: string
    updated_at?: string
  }
}
      weekly_corporation_data: {
        Row: {
          id: string
          shop_id: string
          sku_id: string
          week_ending: string
          sales_qty: number
          closing_stock: number
          source_file: string
          parsed_at: string
          confidence: number | null
        }
        Insert: {
          id?: string
          shop_id: string
          sku_id: string
          week_ending: string
          sales_qty: number
          closing_stock: number
          source_file: string
          parsed_at?: string
          confidence?: number | null
        }
        Update: {
          id?: string
          shop_id?: string
          sku_id?: string
          week_ending?: string
          sales_qty?: number
          closing_stock?: number
          source_file?: string
          parsed_at?: string
          confidence?: number | null
        }
      }
      variance_flags: {
        Row: {
          id: string
          shop_id: string
          sku_id: string
          flag_date: string
          variance_percent: number
          status: FlagStatusEnum
          resolution_notes: string | null
          created_by: string | null
          resolved_by: string | null
          resolved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          shop_id: string
          sku_id: string
          flag_date: string
          variance_percent: number
          status?: FlagStatusEnum
          resolution_notes?: string | null
          created_by?: string | null
          resolved_by?: string | null
          resolved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          shop_id?: string
          sku_id?: string
          flag_date?: string
          variance_percent?: number
          status?: FlagStatusEnum
          resolution_notes?: string | null
          created_by?: string | null
          resolved_by?: string | null
          resolved_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_audit_log: {
        Row: {
          id: string
          user_id: string | null
          auth_user_id: string | null
          action: AuditActionEnum
          details: Json
          ip_address: string | null
          user_agent: string | null
          performed_by: string | null
          shop_id: string | null
          before_state: Json | null
          after_state: Json | null
          success: boolean
          error_message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          auth_user_id?: string | null
          action: AuditActionEnum
          details?: Json
          ip_address?: string | null
          user_agent?: string | null
          performed_by?: string | null
          shop_id?: string | null
          before_state?: Json | null
          after_state?: Json | null
          success?: boolean
          error_message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          auth_user_id?: string | null
          action?: AuditActionEnum
          details?: Json
          ip_address?: string | null
          user_agent?: string | null
          performed_by?: string | null
          shop_id?: string | null
          before_state?: Json | null
          after_state?: Json | null
          success?: boolean
          error_message?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role_enum: UserRoleEnum
      shop_role_enum: ShopRoleEnum
      audit_action_enum: AuditActionEnum
      verification_status_enum: VerificationStatusEnum
      processing_status_enum: ProcessingStatusEnum
      flag_status_enum: FlagStatusEnum
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Convenience types for common operations
export type Shop = Database['public']['Tables']['shops']['Row']
export type SKU = Database['public']['Tables']['skus']['Row']
export type User = Database['public']['Tables']['users']['Row']
export type UserShop = Database['public']['Tables']['user_shops']['Row']
export type DailyStock = Database['public']['Tables']['daily_stocks']['Row']
export type WeeklyCorporationData = Database['public']['Tables']['weekly_corporation_data']['Row']
export type VarianceFlag = Database['public']['Tables']['variance_flags']['Row']
export type UploadSession = Database['public']['Tables']['upload_sessions']['Row']
export type ParsedDataStaging = Database['public']['Tables']['parsed_data_staging']['Row']
export type UserAuditLog = Database['public']['Tables']['user_audit_log']['Row']

// Insert types
export type ShopInsert = Database['public']['Tables']['shops']['Insert']
export type SKUInsert = Database['public']['Tables']['skus']['Insert']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type UserShopInsert = Database['public']['Tables']['user_shops']['Insert']
export type DailyStockInsert = Database['public']['Tables']['daily_stocks']['Insert']
export type WeeklyCorporationDataInsert = Database['public']['Tables']['weekly_corporation_data']['Insert']
export type VarianceFlagInsert = Database['public']['Tables']['variance_flags']['Insert']
export type UploadSessionInsert = Database['public']['Tables']['upload_sessions']['Insert']
export type ParsedDataStagingInsert = Database['public']['Tables']['parsed_data_staging']['Insert']
export type UserAuditLogInsert = Database['public']['Tables']['user_audit_log']['Insert']

// Update types
export type ShopUpdate = Database['public']['Tables']['shops']['Update']
export type SKUUpdate = Database['public']['Tables']['skus']['Update']
export type UserUpdate = Database['public']['Tables']['users']['Update']
export type UserShopUpdate = Database['public']['Tables']['user_shops']['Update']
export type DailyStockUpdate = Database['public']['Tables']['daily_stocks']['Update']
export type WeeklyCorporationDataUpdate = Database['public']['Tables']['weekly_corporation_data']['Update']
export type VarianceFlagUpdate = Database['public']['Tables']['variance_flags']['Update']
export type UploadSessionUpdate = Database['public']['Tables']['upload_sessions']['Update']
export type ParsedDataStagingUpdate = Database['public']['Tables']['parsed_data_staging']['Update']
export type UserAuditLogUpdate = Database['public']['Tables']['user_audit_log']['Update']
