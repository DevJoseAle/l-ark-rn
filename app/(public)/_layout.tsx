import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkNavigationTheme, LightNavigationTheme } from '@/hooks/use-theme-color';
import { GlobalLoadingProvider } from '@/src/Providers/GlobalLoadingProvider';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function PublicLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkNavigationTheme : LightNavigationTheme} >
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="welcome" options={{ headerShown: false  }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="otp" options={{ headerShown: false }} />
      </Stack>
      
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
