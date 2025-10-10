import { supabase } from "../lib/supabaseClient";
import { VaultSubscription, BillingInterval } from "../types/vault.types";
import { VAULT_LIMITS } from "../utils/vaultConstants";
import { IS_MOCK_PAYMENTS_ENABLED, MockPaymentService } from "./mockPayment.service";


/**
 * Servicio para gestionar suscripciones de bóveda
 */
export const SubscriptionService = {
  /**
   * Obtiene la suscripción activa de un usuario/campaña
   * Si no existe, crea una automáticamente con plan FREE
   */
  async getOrCreateSubscription(
    userId: string,
    campaignId: string
  ): Promise<VaultSubscription | null> {
    try {
      console.log('🔍 Buscando suscripción para:', { userId, campaignId });

      // 1. Intentar obtener suscripción existente
      const { data: existing, error: fetchError } = await supabase
        .from('vault_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('campaign_id', campaignId)
        .maybeSingle();

      if (fetchError) {
        console.error('❌ Error buscando suscripción:', fetchError);
        throw fetchError;
      }

      // 2. Si existe, retornarla
      if (existing) {
        console.log('✅ Suscripción encontrada:', existing.plan_type);
        return existing as VaultSubscription;
      }

      // 3. Si no existe, crear una FREE automáticamente
      console.log('📝 Creando suscripción FREE automática...');

      const { data: newSubscription, error: createError } = await supabase
        .from('vault_subscriptions')
        .insert({
          user_id: userId,
          campaign_id: campaignId,
          plan_type: 'free',
          billing_interval: null,
          status: 'active',
          storage_quota_bytes: VAULT_LIMITS.FREE_QUOTA_BYTES,
          storage_used_bytes: 0,
          current_period_start: new Date().toISOString(),
          current_period_end: null, // FREE no tiene fecha de expiración
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creando suscripción FREE:', createError);
        throw createError;
      }

      console.log('✅ Suscripción FREE creada:', newSubscription.id);
      return newSubscription as VaultSubscription;
    } catch (error) {
      console.error('❌ Error en getOrCreateSubscription:', error);
      return null;
    }
  },

  /**
   * Actualiza una suscripción a plan PRO
   * Integra con MockPaymentService o RevenueCat
   */
  async upgradeToPro(
    subscriptionId: string,
    interval: BillingInterval
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('⬆️ Actualizando a PRO:', { subscriptionId, interval });

      // 1. Procesar pago (mock o real)
      let transactionId: string | undefined;

      if (IS_MOCK_PAYMENTS_ENABLED) {
        // Modo desarrollo: usar mock
        const mockResult = await MockPaymentService.purchasePro(interval);
        
        if (!mockResult.success) {
          return {
            success: false,
            error: mockResult.error || 'Compra cancelada',
          };
        }

        transactionId = mockResult.transactionId;
      } else {
        // Modo producción: aquí iría la integración con RevenueCat
        // TODO: Implementar cuando tengas cuenta Apple Developer
        return {
          success: false,
          error: 'Pagos reales aún no configurados',
        };
      }

      // 2. Actualizar suscripción en la DB
      const periodStart = new Date();
      const periodEnd = new Date();
      
      if (interval === 'monthly') {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      } else {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      }

      const { data, error } = await supabase
        .from('vault_subscriptions')
        .update({
          plan_type: 'pro',
          billing_interval: interval,
          status: 'active',
          storage_quota_bytes: VAULT_LIMITS.PRO_QUOTA_BYTES,
          current_period_start: periodStart.toISOString(),
          current_period_end: periodEnd.toISOString(),
          apple_transaction_id: transactionId,
        })
        .eq('id', subscriptionId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error actualizando suscripción:', error);
        throw error;
      }

      console.log('✅ Suscripción actualizada a PRO:', data.id);

      return { success: true };
    } catch (error: any) {
      console.error('❌ Error en upgradeToPro:', error);
      return {
        success: false,
        error: error.message || 'Error al actualizar la suscripción',
      };
    }
  },

  /**
   * Cancela una suscripción PRO (vuelve a FREE)
   */
  async cancelSubscription(subscriptionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🚫 Cancelando suscripción:', subscriptionId);

      // 1. Si es mock, usar el método de cancelación mock
      if (IS_MOCK_PAYMENTS_ENABLED) {
        await MockPaymentService.cancelSubscription();
      } else {
        // TODO: Cancelar en RevenueCat cuando esté configurado
      }

      // 2. Downgrade a FREE en la DB
      const { error } = await supabase
        .from('vault_subscriptions')
        .update({
          plan_type: 'free',
          billing_interval: null,
          status: 'active',
          storage_quota_bytes: VAULT_LIMITS.FREE_QUOTA_BYTES,
          current_period_end: null,
        })
        .eq('id', subscriptionId);

      if (error) {
        console.error('❌ Error cancelando suscripción:', error);
        throw error;
      }

      console.log('✅ Suscripción cancelada (downgrade a FREE)');

      return { success: true };
    } catch (error: any) {
      console.error('❌ Error en cancelSubscription:', error);
      return {
        success: false,
        error: error.message || 'Error al cancelar la suscripción',
      };
    }
  },

  /**
   * Verifica si una suscripción está expirada
   */
  isSubscriptionExpired(subscription: VaultSubscription): boolean {
    if (!subscription.current_period_end) return false;

    const now = new Date();
    const endDate = new Date(subscription.current_period_end);

    return now >= endDate;
  },

  /**
   * Verifica si el usuario tiene una campaña activa
   * (requerido para tener acceso a la bóveda)
   */
  async hasCampaign(userId: string): Promise<{ hasCampaign: boolean; campaignId?: string }> {
    try {
        console.log("entre");
      const { data, error } = await supabase
        .from('campaigns')
        .select('id')
        .eq('owner_user_id', userId)
        .maybeSingle();
        
      if (error) throw error;

      if (data) {
        return {
          hasCampaign: true,
          campaignId: data.id,
        };
      }

      return { hasCampaign: false };
    } catch (error) {
      console.error('❌ Error verificando campaña:', error);
      return { hasCampaign: false };
    }
  },

  /**
   * Obtiene el historial de uso de almacenamiento
   */
  async getUsageLogs(subscriptionId: string, limit: number = 20) {
    try {
      const { data, error } = await supabase
        .from('vault_usage_logs')
        .select('*')
        .eq('subscription_id', subscriptionId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('❌ Error obteniendo logs de uso:', error);
      return [];
    }
  },

  /**
   * Actualiza el storage_used_bytes manualmente (fallback)
   * Normalmente los triggers de la DB manejan esto automáticamente
   */
  async updateStorageUsed(subscriptionId: string, newUsedBytes: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('vault_subscriptions')
        .update({ storage_used_bytes: newUsedBytes })
        .eq('id', subscriptionId);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('❌ Error actualizando storage usado:', error);
      return false;
    }
  },

  /**
   * Helper de desarrollo: Activa PRO manualmente (sin pago)
   * Solo funciona en modo mock
   */
  async _devActivatePro(
    subscriptionId: string,
    interval: BillingInterval = 'monthly'
  ): Promise<{ success: boolean }> {
    if (!IS_MOCK_PAYMENTS_ENABLED) {
      console.warn('⚠️ _devActivatePro solo funciona en modo desarrollo');
      return { success: false };
    }

    console.log('🔧 [DEV] Activando PRO sin pago...');

    const periodStart = new Date();
    const periodEnd = new Date();
    
    if (interval === 'monthly') {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    } else {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    }

    const { error } = await supabase
      .from('vault_subscriptions')
      .update({
        plan_type: 'pro',
        billing_interval: interval,
        status: 'active',
        storage_quota_bytes: VAULT_LIMITS.PRO_QUOTA_BYTES,
        current_period_start: periodStart.toISOString(),
        current_period_end: periodEnd.toISOString(),
        apple_transaction_id: `dev_${Date.now()}`,
      })
      .eq('id', subscriptionId);

    if (error) {
      console.error('❌ Error activando PRO (dev):', error);
      return { success: false };
    }

    console.log('✅ [DEV] PRO activado manualmente');
    return { success: true };
  },
};