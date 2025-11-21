import { create } from "zustand";
import { CampaignService } from "../services/campaign.service";
import { Campaign, CreateCampaignDTO, UpdateCampaignDTO } from "../types/campaign.types";

interface CampaignState {
  // State
  campaign: Campaign | null;
  isLoading: boolean;
  error: string | null;
  lastFetchedAt: number | null;
  amountVisibility: boolean;

  // Actions
  fetchCampaign: () => Promise<void>;
  createCampaign: (data: CreateCampaignDTO) => Promise<Campaign>;
  updateCampaign: (campaignId: string, data: UpdateCampaignDTO) => Promise<void>;
  toggleVisibility: () => void;
  deleteCampaign: (campaignId: string) => Promise<void>;
  clearCampaign: () => void;
  setError: (error: string | null) => void;
}

export const useCampaignStore = create<CampaignState>((set, get) => ({
  // Initial state
  campaign: null,
  isLoading: false,
  error: null,
  lastFetchedAt: null,
  amountVisibility: false,

  // Fetch user campaign
  fetchCampaign: async () => {
set({ isLoading: true, error: null });

    try {
      const campaign = await CampaignService.getUserCampaign();
set({
        campaign,
        isLoading: false,
        lastFetchedAt: Date.now(),
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar campaña';
      set({
        campaign: null,
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  // Create campaign
  createCampaign: async (data: CreateCampaignDTO) => {
    set({ isLoading: true, error: null });

    try {
      const campaign = await CampaignService.createCampaign(data);
      set({
        campaign,
        isLoading: false,
        lastFetchedAt: Date.now(),
        error: null,
      });
      return campaign;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear campaña';
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  // Update campaign
  updateCampaign: async (campaignId: string, data: UpdateCampaignDTO) => {
    const previousCampaign = get().campaign;

    // Optimistic update
    if (previousCampaign) {
      set({
        campaign: { ...previousCampaign, ...data } as Campaign,
      });
    }

    try {
      const updatedCampaign = await CampaignService.updateCampaign(campaignId, data);
      set({
        campaign: updatedCampaign,
        error: null,
      });
    } catch (error) {
      // Revert on error
      set({ campaign: previousCampaign });

      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar campaña';
      set({ error: errorMessage });
      throw error;
    }
  },

  // Toggle visibility
  toggleVisibility: () => {
    let visibility = get().amountVisibility
    set({amountVisibility: !visibility})
  },
  // toggleVisibility: async (campaignId: string) => {
  //   const campaign = get().campaign;
  //   if (!campaign) return;

  //   const newVisibility = campaign.visibility === 'public' ? 'private' : 'public';

  //   // Optimistic update
  //   set({
  //     campaign: { ...campaign, visibility: newVisibility },
  //   });

  //   try {
  //     await CampaignService.updateVisibility(campaignId, newVisibility);
  //   } catch (error) {
  //     // Revert on error
  //     set({ campaign });

  //     const errorMessage = error instanceof Error ? error.message : 'Error al cambiar visibilidad';
  //     set({ error: errorMessage });
  //     throw error;
  //   }
  // },

  // Delete campaign
  deleteCampaign: async (campaignId: string) => {
    set({ isLoading: true, error: null });

    try {
      await CampaignService.deleteCampaign(campaignId);
      set({
        campaign: null,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar campaña';
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  // Clear campaign
  clearCampaign: () => {
    set({
      campaign: null,
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
export const selectCampaign = (state: CampaignState) => state.campaign;
export const selectIsLoading = (state: CampaignState) => state.isLoading;
export const selectError = (state: CampaignState) => state.error;
export const selectHasCampaign = (state: CampaignState) => state.campaign !== null;
