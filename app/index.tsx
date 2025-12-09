import { useEffect, useState } from 'react';
import { Redirect, useNavigation } from 'expo-router';
import { useAuthStore } from '@/src/stores/authStore';
import { useShallow } from 'zustand/react/shallow';
import { SplashScreen } from '@/src/components/common/SplashScreen';
import '../src/i18'; // Importar configuración

export default function Index() {
  const [animationComplete, setAnimationComplete] = useState(false);
    const [isI18nInitialized, setIsI18nInitialized] = useState(false);

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
  useEffect(() => {
      // i18next se inicializa automáticamente
      // Este timeout es para asegurar que cargó
      const timer = setTimeout(() => {
        setIsI18nInitialized(true);
      }, 100);

      return () => clearTimeout(timer);
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