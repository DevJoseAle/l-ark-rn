// src/services/profile.service.ts
// VERSIÓN CORREGIDA - Nombres correctos de BD

import { supabase } from '../lib/supabaseClient';
import {
  UserProfile,
  KYCDocument,
  BeneficiaryAccount,
  ProfileCampaign,
  ProfileBeneficiaryCampaign,
  ProfileSummary,
  UpdateProfileDTO,
  ProfileServiceResponse,
  ProfileAlerts,
  ProfileStats,
} from '../types/profile.types';

export class ProfileService {
  /**
   * Obtener perfil completo del usuario
   */
  static async getProfileSummary(): Promise<ProfileServiceResponse<ProfileSummary>> {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        throw new Error('Usuario no autenticado');
      }

      const [
        userData,
        kycData,
        accountData,
        campaignsData,
        beneficiaryData,
      ] = await Promise.all([
        this.getUserData(authUser.id),
        this.getKYCDocuments(authUser.id),
        this.getBeneficiaryAccount(authUser.id),
        this.getOwnedCampaigns(authUser.id),
        this.getBeneficiaryCampaigns(authUser.id),
      ]);

      const summary: ProfileSummary = {
        user: userData,
        kycDocuments: kycData,
        beneficiaryAccount: accountData,
        ownedCampaigns: campaignsData,
        beneficiaryCampaigns: beneficiaryData,
      };

      return { data: summary, error: null };
    } catch (error: any) {
      console.error('Error fetching profile summary:', error);
      return { data: null, error };
    }
  }

  /**
   * Obtener datos del usuario
   */
  private static async getUserData(userId: string): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, display_name, phone, country, kyc_status, default_currency, pin_set, created_at, updated_at')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Obtener documentos KYC del usuario
   */
  private static async getKYCDocuments(userId: string): Promise<KYCDocument[]> {
    const { data, error } = await supabase
      .from('kyc_documents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching KYC documents:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Obtener cuenta de beneficiario (Stripe Connect)
   */
  private static async getBeneficiaryAccount(
    userId: string
  ): Promise<BeneficiaryAccount | null> {
    const { data, error } = await supabase
      .from('beneficiary_accounts')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching beneficiary account:', error);
      return null;
    }

    return data;
  }

  /**
   * Obtener campañas creadas por el usuario
   */
  private static async getOwnedCampaigns(
    userId: string
  ): Promise<ProfileCampaign[]> {
    const { data, error } = await supabase
      .from('campaigns')
      .select(
        'id, owner_user_id, title, description, goal_amount, total_raised, currency, status, visibility, country, created_at, updated_at'
      )
      .eq('owner_user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching owned campaigns:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Obtener campañas donde el usuario es beneficiario
   */
  private static async getBeneficiaryCampaigns(
    userId: string
  ): Promise<ProfileBeneficiaryCampaign[]> {
    const { data, error } = await supabase
      .from('campaign_beneficiaries')
      .select(`
        id,
        campaign_id,
        beneficiary_user_id,
        share_type,
        share_value,
        is_active,
        campaigns!campaign_beneficiaries_campaign_id_fkey (
          id,
          title,
          status,
          total_raised,
          goal_amount,
          currency,
          country,
          users!campaigns_owner_user_id_fkey (
            display_name,
            email
          )
        )
      `)
      .eq('beneficiary_user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching beneficiary campaigns:', error);
      return [];
    }

    // Transform data to match interface
    return (data || []).map((item: any) => ({
      id: item.id,
      campaign_id: item.campaign_id,
      beneficiary_user_id: item.beneficiary_user_id,
      share_type: item.share_type,
      share_value: item.share_value,
      is_active: item.is_active,
      campaign: {
        id: item.campaigns.id,
        title: item.campaigns.title,
        status: item.campaigns.status,
        total_raised: item.campaigns.total_raised || 0,
        goal_amount: item.campaigns.goal_amount || 0,
        currency: item.campaigns.currency,
        country: item.campaigns.country,
        owner: {
          display_name: item.campaigns.users.display_name,
          email: item.campaigns.users.email,
        },
      },
    }));
  }

  /**
   * Actualizar perfil del usuario
   */
  static async updateProfile(
    updates: UpdateProfileDTO
  ): Promise<ProfileServiceResponse<UserProfile>> {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        throw new Error('Usuario no autenticado');
      }

      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', authUser.id)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      console.error('Error updating profile:', error);
      return { data: null, error };
    }
  }

  /**
   * Calcular alertas del perfil
   */
  static calculateAlerts(summary: ProfileSummary): ProfileAlerts {
    const { user, beneficiaryAccount, beneficiaryCampaigns } = summary;

    const needsKYC =
      user.kyc_status !== 'kyc_verified' &&
      (summary.ownedCampaigns.length > 0 || beneficiaryCampaigns.length > 0);

    const isBeneficiary = beneficiaryCampaigns.length > 0;
    const countrySupportsConnect = ['US', 'MX', 'CO'].includes(user.country || '');
    const hasActiveConnect =
      beneficiaryAccount?.connect_status === 'verified' ||
      beneficiaryAccount?.connect_status === 'active';

    const needsConnect =
      isBeneficiary && countrySupportsConnect && !hasActiveConnect;

    const kycRejected = user.kyc_status === 'kyc_rejected';
    const connectRejected = beneficiaryAccount?.connect_status === 'rejected';

    return {
      needsKYC,
      needsConnect,
      kycRejected,
      connectRejected,
    };
  }

  /**
   * Calcular estadísticas del perfil
   */
  static calculateStats(summary: ProfileSummary): ProfileStats {
    const { ownedCampaigns, beneficiaryCampaigns } = summary;

    const totalCampaigns = ownedCampaigns.length;
    const activeCampaigns = ownedCampaigns.filter(
      (c) => c.status === 'active'
    ).length;
    const totalRaised = ownedCampaigns.reduce(
      (sum, c) => sum + (c.total_raised || 0),
      0
    );

    const beneficiaryCount = beneficiaryCampaigns.length;
    const estimatedEarnings = beneficiaryCampaigns.reduce((sum, bc) => {
      const campaignAmount = bc.campaign.total_raised || 0;
      if (bc.share_type === 'percent') {
        return sum + (campaignAmount * bc.share_value) / 100;
      }
      return sum + bc.share_value;
    }, 0);

    return {
      totalCampaigns,
      activeCampaigns,
      totalRaised,
      beneficiaryCount,
      estimatedEarnings,
    };
  }

  /**
   * Refrescar solo campañas (para pull-to-refresh)
   */
  static async refreshCampaigns(): Promise<{
    owned: ProfileCampaign[];
    beneficiary: ProfileBeneficiaryCampaign[];
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const [owned, beneficiary] = await Promise.all([
        this.getOwnedCampaigns(user.id),
        this.getBeneficiaryCampaigns(user.id),
      ]);

      return { owned, beneficiary };
    } catch (error) {
      console.error('Error refreshing campaigns:', error);
      return { owned: [], beneficiary: [] };
    }
  }

  /**
   * Obtener estado de verificación Connect
   */
  static async getConnectStatus(): Promise<BeneficiaryAccount | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      return await this.getBeneficiaryAccount(user.id);
    } catch (error) {
      console.error('Error getting connect status:', error);
      return null;
    }
  }
}