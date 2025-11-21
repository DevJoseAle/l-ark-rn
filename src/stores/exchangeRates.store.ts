// src/stores/loadingStore.ts
import { create } from 'zustand';
import { ExchangeService } from '../services/exchange.service';
import { Alert } from 'react-native';
import { useCampaignStore } from './campaign.store';
import { CountryCode } from '../types/campaign-create.types';

interface ExchangeRatesStore {
  isLoading: boolean;
  hasError: boolean;
  mxnRate:  number;
  clpRate:  number;
  copRate:  number;
  country: CountryCode;
  goalInMxn: () => number;
  goalInClp: () => number;
  goalInCop: () => number;
  //Setters
  setIsLoading: (isLoading: boolean) => void;
  setHasError: (hasError: boolean) => void;
  getExchangeRates: () => Promise<void>;
  setCountry: (country: CountryCode) => void;

}

export const useExchangeRatesStore = create<ExchangeRatesStore>((set, get) => ({
    isLoading:false,
    hasError:false,
    mxnRate:0,
    clpRate:0,
    copRate:0,
    country: 'US',
    setIsLoading: (isLoading) => set({ isLoading }),
    setHasError: (hasError) => set({ hasError }),

    goalInClp: () => { 
        const clpRate = get().clpRate;
        const goalAmount = useCampaignStore.getState().campaign?.goal_amount
        if(clpRate == 0 || !goalAmount){
            return 0
        }
        return clpRate * goalAmount
    },
    goalInMxn: () => { 
        const mxnRate = get().mxnRate;
        const goalAmount = useCampaignStore.getState().campaign?.goal_amount
        if(mxnRate == 0 || !goalAmount){
            return 0
        }
        return mxnRate * goalAmount
     },
    goalInCop: () => { 
        const copRate = get().copRate;
        const goalAmount = useCampaignStore.getState().campaign?.goal_amount
        if(copRate == 0 || !goalAmount){
            return 0
        }
        return copRate * goalAmount
     },

    //Gets
    getExchangeRates: async () => {
        set({ isLoading: true, hasError: false });
        try {
            const response = await ExchangeService.getExchangeRates();
            if(response.error){
                throw new Error
            }
            const {mxn_rate: mxnRate, clp_rate: clpRate, cop_rate: copRate} = response.data!;
             set({
                 mxnRate,
                 copRate,
                 clpRate,
             });
            set({ isLoading: false, hasError: false });
        } catch (error) {
            set({ isLoading: false, hasError: true });
            Alert.alert('Error al intentar obtener las tasas de cambio')
            set({
                mxnRate: 0,
                copRate: 0,
                clpRate: 0,
            });
        }
    },

    setCountry: (country: CountryCode) => set({ country }),

}));