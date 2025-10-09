// src/types/campaign-create.types.ts

import { Campaign, CampaignVisibility } from './campaign.types';

// ========================================
// ENUMS y TIPOS BASE
// ========================================

export type CampaignImageType = 'campaign' | 'diagnosis' | 'beneficiary';

export type BeneficiaryShareType = 'percent' | 'fixed_amount';

export type DistributionRule = 'percentage' | 'fixed_parts';

// ========================================
// IMAGEN LOCAL (antes de subir)
// ========================================

export interface LocalImage {
  id: string; // UUID temporal
  uri: string; // URI local del archivo
  name: string;
  type: string; // mime type
  size: number; // bytes
  width?: number;
  height?: number;
}

// ========================================
// IMAGEN SUBIDA
// ========================================

export interface UploadedImage {
  id: string; // UUID temporal
  url: string; // URL en Supabase Storage
  displayOrder: number;
  isPrimary: boolean;
  type: CampaignImageType;
}

// ========================================
// BENEFICIARIO
// ========================================

export interface BeneficiaryUser {
  id: string;
  display_name: string;
  email: string;
  kyc_status: string;
}

export interface CampaignBeneficiary {
  id: string; // UUID temporal hasta que se guarde
  user: BeneficiaryUser;
  shareType: BeneficiaryShareType;
  shareValue: number; // Porcentaje (0-100) o monto fijo en CLP
  documents: LocalImage[]; // Documentos de relación (max 3)
  uploadedDocuments?: UploadedImage[];
}

// ========================================
// FORM DATA (estado del formulario)
// ========================================

export interface CreateCampaignFormData {
  // Información básica
  title: string;
  description: string;
  hasDiagnosis: boolean;
  
  // Imágenes
  campaignImages: LocalImage[]; // Max 3
  diagnosisImages: LocalImage[]; // Max 3 (solo si hasDiagnosis = true)
  
  // Montos
  goalAmount: string; // String para evitar problemas de formato
  softCap: string; // Meta mínima (required)
  hardCap: string; // Meta media (optional)
  currency: string; // Default: 'CLP'
  
  // Fechas
  startDate: Date;
  endDate: Date;
  
  // Configuración
  visibility: CampaignVisibility;
  distributionRule: DistributionRule;
  
  // Beneficiarios
  beneficiaries: CampaignBeneficiary[]; // Max 3
}

// ========================================
// DTO PARA CREAR CAMPAÑA
// ========================================

export interface CreateCampaignDTO {
  // Campaign data
  title: string;
  description: string;
  goal_amount: number;
  soft_cap: number;
  hard_cap?: number;
  currency: string;
  status: 'draft';
  visibility: CampaignVisibility;
  start_at: string; // ISO string
  end_at: string; // ISO string
  has_diagnosis: boolean;
  beneficiary_rule: 'self' | 'third_party' | 'organization';
  
  // Images (URLs después de subir)
  campaign_images: UploadedImage[];
  diagnosis_images?: UploadedImage[];
  
  // Beneficiaries
  beneficiaries: {
    user_id: string;
    share_type: BeneficiaryShareType;
    share_value: number;
    documents: UploadedImage[];
  }[];
}

// ========================================
// VALIDACIÓN
// ========================================

export interface ValidationError {
  field: keyof CreateCampaignFormData | string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// ========================================
// UPLOAD PROGRESS
// ========================================

export interface UploadProgress {
  imageId: string;
  progress: number; // 0-100
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

// ========================================
// FORM STATE
// ========================================

export interface CreateCampaignState {
  formData: CreateCampaignFormData;
  uploadProgress: Record<string, UploadProgress>;
  isSubmitting: boolean;
  errors: ValidationError[];
}