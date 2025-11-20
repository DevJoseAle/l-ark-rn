// src/stores/profile.store.ts

import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import { ProfileService } from '../services/profile.service';
import {
    BeneficiaryAccount,
    KYCDocument,
    ProfileAlerts,
    ProfileBeneficiaryCampaign,
    ProfileCampaign,
    ProfileStats,
    ProfileSummary,
    UpdateProfileDTO,
    UserProfile,
} from '../types/profile.types';

interface ProfileState {
  // Data
  user: UserProfile | null;
  kycDocuments: KYCDocument[];
  beneficiaryAccount: BeneficiaryAccount | null;
  ownedCampaigns: ProfileCampaign[];
  beneficiaryCampaigns: ProfileBeneficiaryCampaign[];
  
  // Computed
  alerts: ProfileAlerts | null;
  stats: ProfileStats | null;
  
  // Loading states
  isLoading: boolean;
  isUpdating: boolean;
  isRefreshing: boolean;
  
  // Error
  error: string | null;
  
  // Cache
  lastFetch: number | null;
  
  // Actions
  fetchProfile: () => Promise<void>;
  updateProfile: (updates: UpdateProfileDTO) => Promise<boolean>;
  refreshCampaigns: () => Promise<void>;
  refreshConnectStatus: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  
  // Internal
  _setProfileData: (summary: ProfileSummary) => void;
  _shouldRefetch: () => boolean;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const useProfileStore = create<ProfileState>((set, get) => ({
  // Initial state
  user: null,
  kycDocuments: [],
  beneficiaryAccount: null,
  ownedCampaigns: [],
  beneficiaryCampaigns: [],
  alerts: null,
  stats: null,
  isLoading: false,
  isUpdating: false,
  isRefreshing: false,
  error: null,
  lastFetch: null,

  // Fetch profile completo
  fetchProfile: async () => {
    // Verificar si necesitamos refetch
    if (!get()._shouldRefetch()) {
      console.log('📦 Using cached profile data');
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const { data, error } = await ProfileService.getProfileSummary();

      if (error) {
        throw error;
      }

      if (data) {
        get()._setProfileData(data);
      }
    } catch (error: any) {
      console.error('❌ Error fetching profile:', error);
      set({ 
        error: error.message || 'Error al cargar el perfil',
        isLoading: false 
      });
    }
  },

  // Actualizar perfil
  updateProfile: async (updates: UpdateProfileDTO) => {
    set({ isUpdating: true, error: null });

    // Optimistic update
    const previousUser = get().user;
    if (previousUser) {
      set({
        user: {
          ...previousUser,
          ...updates,
        },
      });
    }

    try {
      const { data, error } = await ProfileService.updateProfile(updates);

      if (error) {
        throw error;
      }

      if (data) {
        // Actualizar con data del servidor
        set({ 
          user: data,
          isUpdating: false,
        });
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('❌ Error updating profile:', error);
      
      // Rollback optimistic update
      set({
        user: previousUser,
        error: error.message || 'Error al actualizar el perfil',
        isUpdating: false,
      });
      
      return false;
    }
  },

  // Refrescar solo campañas (pull-to-refresh)
  refreshCampaigns: async () => {
    set({ isRefreshing: true, error: null });

    try {
      const { owned, beneficiary } = await ProfileService.refreshCampaigns();

      set({
        ownedCampaigns: owned,
        beneficiaryCampaigns: beneficiary,
        isRefreshing: false,
      });

      // Recalcular stats con las campañas actualizadas
      const currentState = get();
      if (currentState.user) {
        const summary: ProfileSummary = {
          user: currentState.user,
          kycDocuments: currentState.kycDocuments,
          beneficiaryAccount: currentState.beneficiaryAccount,
          ownedCampaigns: owned,
          beneficiaryCampaigns: beneficiary,
        };
        
        const newStats = ProfileService.calculateStats(summary);
        set({ stats: newStats });
      }
    } catch (error: any) {
      console.error('❌ Error refreshing campaigns:', error);
      set({
        error: error.message || 'Error al actualizar campañas',
        isRefreshing: false,
      });
    }
  },

  // Refrescar estado de Connect
  refreshConnectStatus: async () => {
    try {
      const account = await ProfileService.getConnectStatus();
      
      set({ beneficiaryAccount: account });

      // Recalcular alerts
      const currentState = get();
      if (currentState.user) {
        const summary: ProfileSummary = {
          user: currentState.user,
          kycDocuments: currentState.kycDocuments,
          beneficiaryAccount: account,
          ownedCampaigns: currentState.ownedCampaigns,
          beneficiaryCampaigns: currentState.beneficiaryCampaigns,
        };
        
        const newAlerts = ProfileService.calculateAlerts(summary);
        set({ alerts: newAlerts });
      }
    } catch (error: any) {
      console.error('❌ Error refreshing connect status:', error);
    }
  },

  // Logout
  logout: async () => {
    try {
      await supabase.auth.signOut();
      
      // Limpiar todo el state
      set({
        user: null,
        kycDocuments: [],
        beneficiaryAccount: null,
        ownedCampaigns: [],
        beneficiaryCampaigns: [],
        alerts: null,
        stats: null,
        isLoading: false,
        isUpdating: false,
        isRefreshing: false,
        error: null,
        lastFetch: null,
      });
    } catch (error: any) {
      console.error('❌ Error logging out:', error);
      set({ error: error.message || 'Error al cerrar sesión' });
    }
  },

  // Limpiar error
  clearError: () => {
    set({ error: null });
  },

  // Internal: Set profile data
  _setProfileData: (summary: ProfileSummary) => {
    const alerts = ProfileService.calculateAlerts(summary);
    const stats = ProfileService.calculateStats(summary);

    set({
      user: summary.user,
      kycDocuments: summary.kycDocuments,
      beneficiaryAccount: summary.beneficiaryAccount,
      ownedCampaigns: summary.ownedCampaigns,
      beneficiaryCampaigns: summary.beneficiaryCampaigns,
      alerts,
      stats,
      isLoading: false,
      lastFetch: Date.now(),
    });
  },

  // Internal: Check if should refetch
  _shouldRefetch: () => {
    const { lastFetch, isLoading } = get();
    
    // No refetch si ya está cargando
    if (isLoading) return false;
    
    // Refetch si nunca ha cargado
    if (!lastFetch) return true;
    
    // Refetch si el cache está stale
    const now = Date.now();
    return now - lastFetch > CACHE_DURATION;
  },
}));

// Selectors optimizados
export const profileSelectors = {
  // Verificar si necesita completar KYC
  needsKYC: (state: ProfileState) => state.alerts?.needsKYC || false,
  
  // Verificar si necesita completar Connect
  needsConnect: (state: ProfileState) => state.alerts?.needsConnect || false,
  
  // Verificar si KYC fue rechazado
  isKYCRejected: (state: ProfileState) => state.alerts?.kycRejected || false,
  
  // Verificar si Connect fue rechazado
  isConnectRejected: (state: ProfileState) => state.alerts?.connectRejected || false,
  
  // Obtener status de KYC
  kycStatus: (state: ProfileState) => state.user?.kyc_status || 'kyc_pending',
  
  // Obtener status de Connect
  connectStatus: (state: ProfileState) => 
    state.beneficiaryAccount?.connect_status || null,
  
  // Verificar si es beneficiario
  isBeneficiary: (state: ProfileState) => 
    state.beneficiaryCampaigns.length > 0,
  
  // Verificar si tiene campañas
  hasOwnedCampaigns: (state: ProfileState) => 
    state.ownedCampaigns.length > 0,
  
  // Obtener país
  country: (state: ProfileState) => state.user?.country || null,
  
  // Verificar si el país soporta Connect
  countrySupportsConnect: (state: ProfileState) => {
    const country = state.user?.country;
    return country ? ['US', 'MX', 'CO'].includes(country) : false;
  },
};