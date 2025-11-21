// src/types/enums.ts

import { Constants } from "@/supabaseTypes/supabase";

// Extraer todos los enums que necesites
export type CountryCodeForInsert = typeof Constants.public.Enums.country_code[number];
export type CampaignStatus = typeof Constants.public.Enums.campaign_status[number];
export type BeneficiaryShareType = typeof Constants.public.Enums.beneficiary_share_type[number];
export type PayoutMode = typeof Constants.public.Enums.payout_mode[number];
export type KYCStatus = typeof Constants.public.Enums.kyc_status[number];

// Crear constantes helper
export const COUNTRY_CODES = Constants.public.Enums.country_code;
export const CAMPAIGN_STATUSES = Constants.public.Enums.campaign_status;