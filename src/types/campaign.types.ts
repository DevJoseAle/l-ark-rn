// src/types/campaign.types.ts

// ==================== ENUMS ====================

export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';

export type CampaignVisibility = 'public' | 'private' | 'hidden';

// 👇 Actualizado con los valores reales de la BD
export type BeneficiaryRule = 'single_beneficiary' | 'fixed_shares' | 'priority';

export type KycStatus = 
  | 'kyc_pending' 
  | 'kyc_review' 
  | 'kyc_verified' 
  | 'kyc_rejected';

export type CampaignImageType = 'main' | 'campaign' | 'diagnosis' | 'beneficiary';

export type BeneficiaryShareType = 'percent' | 'fixed_amount';

// ==================== CAMPAIGN ====================

export interface Campaign {
  id: string;
  owner_user_id: string;
  title: string;
  description: string | null;
  goal_amount: number | null;
  soft_cap: number | null;
  hard_cap: number | null;
  currency: string;
  status: CampaignStatus;
  visibility: CampaignVisibility;
  start_at: string | null;
  end_at: string | null;
  total_raised: number; // Alias de current_amount
  beneficiary_rule: BeneficiaryRule | null;
  created_at: string;
  updated_at: string;
  has_diagnosis: boolean;
}

// ==================== CAMPAIGN IMAGES ====================

export interface CampaignImage {
  id: string;
  campaign_id: string;
  image_url: string;
  image_type: CampaignImageType;
  display_order: number;
  is_primary: boolean;
  beneficiary_id?: string | null;
}

// ==================== BENEFICIARIES ====================

export interface CampaignBeneficiaryUser {
  id: string;
  display_name: string;
  email: string;
  kyc_status: KycStatus;
}

export interface CampaignBeneficiaryDetail {
  id: string;
  campaign_id: string;
  beneficiary_user_id: string;
  share_type: BeneficiaryShareType;
  share_value: number;
  is_active: boolean;
  user: CampaignBeneficiaryUser;
  documents: CampaignImage[];
}

// ==================== CAMPAIGN OWNER ====================

export interface CampaignOwner {
  id: string;
  display_name: string;
  email: string;
}

// ==================== CAMPAIGN DETAIL (con relaciones) ====================

export interface CampaignDetail extends Campaign {
  images: CampaignImage[];
  beneficiaries: CampaignBeneficiaryDetail[];
  owner: CampaignOwner;
}

// ==================== DTOs ====================

export interface CreateCampaignDTO {
  title: string;
  description?: string;
  goal_amount?: number;
  soft_cap?: number;
  hard_cap?: number;
  currency?: string;
  status?: CampaignStatus;
  visibility?: CampaignVisibility;
  start_at?: string;
  end_at?: string;
  beneficiary_rule?: BeneficiaryRule;
  has_diagnosis?: boolean;
}

export interface UpdateCampaignDTO {
  title?: string;
  description?: string;
  goal_amount?: number;
  soft_cap?: number;
  hard_cap?: number;
  status?: CampaignStatus;
  visibility?: CampaignVisibility;
  start_at?: string;
  end_at?: string;
  beneficiary_rule?: BeneficiaryRule;
  has_diagnosis?: boolean;
}

// ==================== STATS ====================

export interface CampaignStats {
  totalRaised: number;
  goalAmount: number;
  percentage: number;
  donationsCount: number;
  daysLeft: number | null;
}