// src/types/donation.types.ts

export type DonationStatus = 
  | 'initiated' 
  | 'pending' 
  | 'completed' 
  | 'failed' 
  | 'refunded'
  | 'cancelled';

export type PaymentProvider = 
  | 'stripe' 
  | 'mercadopago' 
  | 'webpay' 
  | 'flow' 
  | 'paypal';

export interface Donation {
  id: string;
  campaign_id: string;
  donor_user_id: string | null;
  amount: number;
  currency: string;
  exchange_rate: number | null;
  amount_in_campaign_ccy: number;
  status: DonationStatus;
  provider: PaymentProvider;
  provider_payment_id: string | null;
  provider_charge_id: string | null;
  provider_fee: number | null;
  net_amount: number | null;
  receipt_url: string | null;
  message: string | null;
  created_at: string;
  updated_at: string;
}
export interface SendDonationLinkParams {
  campaignId: string;
  userEmail: string;
  userName?: string;
}

export interface DonationWithDonor extends Donation {
  donor?: {
    id: string;
    display_name: string | null;
    email: string;
  } | null;
}

export interface CreateDonationDTO {
  campaign_id: string;
  amount: number;
  currency?: string;
  provider: PaymentProvider;
  message?: string;
}

export interface DonationListItem {
  id: string;
  donorName: string;
  amount: number;
  currency: string;
  date: string;
  isAnonymous: boolean;
  message: string | null;
}