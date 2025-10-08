import { supabase } from "../lib/supabaseClient";
import { Campaign, CreateCampaignDTO, UpdateCampaignDTO, CampaignStats } from "../types/campaign.types";


export class CampaignService {
  /**
   * Obtiene la campaña del usuario actual
   * Un usuario solo puede tener UNA campaña (constraint unique)
   */
  static async getUserCampaign(): Promise<Campaign | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('owner_user_id', user.id)
        .single();

      if (error) {
        // Si no encuentra campaña, devolver null (no es error)
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error al obtener campaña del usuario:', error);
      throw error;
    }
  }

  /**
   * Crea una nueva campaña para el usuario actual
   */
  static async createCampaign(data: CreateCampaignDTO): Promise<Campaign> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const { data: campaign, error } = await supabase
        .from('campaigns')
        .insert({
          owner_user_id: user.id,
          ...data,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return campaign;
    } catch (error) {
      console.error('Error al crear campaña:', error);
      throw error;
    }
  }

  /**
   * Actualiza la campaña del usuario actual
   */
  static async updateCampaign(
    campaignId: string,
    data: UpdateCampaignDTO
  ): Promise<Campaign> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const { data: campaign, error } = await supabase
        .from('campaigns')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', campaignId)
        .eq('owner_user_id', user.id) // Seguridad: solo actualiza si es dueño
        .select()
        .single();

      if (error) {
        throw error;
      }

      return campaign;
    } catch (error) {
      console.error('Error al actualizar campaña:', error);
      throw error;
    }
  }

  /**
   * Actualiza la visibilidad de la campaña
   */
  static async updateVisibility(
    campaignId: string,
    visibility: Campaign['visibility']
  ): Promise<Campaign> {
    try {
      return await this.updateCampaign(campaignId, { visibility });
    } catch (error) {
      console.error('Error al actualizar visibilidad:', error);
      throw error;
    }
  }

  /**
   * Obtiene las estadísticas calculadas de la campaña
   */
  static async getCampaignStats(campaignId: string): Promise<CampaignStats> {
    try {
      const { data: campaign, error } = await supabase
        .from('campaigns')
        .select('total_raised, goal_amount, end_at')
        .eq('id', campaignId)
        .single();

      if (error) {
        throw error;
      }

      // Calcular porcentaje
      const goalAmount = campaign.goal_amount || 0;
      const percentage = goalAmount > 0 
        ? Math.min(Math.round((campaign.total_raised / goalAmount) * 100), 100)
        : 0;

      // Calcular días restantes
      let daysLeft: number | null = null;
      if (campaign.end_at) {
        const endDate = new Date(campaign.end_at);
        const today = new Date();
        const diffTime = endDate.getTime() - today.getTime();
        daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        daysLeft = daysLeft < 0 ? 0 : daysLeft;
      }

      // Contar donaciones
      const { count } = await supabase
        .from('donations')
        .select('*', { count: 'exact', head: true })
        .eq('campaign_id', campaignId)
        .eq('status', 'completed');

      return {
        totalRaised: campaign.total_raised,
        goalAmount: goalAmount,
        percentage,
        donationsCount: count || 0,
        daysLeft,
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  }

  /**
   * Elimina la campaña del usuario (soft delete via status)
   */
  static async deleteCampaign(campaignId: string): Promise<void> {
    try {
      await this.updateCampaign(campaignId, { status: 'cancelled' });
    } catch (error) {
      console.error('Error al eliminar campaña:', error);
      throw error;
    }
  }
}