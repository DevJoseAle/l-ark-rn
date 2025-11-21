/**
 * ⚠️ MOCK PAYMENT SERVICE - SOLO PARA DESARROLLO
 *
 * Este servicio simula compras de suscripciones sin necesitar
 * cuenta de Apple Developer o Google Play.
 *
 *  este archivo será reemplazado
 * por RevenueCatService.ts
 */

import { BillingInterval, VaultPlanType } from '../types/vault.types';

export interface MockPurchaseResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export interface MockSubscriptionInfo {
  isActive: boolean;
  planType: VaultPlanType;
  billingInterval: BillingInterval | null;
  expiresAt: string | null;
  transactionId: string | null;
}

/**
 * Simula delay de red (para que se sienta real)
 */
const simulateNetworkDelay = (ms: number = 2000) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Genera un transaction ID falso (para testing)
 */
const generateMockTransactionId = () => {
  return `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Mock Payment Service
 */
export const MockPaymentService = {
  /**
   * Simula la compra de un plan PRO
   * @param interval - monthly o yearly
   * @returns Resultado de la compra simulada
   */
  async purchasePro(interval: BillingInterval): Promise<MockPurchaseResult> {
    console.log('🎭 [MOCK] Iniciando compra simulada:', interval);

    // Simula delay de procesamiento
    await simulateNetworkDelay(2000);

    // Simula éxito (95% de probabilidad para testing)
    const shouldSucceed = Math.random() > 0.05;

    if (shouldSucceed) {
      const transactionId = generateMockTransactionId();

      console.log('✅ [MOCK] Compra exitosa:', transactionId);

      return {
        success: true,
        transactionId,
      };
    } else {
      console.log('❌ [MOCK] Compra fallida (simulación de error)');

      return {
        success: false,
        error: 'Pago cancelado por el usuario (simulado)',
      };
    }
  },

  /**
   * Simula la obtención del estado de suscripción actual
   * En producción, esto consultaría RevenueCat o el store de Apple/Google
   */
  async getSubscriptionInfo(): Promise<MockSubscriptionInfo> {
    console.log('🎭 [MOCK] Obteniendo info de suscripción');

    await simulateNetworkDelay(500);

    // Por defecto retorna sin suscripción (FREE)
    // En desarrollo puedes cambiar esto manualmente para testear
    return {
      isActive: false,
      planType: 'free',
      billingInterval: null,
      expiresAt: null,
      transactionId: null,
    };
  },

  /**
   * Simula restaurar compras anteriores
   */
  async restorePurchases(): Promise<MockPurchaseResult> {
    console.log('🎭 [MOCK] Restaurando compras');

    await simulateNetworkDelay(1500);

    // Simula que no hay compras previas
    return {
      success: false,
      error: 'No se encontraron compras previas (mock)',
    };
  },

  /**
   * Simula cancelar la suscripción
   */
  async cancelSubscription(): Promise<{ success: boolean }> {
    console.log('🎭 [MOCK] Cancelando suscripción');

    await simulateNetworkDelay(1000);

    return { success: true };
  },

  /**
   * Helper: Activa manualmente un plan PRO (para testing)
   * Esto actualiza directamente la DB sin pasar por payment
   */
  async _devActivatePro(
    userId: string,
    campaignId: string,
    interval: BillingInterval = 'monthly'
  ): Promise<MockPurchaseResult> {
    console.log('🔧 [DEV] Activando PRO manualmente para testing');

    const transactionId = generateMockTransactionId();

    // Aquí llamarías a tu SubscriptionService para actualizar la DB
    // Por ahora solo retornamos el mock result

    return {
      success: true,
      transactionId,
    };
  },

  /**
   * Helper: Desactiva manualmente el plan PRO (vuelve a FREE)
   */
  async _devDeactivatePro(userId: string, campaignId: string): Promise<{ success: boolean }> {
    console.log('🔧 [DEV] Desactivando PRO (volver a FREE)');

    // Aquí llamarías a tu SubscriptionService para actualizar la DB

    return { success: true };
  },
};

/**
 * Variable de entorno para saber si estamos en desarrollo
 * Cuando la app esté en producción, esto debe ser false
 */
export const IS_MOCK_PAYMENTS_ENABLED = __DEV__;

/**
 * Mensajes de ayuda para desarrollo
 */
export const MOCK_PAYMENT_MESSAGES = {
  purchaseSuccess:
    '✅ Compra simulada exitosa!\nEn producción, esto procesaría el pago real con Apple/Google.',
  purchaseError:
    '❌ Compra simulada fallida!\nEsto simula cuando el usuario cancela o hay un error.',
  devMode: '🎭 Modo desarrollo: Los pagos son simulados.\nNinguna tarjeta será cobrada.',
};
