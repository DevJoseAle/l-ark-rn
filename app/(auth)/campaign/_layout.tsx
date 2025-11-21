import { Stack } from 'expo-router';

export default function CampaignLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: false,
          title: 'Detalle de Campaña',
        }}
      />
      <Stack.Screen
        name="campaignDetail"
        options={{
          headerShown: false,
          title: 'Campaña',
        }}
      />
      <Stack.Screen
        name="createCampaign"
        options={{
          headerShown: false,
          title: 'Crear Campaña',
        }}
      />
    </Stack>
  );
}
