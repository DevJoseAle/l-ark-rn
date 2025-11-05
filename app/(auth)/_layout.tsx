import { Stack } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Stack.Screen
        name="(tabs)"
        options={{
          title: '',
        }}
      />
      <Stack.Screen
        name="campaign"
        options={{
          title: '',
        }}
      />
      <Stack.Screen
        name="kyc"
        options={{
          title: 'Explore',
        }}
      />
    </Stack>
  );
}
