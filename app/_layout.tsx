import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { queryClient } from '@/src/lib/queryClient';
import { useColorScheme } from 'react-native';
import { DarkNavigationTheme, LightNavigationTheme } from '@/hooks/use-theme-color';
import { GlobalLoadingProvider } from '@/src/Providers/GlobalLoadingProvider';
import { useDeepLinking } from '@/src/features/home/useDeepLinking';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useEffect } from 'react';
import * as ScreenOrientation from 'expo-screen-orientation';


export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  useDeepLinking();
    useEffect(() => {
    async function lockOrientation() {
      try {
        // Bloquear a portrait vertical
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.PORTRAIT_UP
        );
        console.log('✅ Orientación bloqueada a Portrait');
      } catch (error) {
        console.error('❌ Error bloqueando orientación:', error);
      }
    }

    lockOrientation();

    // Cleanup: desbloquear cuando el componente se desmonte
    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
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
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
