import { supabase } from "../lib/supabaseClient";
import { DonationWithDonor, CreateDonationDTO, Donation, DonationListItem } from "../types/donation.types";


export class DonationService {
  /**
   * Obtiene las donaciones de una campaña específica
   */
  static async getCampaignDonations(
    campaignId: string,
    limit: number = 50
  ): Promise<DonationWithDonor[]> {
    try {
      const { data, error } = await supabase
        .from('donations')
        .select(`
          *,
          donor:donor_user_id(id, display_name, email)
        `)
        .eq('campaign_id', campaignId)
        .eq('status', 'paid')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error al obtener donaciones:', error);
      throw error;
    }
  }

  /**
   * Crea una nueva donación
   */
  static async createDonation(data: CreateDonationDTO): Promise<Donation> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data: donation, error } = await supabase
        .from('donations')
        .insert({
          campaign_id: data.campaign_id,
          donor_user_id: user?.id || null,
          amount: data.amount,
          currency: data.currency || 'CLP',
          amount_in_campaign_ccy: data.amount, // Ajustar si hay exchange rate
          provider: data.provider,
          message: data.message || null,
          status: 'initiated',
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return donation;
    } catch (error) {
      console.error('Error al crear donación:', error);
      throw error;
    }
  }

  /**
   * Formatea las donaciones para mostrar en la UI
   */
  static formatDonationsForUI(
    donations: DonationWithDonor[]
  ): DonationListItem[] {
    return donations.map((donation) => {
      // Determinar si es anónimo (sin donor_user_id)
      const isAnonymous = !donation.donor_user_id || !donation.donor;

      // Nombre del donante
      let donorName = 'Anónimo';
      if (!isAnonymous && donation.donor?.display_name) {
        donorName = donation.donor.display_name;
      }

      // Formatear fecha
      const date = new Date(donation.created_at);
      const formattedDate = date.toLocaleString('es-CL', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      return {
        id: donation.id,
        donorName,
        amount: donation.amount,
        currency: donation.currency,
        date: formattedDate,
        isAnonymous,
        message: donation.message,
      };
    });
  }

  /**
   * Obtiene el total recaudado de una campaña
   */
  static async getTotalRaised(campaignId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('donations')
        .select('amount_in_campaign_ccy')
        .eq('campaign_id', campaignId)
        .eq('status', 'completed');

      if (error) {
        throw error;
      }

      const total = data?.reduce((sum, donation) => sum + donation.amount_in_campaign_ccy, 0) || 0;
      return total;
    } catch (error) {
      console.error('Error al calcular total recaudado:', error);
      throw error;
    }
  }

  /**
   * Obtiene las donaciones del usuario actual
   */
  static async getUserDonations(limit: number = 50): Promise<DonationWithDonor[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const { data, error } = await supabase
        .from('donations')
        .select(`
          *,
          campaign:campaign_id(id, title)
        `)
        .eq('donor_user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error al obtener donaciones del usuario:', error);
      throw error;
    }
  }
}