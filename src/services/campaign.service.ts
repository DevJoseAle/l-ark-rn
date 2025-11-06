import { supabase } from "../lib/supabaseClient";
import { Campaign, CampaignDetail, CampaignSearchResult, CampaignStats, CreateCampaignDTO, UpdateCampaignDTO } from "../types/campaign.types";


export class CampaignService {
  /**
   * Obtiene la campaña del usuario actual
   * Un usuario solo puede tener UNA campaña (constraint unique)
   */
  static async getUserCampaign(): Promise<Campaign | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return null
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
      //console.log('pase');
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

  /**
 * Obtener campaña del usuario actual
 */
  static async getCurrentUserCampaign(): Promise<CampaignDetail | null> {
    //console.log("Entré loco");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const { data, error } = await supabase
        .from('campaigns')
        .select(`
        *,
        owner:users!campaigns_owner_user_id_fkey(id, display_name, email),
        images:campaign_images(id, image_url, image_type, display_order, is_primary),
        beneficiaries:campaign_beneficiaries(
          id,
          beneficiary_user_id,
          share_type,
          share_value,
          is_active,
          user:users!campaign_beneficiaries_beneficiary_user_id_fkey(
            id,
            display_name,
            email,
            kyc_status
          ),
          documents:campaign_images!campaign_images_beneficiary_id_fkey(
            id,
            image_url,
            image_type,
            display_order
          )
        )
      `)
        .eq('owner_user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data as unknown as CampaignDetail;
    } catch (error) {
      console.error('Error fetching campaign:', error);
      throw error;
    }
  }

  /**
   * Obtener campaña por ID
   */
  static async getCampaignById(campaignId: string): Promise<CampaignDetail | null> {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select(`
        *,
        owner:users!campaigns_owner_user_id_fkey(id, display_name, email),
        images:campaign_images(id, image_url, image_type, display_order, is_primary),
        beneficiaries:campaign_beneficiaries(
          id,
          beneficiary_user_id,
          share_type,
          share_value,
          is_active,
          user:users!campaign_beneficiaries_beneficiary_user_id_fkey(
            id,
            display_name,
            email,
            kyc_status
          ),
          documents:campaign_images!campaign_images_beneficiary_id_fkey(
            id,
            image_url,
            image_type,
            display_order
          )
        )
      `)
        .eq('id', campaignId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data as unknown as CampaignDetail;
    } catch (error) {
      console.error('Error fetching campaign by id:', error);
      throw error;
    }
  }

  /**
   * Calcular días restantes
   */
  static getDaysRemaining(endDate: string | null): number {
    if (!endDate) return 0;

    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  /**
   * Calcular porcentaje de progreso
   */
  static getProgressPercentage(totalRaised: number, goalAmount: number | null): number {
    if (!goalAmount || goalAmount === 0) return 0;
    return Math.min(100, Math.round((totalRaised / goalAmount) * 100));
  }

  /**
   * Obtener imagen principal
   */
  static getMainImage(images: CampaignDetail['images']): string | null {
    if (!images || images.length === 0) return null;

    const mainImage = images
      .filter(img => img.image_type === 'main' || img.image_type === 'campaign')
      .sort((a, b) => {
        if (a.is_primary && !b.is_primary) return -1;
        if (!a.is_primary && b.is_primary) return 1;
        return a.display_order - b.display_order;
      })[0];

    return mainImage?.image_url || null;
  }

   static async searchByCode(code: string): Promise<CampaignSearchResult | null> {
    try {
      const cleanCode = code.trim().toLowerCase();

      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          id,
          short_code,
          title,
          description,
          goal_amount,
          total_raised,
          country,
          status,
          owner_user_id,
          created_at,
          images:campaign_images(image_url, image_type),
          owner:owner_user_id(display_name, email)
        `)
        .eq('short_code', cleanCode)
        .in('visibility', ['public', 'unlisted'])
        .single();

      if (error) {
        console.error('Search by code error:', error);
        return null;
      }

      return data as any;
    } catch (error) {
      console.error('Search service error:', error);
      return null;
    }
  }

  /**
   * Buscar campañas por texto (título o descripción)
   */
  static async searchByText(query: string): Promise<CampaignSearchResult[]> {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          id,
          short_code,
          title,
          description,
          goal_amount,
          total_raised,
          country,
          status,
          owner_user_id,
          created_at,
          images:campaign_images(image_url, image_type),
          owner:owner_user_id(display_name, email)
        `)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .eq('status', 'active')
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Search by text error:', error);
        return [];
      }

      return data as any|| [];
    } catch (error) {
      console.error('Text search error:', error);
      return [];
    }
  }

  /**
   * Obtener campañas recientes/destacadas
   */
  static async getFeaturedCampaigns(): Promise<CampaignSearchResult[]> {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          id,
          short_code,
          title,
          description,
          goal_amount,
          total_raised,
          country,
          status,
          owner_user_id,
          created_at,
          images:campaign_images(image_url, image_type),
          owner:owner_user_id(display_name, email)
        `)
        .eq('status', 'active')
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      return data as any || [];
    } catch (error) {
      console.error('Featured campaigns error:', error);
      return [];
    }
  }
}