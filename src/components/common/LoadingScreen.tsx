// src/components/ui/LoadingScreen.tsx
import { View, Text, ActivityIndicator } from 'react-native';
import { LarkLogo } from './LarkLogo';
import { loadingStyles } from '@/src/features/public/styles/publicStyles';
import { useThemeColors } from '@/hooks/use-theme-color';
import { GradientBackground } from './GradiendBackground';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = 'Cargando...' }: LoadingScreenProps) {
  const styles = loadingStyles;
  const colors = useThemeColors();

  return (
    <GradientBackground>
      <View style={styles.container}>
        <LarkLogo size={120} />

        <Text style={[styles.title, { color: colors.text }]}>L-Ark</Text>

        <Text style={[styles.subtitle, { color: colors.secondaryText }]}>Digital Heritage</Text>

        <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />

        <Text style={[styles.message, { color: colors.secondaryText }]}>{message}</Text>
      </View>
    </GradientBackground>
  );
}
