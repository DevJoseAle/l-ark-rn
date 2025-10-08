
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';

export type CampaignVisibility = 'public' | 'private' | 'hidden';

export type BeneficiaryRule = 'self' | 'third_party' | 'organization';

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
  total_raised: number;
  beneficiary_rule: BeneficiaryRule | null;
  created_at: string;
  updated_at: string;
  has_diagnosis: boolean;
}

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

export interface CampaignStats {
  totalRaised: number;
  goalAmount: number;
  percentage: number;
  donationsCount: number;
  daysLeft: number | null;
} 