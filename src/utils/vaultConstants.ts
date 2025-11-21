// src/features/vault/constants/vaultConstants.ts

import { VaultPlanType, PlanDetails } from "../types/vault.types";

/**
 * Límites y configuración de la bóveda
 */
export const VAULT_LIMITS = {
  MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024, // 10 MB
  MAX_FILE_SIZE_MB: 10,
  FREE_QUOTA_BYTES: 524288000, // 500 MB
  PRO_QUOTA_BYTES: 5368709120, // 5 GB
} as const;

/**
 * Precios de los planes en CLP
 */
export const PLAN_PRICES = {
  PRO_MONTHLY: 8990,
  PRO_YEARLY: 97000,
  YEARLY_DISCOUNT_PERCENT: 10,
} as const;

/**
 * Detalles completos de cada plan para mostrar en UI
 */
export const PLAN_DETAILS: Record<VaultPlanType, PlanDetails> = {
  free: {
    type: 'free',
    name: 'Gratis',
    storage: '500 MB',
    storageBytes: VAULT_LIMITS.FREE_QUOTA_BYTES,
    price: null,
    features: [
      '500 MB de almacenamiento',
      'Subir documentos y fotos',
      'Acceso básico a tu bóveda',
    ],
  },
  standard: {
    // En caso de que después quieras agregar este plan
    type: 'standard',
    name: 'Estándar',
    storage: '5 GB',
    storageBytes: VAULT_LIMITS.PRO_QUOTA_BYTES,
    price: {
      monthly: PLAN_PRICES.PRO_MONTHLY,
      yearly: PLAN_PRICES.PRO_YEARLY,
      yearlyDiscount: PLAN_PRICES.YEARLY_DISCOUNT_PERCENT,
    },
    features: [
      '5 GB de almacenamiento',
      'Subir documentos, fotos y videos',
      'Soporte prioritario',
      'SSD físico entregado al beneficiario',
    ],
  },
  pro: {
    type: 'pro',
    name: 'Pro',
    storage: '5 GB',
    storageBytes: VAULT_LIMITS.PRO_QUOTA_BYTES,
    price: {
      monthly: PLAN_PRICES.PRO_MONTHLY,
      yearly: PLAN_PRICES.PRO_YEARLY,
      yearlyDiscount: PLAN_PRICES.YEARLY_DISCOUNT_PERCENT,
    },
    features: [
      '5 GB de almacenamiento',
      'Subir documentos, fotos y videos',
      'Soporte prioritario',
      'SSD físico entregado al beneficiario',
      'Respaldo seguro en la nube',
    ],
    isRecommended: true,
  },
};

/**
 * MIME types aceptados
 */
export const ACCEPTED_MIME_TYPES = {
  images: ['image/jpeg', 'image/png', 'image/jpg', 'image/heic'],
  documents: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
  ],
  videos: ['video/mp4', 'video/quicktime'],
  audio: ['audio/mpeg', 'audio/aac', 'audio/wav'],
} as const;

/**
 * Iconos por tipo de archivo (para usar con Ionicons)
 */
export const FILE_TYPE_ICONS = {
  image: 'image',
  pdf: 'document-text',
  video: 'videocam',
  audio: 'musical-notes',
  document: 'document',
  other: 'document-attach',
} as const;

/**
 * Colores por tipo de archivo
 */
export const FILE_TYPE_COLORS = {
  image: '#10B981', // green
  pdf: '#EF4444', // red
  video: '#8B5CF6', // purple
  audio: '#F59E0B', // amber
  document: '#3B82F6', // blue
  other: '#6B7280', // gray
} as const;

/**
 * Bucket de Supabase Storage
 */
export const STORAGE_BUCKET = 'vault-files';

/**
 * Threshold para mostrar advertencia de espacio
 */
export const STORAGE_WARNING_THRESHOLD = 0.8; // 80%
export const STORAGE_CRITICAL_THRESHOLD = 0.95; // 95%