import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#FFF',
        },
        headerTintColor: '#1F2937',
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
        },
        headerShadowVisible: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Perfil',
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="edit"
        options={{
          title: 'Editar Perfil',
          presentation: 'modal',
          headerShown: false, // Usamos header custom en la pantalla
        }}
      />

      <Stack.Screen
        name="kyc-details"
        options={{
          title: 'Verificación KYC',
        }}
      />

      <Stack.Screen
        name="connect-details"
        options={{
          title: 'Stripe Connect',
        }}
      />
    </Stack>
  );
}
