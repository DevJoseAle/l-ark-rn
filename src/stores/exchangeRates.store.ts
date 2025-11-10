// src/stores/loadingStore.ts
import { create } from 'zustand';
import { ExchangeService } from '../services/exchange.service';
import { Alert } from 'react-native';

interface ExchangeRatesStore {
  isLoading: boolean;
  hasError: boolean;
  mxnRate:  number;
  clpRate:  number;
  copRate:  number;
  
  setIsLoading: (isLoading: boolean) => void;
  setHasError: (hasError: boolean) => void;
  getExchangeRates: () => Promise<void>;
}

export const useExchangeRatesStore = create<ExchangeRatesStore>((set) => ({
    isLoading:false,
    hasError:false,
    mxnRate:0,
    clpRate:0,
    copRate:0,
    setIsLoading: (isLoading) => set({ isLoading }),
    setHasError: (hasError) => set({ hasError }),
    //Gets
    getExchangeRates: async () => {
        set({ isLoading: true, hasError: false });
        try {
            const response = await ExchangeService.getExchangeRates();
            if(response.error){
                throw new Error
            }
            const {mxnRate, clpRate, copRate} = response.data!;
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
    }

}));