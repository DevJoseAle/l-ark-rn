import { UserService } from "@/src/services/user.service";
import { useAuthStore } from "@/src/stores/authStore";
import { useCampaignStore } from "@/src/stores/campaign.store";
import { useDonationStore } from "@/src/stores/donation.store";
import { useState, useEffect, useCallback } from "react";

export type HomeViewState = 'loading' | 'error' | 'empty' | 'success';

export function useHomeData() {
  const [viewState, setViewState] = useState<HomeViewState>('loading');

  // Campaign store
  const campaign = useCampaignStore((state) => state.campaign);
  const campaignLoading = useCampaignStore((state) => state.isLoading);
  const campaignError = useCampaignStore((state) => state.error);
  const fetchCampaign = useCampaignStore((state) => state.fetchCampaign);
  const toggleVisibility = useCampaignStore((state) => state.toggleVisibility);

  // Donation store
  const donations = useDonationStore((state) => state.donations);
  const donationsLoading = useDonationStore((state) => state.isLoading);
  const donationsError = useDonationStore((state) => state.error);
  const fetchDonations = useDonationStore((state) => state.fetchDonations);
  const refreshDonations = useDonationStore((state) => state.refreshDonations);

  // Load initial data
  useEffect(() => {
    loadData();

  }, []);

  // Update view state based on campaign and loading states
  useEffect(() => {
    if (campaignLoading || donationsLoading) {
      setViewState('loading');
    } else if (campaignError) {
      setViewState('error');
    } else if (!campaign) {
      setViewState('empty');
    } else {
      setViewState('success');
    }
  }, [campaign, campaignLoading, donationsLoading, campaignError]);

  const loadData = async () => {
    try {
      // Primero cargar campaña
      await fetchCampaign();
      // Si hay campaña, cargar donaciones
      const currentCampaign = useCampaignStore.getState().campaign;
      if (currentCampaign) {
        await fetchDonations(currentCampaign.id);
      }
    } catch (error) {
      console.error('Error loading home data:', error);
      // El error ya está en el store, solo loguear
    }
  };

  const handleRetry = useCallback(() => {
    loadData();
  }, []);

  const handleToggleVisibility = useCallback(async () => {
    if (!campaign) return;
    try {
      await toggleVisibility();
    } catch (error) {
      console.error('Error toggling visibility:', error);
      // El error ya está en el store
    }
  }, [campaign, toggleVisibility]);

  const handleRefresh = useCallback(async () => {
    if (!campaign) {
      await loadData();
      return;
    }
    
    try {
      await Promise.all([
        fetchCampaign(),
        refreshDonations(campaign.id),
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  }, [campaign, fetchCampaign, refreshDonations]);

  // Format campaign data for UI
  const campaignData = campaign ? {
    totalRaised: formatCurrency(campaign.total_raised),
    currentAmount: formatCurrency(campaign.total_raised),
    goalAmount: formatCurrency(campaign.goal_amount || 0),
    percentage: calculatePercentage(campaign.total_raised, campaign.goal_amount || 0),
    isVisible: campaign.visibility === 'public',
  } : null;

  return {
    viewState,
    campaign,
    campaignData,
    donations,
    isLoading: campaignLoading || donationsLoading,
    error: campaignError || donationsError,
    handleRetry,
    handleToggleVisibility,
    handleRefresh,
    loadData,
  };
}

// Helper functions
function formatCurrency(amount: number): string {
  // Formatear sin el símbolo CLP, solo el número
  return new Intl.NumberFormat('es-CL', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function calculatePercentage(current: number, goal: number): number {
  if (goal === 0) return 0;
  const percentage = Math.round((current / goal) * 100);
  return Math.min(percentage, 100); // Cap at 100%
}