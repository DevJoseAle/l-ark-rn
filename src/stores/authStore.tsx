// src/stores/loadingStore.ts
import { Tables } from '@/supabaseTypes/supabase';
import { create } from 'zustand';

interface authStore {
    user: Tables<'users'> | null;
    email: string | null;
    isEmailValid: boolean;
    otpCode: string | null;
    isOtpValid: boolean;
    verifyOtp: (code: string) => void;
    setUser: (user: Tables<'users'> | null) => void
    setEmail: (email: string) => void;
    setOtpCode: (code: string) => void
    setIsEmailValid: (isValid: boolean) => void
    setIsOtpValid: (isValid: boolean) => void;

}

export const useAuthStore = create<authStore>((set, get) => ({
  user: null,
    email: null,
    isEmailValid: false,
    otpCode: null,
    isOtpValid: false,
    verifyOtp: (code: string) => {},
    setUser: (user: Tables<'users'> | null) => set({ user }),
    setEmail: (email: string) => set({ email }),
    setOtpCode: (code: string) => set({ otpCode: code }),
    setIsEmailValid: (isValid: boolean) => set({ isEmailValid: isValid }),
    setIsOtpValid: (isValid: boolean) => set({ isOtpValid: isValid })
}));