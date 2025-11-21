// src/hooks/useThemeColors.ts
import { Colors } from '@/constants/theme';
import { DarkTheme, DefaultTheme, Theme } from '@react-navigation/native';

import { useColorScheme } from 'react-native';

export function useThemeColors() {
  const colorScheme = useColorScheme();
  return Colors[colorScheme ?? 'light'];
}

export const LightNavigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.light.primary,
    background: Colors.light.background,
    card: Colors.light.cardBackground,
    text: Colors.light.text,
    border: Colors.light.border,
    notification: Colors.light.primary,
  },
};

export const DarkNavigationTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.dark.primary,
    background: Colors.dark.background,
    card: Colors.dark.cardBackground,
    text: Colors.dark.text,
    border: Colors.dark.border,
    notification: Colors.dark.primary,
  },
};
