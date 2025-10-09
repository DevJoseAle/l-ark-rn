import { supabase } from "../lib/supabaseClient";
import { CreateCampaignFormData, UploadedImage } from "../types/campaign-create.types";
import { Campaign } from "../types/campaign.types";
import { ImageUploadService } from "./imageUpload.service";


export class CampaignCreateService {
  /**
   * Crear campaña completa (con imágenes y beneficiarios)
   */
  static async createCampaign(
    formData: CreateCampaignFormData,
    onProgress?: (step: string, progress: number) => void
  ): Promise<Campaign> {
    try {
      // 1. Obtener usuario actual
      onProgress?.('Verificando usuario', 10);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // 2. Crear campaña en estado draft (sin imágenes aún)
      onProgress?.('Creando campaña', 20);
      const campaign = await this.insertCampaign(formData, user.id);

      try {
        // 3. Subir imágenes de campaña
        onProgress?.('Subiendo imágenes de campaña', 30);
        const campaignImages = await ImageUploadService.uploadMultipleImages(
          campaign.id,
          formData.campaignImages,
          'campaign'
        );

        // 4. Insertar imágenes de campaña en DB
        onProgress?.('Guardando imágenes', 50);
        await this.insertCampaignImages(campaign.id, user.id, campaignImages);

        // 5. Subir imágenes de diagnóstico (si existen)
        if (formData.hasDiagnosis && formData.diagnosisImages.length > 0) {
          onProgress?.('Subiendo imágenes de diagnóstico', 60);
          const diagnosisImages = await ImageUploadService.uploadMultipleImages(
            campaign.id,
            formData.diagnosisImages,
            'diagnosis'
          );

          await this.insertCampaignImages(campaign.id, user.id, diagnosisImages);
        }

        // 6. Crear beneficiarios con sus documentos
        onProgress?.('Creando beneficiarios', 70);
        await this.createBeneficiaries(
          campaign.id,
          user.id,
          formData.beneficiaries
        );

        onProgress?.('Finalizado', 100);
        return campaign;

      } catch (error) {
        // Si algo falla después de crear la campaña, eliminarla
        console.error('Error en proceso de creación, eliminando campaña:', error);
        await this.deleteCampaign(campaign.id);
        throw error;
      }

    } catch (error) {
      console.error('Error al crear campaña:', error);
      throw error;
    }
  }

  /**
   * Insertar campaña en la base de datos
   */
  private static async insertCampaign(
    formData: CreateCampaignFormData,
    userId: string
  ): Promise<Campaign> {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .insert({
          owner_user_id: userId,
          title: formData.title.trim(),
          description: formData.description.trim(),
          goal_amount: parseFloat(formData.goalAmount),
          soft_cap: parseFloat(formData.softCap),
          hard_cap: formData.hardCap ? parseFloat(formData.hardCap) : null,
          currency: formData.currency,
          status: 'draft',
          visibility: formData.visibility,
          start_at: formData.startDate.toISOString(),
          end_at: formData.endDate.toISOString(),
          has_diagnosis: formData.hasDiagnosis,
          beneficiary_rule: formData.beneficiaries.length > 1 ?  'fixed_shares' : 'single_beneficiary',
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error inserting campaign:', error);
      throw error;
    }
  }

  /**
   * Insertar imágenes en campaign_images
   */
  private static async insertCampaignImages(
    campaignId: string,
    userId: string,
    images: UploadedImage[]
  ): Promise<void> {
    try {
      const rows = images.map((img) => ({
        user_id: userId,
        campaign_id: campaignId,
        image_url: img.url,
        display_order: img.displayOrder,
        is_primary: img.isPrimary,
        image_type: img.type,
      }));

      const { error } = await supabase
        .from('campaign_images')
        .insert(rows);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error inserting campaign images:', error);
      throw error;
    }
  }

  /**
   * Crear beneficiarios con sus documentos
   */
private static async createBeneficiaries(
  campaignId: string,
  userId: string,
  beneficiaries: CreateCampaignFormData['beneficiaries']
): Promise<void> {
  try {
    for (const beneficiary of beneficiaries) {
      // 👇 AGREGA ESTE LOG AQUÍ
      console.log('🔍 DEBUG en service - beneficiary.shareType:', beneficiary.shareType);
      console.log('🔍 DEBUG en service - beneficiary completo:', JSON.stringify(beneficiary, null, 2));
      
      // 1. Crear beneficiario
      const { data: beneficiaryData, error: beneficiaryError } = await supabase
        .from('campaign_beneficiaries')
        .insert({
          campaign_id: campaignId,
          beneficiary_user_id: beneficiary.user.id,
          share_type: beneficiary.shareType, // 👈 Este es el valor problemático
          share_value: beneficiary.shareValue,
          is_active: true,
        })
        .select()
        .single();

      if (beneficiaryError) {
        throw beneficiaryError;
      }
      // ... resto del código
    }
  } catch (error) {
    console.error('Error creating beneficiaries:', error);
    throw error;
  }
}

  /**
   * Eliminar campaña (rollback)
   */
  private static async deleteCampaign(campaignId: string): Promise<void> {
    try {
      // Las imágenes se eliminan automáticamente por CASCADE
      // Los beneficiarios se eliminan automáticamente por CASCADE
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', campaignId);

      if (error) {
        console.error('Error deleting campaign on rollback:', error);
      }
    } catch (error) {
      console.error('Error in rollback:', error);
    }
  }

  /**
   * Verificar si el usuario ya tiene una campaña
   */
  static async userHasCampaign(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('campaigns')
        .select('id')
        .eq('owner_user_id', user.id)
        .limit(1);

      if (error) {
        throw error;
      }

      return (data?.length || 0) > 0;
    } catch (error) {
      console.error('Error checking user campaign:', error);
      return false;
    }
  }

  
}