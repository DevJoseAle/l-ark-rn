import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { QueryClientProvider } from '@tanstack/react-query';

import { queryClient } from '@/src/lib/queryClient';
import { useColorScheme } from 'react-native';
import { DarkNavigationTheme, LightNavigationTheme } from '@/hooks/use-theme-color';
import { GlobalLoadingProvider } from '@/src/Providers/GlobalLoadingProvider';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkNavigationTheme : LightNavigationTheme}>
        <Stack>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(public)" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
        <GlobalLoadingProvider />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
