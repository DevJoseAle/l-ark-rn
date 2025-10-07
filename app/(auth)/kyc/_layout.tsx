import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkNavigationTheme, LightNavigationTheme } from '@/hooks/use-theme-color';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function KycLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkNavigationTheme : LightNavigationTheme}>
      <Stack>
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="documents" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false  }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
