import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const isLoading = false;
  const isAuthenticated = false;

  // Si todavía está cargando el estado de auth
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