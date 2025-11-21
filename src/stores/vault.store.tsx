import { create } from 'zustand';
import { SubscriptionService } from '../services/subscriptions.service';
import { VaultService } from '../services/vault.service';
import {
  FileToUpload,
  StorageQuota,
  UploadResult,
  VaultFile,
  VaultSubscription,
} from '../types/vault.types';
import { calculateStorageQuota } from '../utils/vaultUtils';

/**
 * Estado del store
 */
interface VaultState {
  // Datos
  files: VaultFile[];
  subscription: VaultSubscription | null;
  hasCampaign: boolean;
  campaignId: string | null;

  // Estados de carga
  isLoadingFiles: boolean;
  isLoadingSubscription: boolean;
  isUploading: boolean;

  // Errores
  error: string | null;

  // Computados
  storageQuota: StorageQuota | null;

  // Acciones - Inicialización
  initialize: (userId: string) => Promise<void>;
  reset: () => void;

  // Acciones - Archivos
  fetchFiles: (userId: string, campaignId: string) => Promise<void>;
  uploadFile: (file: FileToUpload) => Promise<UploadResult>;
  deleteFile: (fileId: string, storagePath: string) => Promise<boolean>;
  refreshFiles: () => Promise<void>;

  // Acciones - Suscripción
  fetchSubscription: (userId: string, campaignId: string) => Promise<void>;
  upgradeToPro: (interval: 'monthly' | 'yearly') => Promise<boolean>;
  cancelSubscription: () => Promise<boolean>;
  refreshSubscription: () => Promise<void>;

  // Acciones - Helpers
  setError: (error: string | null) => void;
  clearError: () => void;
}

/**
 * Estado inicial
 */
const initialState = {
  files: [],
  subscription: null,
  hasCampaign: false,
  campaignId: null,
  isLoadingFiles: false,
  isLoadingSubscription: false,
  isUploading: false,
  error: null,
  storageQuota: null,
};

/**
 * Store de Zustand para la Bóveda
 */
export const useVaultStore = create<VaultState>((set, get) => ({
  ...initialState,

  /**
   * Inicializa el store verificando campaña y cargando datos
   */
  initialize: async (userId: string) => {
    try {
      // 1. Verificar si tiene campaña
      const { hasCampaign, campaignId } = await SubscriptionService.hasCampaign(userId);

      set({ hasCampaign, campaignId });

      if (!hasCampaign || !campaignId) {
        return;
      }

      // 2. Cargar suscripción
      await get().fetchSubscription(userId, campaignId);

      // 3. Cargar archivos
      await get().fetchFiles(userId, campaignId);
    } catch (error) {
      console.error('❌ Error inicializando VaultStore:', error);
      set({ error: 'Error al inicializar la bóveda' });
    }
  },

  /**
   * Resetea el store al estado inicial
   */
  reset: () => {
    set(initialState);
  },

  /**
   * Carga la lista de archivos
   */
  fetchFiles: async (userId: string, campaignId: string) => {
    try {
      set({ isLoadingFiles: true, error: null });

      const files = await VaultService.getFiles(userId, campaignId);

      set({ files, isLoadingFiles: false });
    } catch (error) {
      console.error('❌ Error cargando archivos:', error);
      set({
        error: 'Error al cargar los archivos',
        isLoadingFiles: false,
      });
    }
  },

  /**
   * Sube un archivo a la bóveda
   */
  uploadFile: async (file: FileToUpload): Promise<UploadResult> => {
    const state = get();

    if (!state.subscription || !state.campaignId) {
      return {
        success: false,
        error: 'No hay suscripción activa',
      };
    }

    try {
      set({ isUploading: true, error: null });

      // Obtener userId desde la suscripción
      const userId = state.subscription.user_id;

      const result = await VaultService.uploadFile(
        file,
        userId,
        state.campaignId,
        state.subscription.id,
        state.subscription.storage_used_bytes,
        state.subscription.storage_quota_bytes
      );

      if (result.success && result.file) {
        // Agregar archivo a la lista (optimistic update)
        set((state) => ({
          files: [result.file!, ...state.files],
          isUploading: false,
        }));

        // Refrescar suscripción para actualizar storage_used_bytes
        await get().refreshSubscription();
      } else {
        set({ isUploading: false, error: result.error || 'Error al subir' });
      }

      return result;
    } catch (error) {
      console.error('❌ Error en uploadFile:', error);
      set({ isUploading: false });
      return {
        success: false,
        error: 'Error inesperado al subir el archivo',
      };
    }
  },

  /**
   * Elimina un archivo
   */
  deleteFile: async (fileId: string, storagePath: string): Promise<boolean> => {
    try {
      set({ error: null });

      // Optimistic update: eliminar de la lista inmediatamente
      set((state) => ({
        files: state.files.filter((f) => f.id !== fileId),
      }));

      const result = await VaultService.deleteFile(fileId, storagePath);

      if (result.success) {
        // Refrescar suscripción para actualizar storage_used_bytes
        await get().refreshSubscription();

        return true;
      } else {
        // Rollback: volver a cargar archivos si falló
        const state = get();
        if (state.campaignId && state.subscription) {
          await get().fetchFiles(state.subscription.user_id, state.campaignId);
        }

        set({ error: result.error || 'Error al eliminar' });
        return false;
      }
    } catch (error) {
      console.error('❌ Error en deleteFile:', error);
      set({ error: 'Error inesperado al eliminar el archivo' });
      return false;
    }
  },

  /**
   * Refresca la lista de archivos
   */
  refreshFiles: async () => {
    const state = get();
    if (!state.subscription || !state.campaignId) return;

    await get().fetchFiles(state.subscription.user_id, state.campaignId);
  },

  /**
   * Carga la suscripción del usuario
   */
  fetchSubscription: async (userId: string, campaignId: string) => {
    try {
      set({ isLoadingSubscription: true, error: null });

      const subscription = await SubscriptionService.getOrCreateSubscription(userId, campaignId);

      if (subscription) {
        // Calcular cuota de almacenamiento
        const storageQuota = calculateStorageQuota(
          subscription.storage_used_bytes,
          subscription.storage_quota_bytes
        );

        set({
          subscription,
          storageQuota,
          isLoadingSubscription: false,
        });
      } else {
        throw new Error('No se pudo obtener la suscripción');
      }
    } catch (error) {
      console.error('❌ Error cargando suscripción:', error);
      set({
        error: 'Error al cargar la suscripción',
        isLoadingSubscription: false,
      });
    }
  },

  /**
   * Actualiza la suscripción a plan PRO
   */
  upgradeToPro: async (interval: 'monthly' | 'yearly'): Promise<boolean> => {
    const state = get();

    if (!state.subscription) {
      set({ error: 'No hay suscripción activa' });
      return false;
    }

    try {
      set({ error: null });

      const result = await SubscriptionService.upgradeToPro(state.subscription.id, interval);

      if (result.success) {
        // Refrescar suscripción para obtener datos actualizados
        await get().refreshSubscription();

        return true;
      } else {
        set({ error: result.error || 'Error al actualizar a PRO' });
        return false;
      }
    } catch (error) {
      console.error('❌ Error en upgradeToPro:', error);
      set({ error: 'Error inesperado al actualizar a PRO' });
      return false;
    }
  },

  /**
   * Cancela la suscripción PRO (vuelve a FREE)
   */
  cancelSubscription: async (): Promise<boolean> => {
    const state = get();

    if (!state.subscription) {
      set({ error: 'No hay suscripción activa' });
      return false;
    }

    try {
      set({ error: null });

      const result = await SubscriptionService.cancelSubscription(state.subscription.id);

      if (result.success) {
        // Refrescar suscripción para obtener datos actualizados
        await get().refreshSubscription();

        return true;
      } else {
        set({ error: result.error || 'Error al cancelar la suscripción' });
        return false;
      }
    } catch (error) {
      console.error('❌ Error en cancelSubscription:', error);
      set({ error: 'Error inesperado al cancelar la suscripción' });
      return false;
    }
  },

  /**
   * Refresca la suscripción (útil después de cambios)
   */
  refreshSubscription: async () => {
    const state = get();
    if (!state.subscription || !state.campaignId) return;

    await get().fetchSubscription(state.subscription.user_id, state.campaignId);
  },

  /**
   * Establece un error manualmente
   */
  setError: (error: string | null) => {
    set({ error });
  },

  /**
   * Limpia el error actual
   */
  clearError: () => {
    set({ error: null });
  },
}));

export const useVaultPlan = () => {
  const subscription = useVaultStore((state) => state.subscription);

  return {
    isFree: subscription?.plan_type === 'free',
    isPro: subscription?.plan_type === 'pro' || subscription?.plan_type === 'standard',
    planType: subscription?.plan_type || 'free',
    billingInterval: subscription?.billing_interval,
  };
};

/**
 * Hook de conveniencia para verificar el estado de almacenamiento
 */
export const useStorageStatus = () => {
  const storageQuota = useVaultStore((state) => state.storageQuota);

  return {
    quota: storageQuota,
    isNearLimit: storageQuota?.isNearLimit || false,
    isAtLimit: storageQuota?.isAtLimit || false,
    canUpload: !(storageQuota?.isAtLimit || false),
  };
};
