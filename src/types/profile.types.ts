// src/types/profile.types.ts
// VERSIÓN CORREGIDA - Sin avatar_url

import { CountryCode } from './campaign-create.types';

// ==================== ENUMS ====================

export type KycStatus = 'kyc_pending' | 'kyc_review' | 'kyc_verified' | 'kyc_rejected';

export type ConnectStatus =
  | 'invited'
  | 'pending'
  | 'onboarding'
  | 'verified'
  | 'active'
  | 'rejected'
  | 'external';

export type PayoutMode = 'connect' | 'external';

export type KycDocumentType = 'id_front' | 'id_back' | 'selfie' | 'proof_of_address';

// ==================== USER PROFILE ====================

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  phone?: string | null;
  country: string | null; // ✅ CAMBIADO: era CountryCode | null
  kyc_status: KycStatus;
  default_currency: string;
  pin_set: boolean;
  created_at: string;
  updated_at: string;
}

// ==================== KYC DOCUMENTS ====================

export interface KYCDocument {
  id: string;
  user_id: string;
  document_type: KycDocumentType;
  storage_path: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  rejection_reason?: string | null;
  created_at: string;
}

// ==================== BENEFICIARY ACCOUNT ====================

export interface BeneficiaryAccount {
  user_id: string;
  country: string; // ✅ CAMBIADO: era CountryCode
  payout_mode: PayoutMode;
  stripe_connect_account_id?: string | null;
  connect_status: ConnectStatus;
  bank_account_last4?: string | null;
  bank_name?: string | null;
  created_at: string;
  updated_at: string;
}

// ==================== CAMPAIGNS ====================

export interface ProfileCampaign {
  id: string;
  owner_user_id: string;
  title: string;
  description?: string | null;
  goal_amount: number;
  total_raised: number; // ✅ CAMBIADO: era current_amount
  currency: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  visibility: 'public' | 'private' | 'hidden';
  country: string; // ✅ CAMBIADO: era CountryCode
  created_at: string;
  updated_at: string;
}

export interface ProfileBeneficiaryCampaign {
  id: string;
  campaign_id: string;
  beneficiary_user_id: string;
  share_type: 'percent' | 'fixed_amount';
  share_value: number;
  is_active: boolean;
  campaign: {
    id: string;
    title: string;
    status: string;
    total_raised: number; // ✅ CAMBIADO: era current_amount
    goal_amount: number;
    currency: string;
    country: string; // ✅ CAMBIADO: era CountryCode
    owner: {
      display_name: string;
      email: string;
    };
  };
}

// ==================== DTOs ====================

export interface UpdateProfileDTO {
  display_name?: string;
  country?: string; // ✅ CAMBIADO: era CountryCode
  phone?: string;
}

export interface ProfileSummary {
  user: UserProfile;
  kycDocuments: KYCDocument[];
  beneficiaryAccount: BeneficiaryAccount | null;
  ownedCampaigns: ProfileCampaign[];
  beneficiaryCampaigns: ProfileBeneficiaryCampaign[];
}

// ==================== UI STATE ====================

export interface ProfileAlerts {
  needsKYC: boolean;
  needsConnect: boolean;
  kycRejected: boolean;
  connectRejected: boolean;
}

export interface ProfileStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalRaised: number;
  beneficiaryCount: number;
  estimatedEarnings: number;
}

// ==================== SERVICE RESPONSES ====================

export interface ProfileServiceResponse<T> {
  data: T | null;
  error: Error | null;
}
