import { useEffect, useState } from 'react';
import { Redirect, useNavigation } from 'expo-router';
import { useAuthStore } from '@/src/stores/authStore';
import { useShallow } from 'zustand/react/shallow';
import { SplashScreen } from '@/src/components/common/SplashScreen';

export default function Index() {
  const [animationComplete, setAnimationComplete] = useState(false);
  
  const { user, isAuthenticated, isLoading, initialize } = useAuthStore(
    useShallow(state => ({
      user: state.user,
      isAuthenticated: state.isAuthenticated,
      isLoading: state.isLoading,
      initialize: state.initialize,
    }))
  );
  const navigation = useNavigation();
  useEffect(() => {
    initialize();
    navigation.setOptions({ headerShown: false });
  }, []);

  // Mostrar splash mientras carga O mientras la animación no termina
  if (isLoading || !animationComplete) {
    return (
      <SplashScreen 
        onAnimationComplete={() => setAnimationComplete(true)}
      />
    );
  }

  // Redirige según estado de autenticación
  if (isAuthenticated) {
    return <Redirect href="/(auth)/(tabs)/arkHome" />;
  }

  return <Redirect href="/(public)/welcome" />;
}