// src/stores/authStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../features/auth/service/auth.service';

interface User {
  id: string;
  email: string;
  display_name?: string;
}

interface AuthStore {
  // ✅ Solo estado PERSISTENTE y GLOBAL
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  email: string;
  
  // Acciones
  setUser: (user: User | null) => void;
  setEmail: (email: string) => void;
  initialize: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      email: '',
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user 
      }),
      setEmail: (email: string) => set({email}),
     initialize: async () => {
        console.log('🔵 Inicializando auth...');
        set({ isLoading: true });
        
        try {
          // Supabase recupera la sesión de AsyncStorage automáticamente
          const response = await authService.getSession();
          
          if (response.success && response.data) {
            const session = response.data;
            console.log('✅ Sesión encontrada:', session.user.email);
            
            set({ 
              user: {
                id: session.user.id,
                email: session.user.email!,
                display_name: session.user.user_metadata?.display_name,
              },
              isAuthenticated: true,
              isLoading: false,
            });

            // ✅ Listener para cambios en auth
            authService.onAuthStateChange((session) => {
              if (session?.user) {
                console.log('🔄 Auth state cambió:', session.user.email);
                get().setUser({
                  id: session.user.id,
                  email: session.user.email!,
                });
              } else {
                console.log('🔄 Auth state cambió: logout');
                get().setUser(null);
              }
            });
          } else {
            console.log('❌ No hay sesión activa');
            set({ isLoading: false });
          }
        } catch (error) {
          console.error('❌ Error inicializando auth:', error);
          set({ isLoading: false });
        }
      },

      logout: async () => {
        await authService.signOut();
        set({ 
          user: null, 
          isAuthenticated: false 
        });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);