import { ReactNode } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Versión extendida con props opcionales
interface GradientBackgroundProps {
  children: ReactNode;
  locations?: [number, number, ...number[]]; // Personalizar posiciones, mínimo dos elementos
  forceLight?: boolean; // Forzar modo claro
  forceDark?: boolean; // Forzar modo oscuro
}

export function GradientBackground({
  children,
  locations = [0, 0.5, 1],
  forceLight,
  forceDark,
}: GradientBackgroundProps) {
  const colorScheme = useColorScheme();

  let isDark = colorScheme === 'dark';
  if (forceLight) isDark = false;
  if (forceDark) isDark = true;

  const colors: [string, string, ...string[]] = isDark
    ? ['#1E2A36', '#223344', '#0D1B2A']
    : ['#F8FBFF', '#D6E4F5', '#ACCAE7'];

  return (
    <LinearGradient colors={colors} locations={locations} style={{ flex: 1 }}>
      {children}
    </LinearGradient>
  );
}
