// src/features/vault/types/VaultFile.ts

/**
 * Tipo de archivo subido a la bóveda
 * Basado en la tabla vault_files de Supabase
 */
export interface VaultFile {
  id: string;
  user_id: string;
  campaign_id: string;
  subscription_id: string;
  file_name: string;
  file_size_bytes: number;
  mime_type: string;
  storage_path: string;
  file_type: VaultFileType;
  created_at: string;
  updated_at: string;
}

/**
 * Tipos de archivo soportados
 * Debe coincidir con el constraint de la DB
 */
export type VaultFileType = 'image' | 'pdf' | 'video' | 'audio' | 'document' | 'other';

/**
 * Archivo preparado para subir (antes de enviar a Supabase)
 */
export interface FileToUpload {
  uri: string;
  name: string;
  type: string; // mime_type
  size: number; // bytes
}

/**
 * Resultado de un upload
 */
export interface UploadResult {
  success: boolean;
  file?: VaultFile;
  error?: string;
}

/**
 * Estado de progreso de un upload (para futuro)
 */
export interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number; // 0-100
  status: 'uploading' | 'processing' | 'complete' | 'error';
}

// src/features/vault/types/VaultSubscription.ts

/**
 * Suscripción de bóveda de un usuario
 * Basado en la tabla vault_subscriptions de Supabase
 */
export interface VaultSubscription {
  id: string;
  user_id: string;
  campaign_id: string;
  plan_type: VaultPlanType;
  billing_interval: BillingInterval | null;
  status: SubscriptionStatus;
  storage_quota_bytes: number;
  storage_used_bytes: number;
  current_period_start: string;
  current_period_end: string | null;
  apple_transaction_id: string | null;
  apple_original_transaction_id: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Tipos de plan disponibles
 */
export type VaultPlanType = 'free' | 'standard' | 'pro';

/**
 * Intervalos de facturación
 */
export type BillingInterval = 'monthly' | 'yearly';

/**
 * Estados de suscripción
 */
export type SubscriptionStatus = 'active' | 'canceled' | 'expired';

/**
 * Información de cuota de almacenamiento (para UI)
 */
export interface StorageQuota {
  used: number; // bytes
  total: number; // bytes
  percentage: number; // 0-100
  remaining: number; // bytes
  isNearLimit: boolean; // >80%
  isAtLimit: boolean; // >=100%
}

/**
 * Detalles de un plan (para mostrar en UI)
 */
export interface PlanDetails {
  type: VaultPlanType;
  name: string;
  storage: string; // "500 MB", "5 GB"
  storageBytes: number;
  price: {
    monthly: number; // en CLP
    yearly: number; // en CLP
    yearlyDiscount: number; // porcentaje
  } | null;
  features: string[];
  isRecommended?: boolean;
}
