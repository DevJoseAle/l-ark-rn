import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/src/stores/authStore';
import { useShallow } from 'zustand/react/shallow';
import { useHomeData } from '@/src/features/home/useHomeData';


export default function Index() {

  const { user, isAuthenticated, isLoading, initialize } = useAuthStore(
    useShallow(state => ({
      user: state.user,
      isAuthenticated: state.isAuthenticated,
      isLoading: state.isLoading,
      initialize: state.initialize,
    }))
  );
  const {loadData} = useHomeData();
useEffect(() => {
    initialize();
  }, []);

  console.log('Index - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated, 'user:', user?.email);  // Si todavía está cargando el estado de auth
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Redirige según estado de autenticación
  if (isAuthenticated) {
    return <Redirect href="/(auth)/(tabs)/arkHome" />;
  }

  return <Redirect href="/(public)/welcome" />;
}