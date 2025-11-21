import { supabase } from '../lib/supabaseClient';
import { BeneficiaryUser } from '../types/campaign-create.types';

export class UserSearchService {
  /**
   * Buscar usuarios para agregar como beneficiarios
   * Solo muestra usuarios con KYC aprobado
   */
  static async searchUsers(query: string, excludeUserId?: string): Promise<BeneficiaryUser[]> {
    try {
      if (!query || query.trim().length < 2) {
        return [];
      }

      const { data, error } = await supabase.rpc('search_users_for_beneficiaries', {
        search_query: query.trim(),
        exclude_user_id: excludeUserId || null,
      });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  /**
   * Obtener usuario por ID
   */
  static async getUserById(userId: string): Promise<BeneficiaryUser | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, display_name, email, kyc_status')
        .eq('id', userId)
        .eq('kyc_status', 'kyc_verified')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No encontrado
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error getting user by id:', error);
      throw error;
    }
  }

  /**
   * Validar que un usuario puede ser beneficiario
   */
  static async canBecomeBeneficiary(userId: string): Promise<boolean> {
    try {
      const user = await this.getUserById(userId);
      return user !== null && user.kyc_status === 'kyc_verified';
    } catch (error) {
      console.error('Error validating beneficiary:', error);
      return false;
    }
  }

  /**
   * Verificar si un usuario ya es beneficiario en alguna campaña
   */
  static async isAlreadyBeneficiary(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('campaign_beneficiaries')
        .select('id')
        .eq('beneficiary_user_id', userId)
        .eq('is_active', true)
        .limit(1);

      if (error) {
        throw error;
      }

      return (data?.length || 0) > 0;
    } catch (error) {
      console.error('Error checking if already beneficiary:', error);
      return false;
    }
  }
}
