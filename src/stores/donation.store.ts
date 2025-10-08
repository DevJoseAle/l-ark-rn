import { create } from "zustand";
import { DonationService } from "../services/donation.service";
import { DonationListItem } from "../types/donation.types";


interface DonationState {
  // State
  donations: DonationListItem[];
  isLoading: boolean;
  error: string | null;
  lastFetchedAt: number | null;

  // Actions
  fetchDonations: (campaignId: string) => Promise<void>;
  refreshDonations: (campaignId: string) => Promise<void>;
  clearDonations: () => void;
  setError: (error: string | null) => void;
}

export const useDonationStore = create<DonationState>((set, get) => ({
  // Initial state
  donations: [],
  isLoading: false,
  error: null,
  lastFetchedAt: null,

  // Fetch donations
  fetchDonations: async (campaignId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const rawDonations = await DonationService.getCampaignDonations(campaignId);
      const formattedDonations = DonationService.formatDonationsForUI(rawDonations);
      
      set({ 
        donations: formattedDonations,
        isLoading: false,
        lastFetchedAt: Date.now(),
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar donaciones';
      set({ 
        donations: [],
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  // Refresh donations (forzar recarga)
  refreshDonations: async (campaignId: string) => {
    // No mostrar loading en refresh para mejor UX
    try {
      const rawDonations = await DonationService.getCampaignDonations(campaignId);
      const formattedDonations = DonationService.formatDonationsForUI(rawDonations);
      
      set({ 
        donations: formattedDonations,
        lastFetchedAt: Date.now(),
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al refrescar donaciones';
      set({ error: errorMessage });
      throw error;
    }
  },

  // Clear donations
  clearDonations: () => {
    set({ 
      donations: [],
      isLoading: false,
      error: null,
      lastFetchedAt: null,
    });
  },

  // Set error
  setError: (error: string | null) => {
    set({ error });
  },
}));

// Selectors optimizados
export const selectDonations = (state: DonationState) => state.donations;
export const selectIsLoading = (state: DonationState) => state.isLoading;
export const selectError = (state: DonationState) => state.error;
export const selectDonationsCount = (state: DonationState) => state.donations.length;