import { supabase } from '../lib/supabaseClient';

export class StripeConnectService {
  /**
   * Crear Connected Account para un beneficiario
   */
  static async createConnectedAccount(userId: string): Promise<{
    accountId: string;
    status: string;
    requiresOnboarding: boolean;
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('stripe-connect-create-account', {
        body: { userId },
      });

      if (error) {
        console.error('Error creando Connected Account:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error en createConnectedAccount:', error);
      throw error;
    }
  }
  static async getOnboardingLink(): Promise<string | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // Llamar a la Edge Function
      const { data, error } = await supabase.functions.invoke('stripe-connect-onboarding-link', {
        body: { userId: user.id },
      });

      if (error) {
        throw error;
      }

      return data?.url || null;
    } catch (error: any) {
      console.error('Error getting onboarding link:', error);
      throw error;
    }
  }
}
