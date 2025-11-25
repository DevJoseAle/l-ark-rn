// app/(public)/welcome.tsx - VERSIÓN CORREGIDA PARA ANDROID

import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Animated,
  Platform,
  ColorSchemeName,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { GradientBackground } from '@/src/components/common/GradiendBackground';
import { LarkLogo } from '@/src/components/common/LarkLogo';
import { useThemeColors } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';

// ============================================
// COLORS CONFIGURATION
// ============================================
const getAdaptiveColors = (colorScheme: ColorSchemeName) => ({
  text: colorScheme === 'dark' ? '#FFFFFF' : '#1F2937',
  secondaryText: colorScheme === 'dark' ? '#9CA3AF' : '#6B7280',
  cardBg: colorScheme === 'dark' ? '#1F2937' : '#FFFFFF',
  cardBorder: colorScheme === 'dark' ? '#374151' : '#E5E7EB',
  buttonBg: colorScheme === 'dark' ? '#3B82F6' : '#007AFF',
  buttonBorder: colorScheme === 'dark' ? '#60A5FA' : '#0051D5',
});

// ============================================
// MAIN COMPONENT
// ============================================
export default function WelcomeScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const colorScheme = useColorScheme();
  const adaptiveColors = getAdaptiveColors(colorScheme);

  // Animated values
  const logoTranslateY = useRef(new Animated.Value(-30)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const cardsTranslateY = useRef(new Animated.Value(50)).current;
  const cardsOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(200, [
      // Logo
      Animated.parallel([
        Animated.spring(logoTranslateY, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      
      // Cards
      Animated.parallel([
        Animated.spring(cardsTranslateY, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(cardsOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        {/* Header con Logo */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: logoOpacity,
              transform: [{ translateY: logoTranslateY }],
            },
          ]}
        >
          <LarkLogo size={120} />
          <View style={styles.headerText}>
            <Text style={[styles.appName, { color: colors.text }]}>
              L-Ark
            </Text>
            <Text style={[styles.appSubtitle, { color: colors.secondaryText }]}>
              Digital Heritage
            </Text>
          </View>
        </Animated.View>

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* Cards de Acción */}
        <Animated.View
          style={[
            styles.cardsContainer,
            {
              opacity: cardsOpacity,
              transform: [{ translateY: cardsTranslateY }],
            },
          ]}
        >
          {/* Feature Cards */}
          <View style={styles.featuresContainer}>
            <FeatureCard
              icon="🔐"
              title="Seguro"
              description="Encriptación de nivel bancario"
              colors={adaptiveColors}
              colorScheme={colorScheme}
            />
            <FeatureCard
              icon="🌍"
              title="Global"
              description="Disponible en 4 países"
              colors={adaptiveColors}
              colorScheme={colorScheme}
            />
            <FeatureCard
              icon="⚡"
              title="Rápido"
              description="Activación automática"
              colors={adaptiveColors}
              colorScheme={colorScheme}
            />
          </View>

          {/* CTA Section */}
          <View style={styles.ctaSection}>
            <Text style={[styles.ctaTitle, { color: colors.text }]}>
              Protege tu legado hoy
            </Text>
            <Text style={[styles.ctaDescription, { color: colors.secondaryText }]}>
              Únete a miles de usuarios que confían en L-Ark
            </Text>

            {/* Botones */}
            <GlassButton
              onPress={() => router.push('/(public)/login')}
              colors={adaptiveColors}
              colorScheme={colorScheme}
              primary
            >
              Comenzar Ahora
            </GlassButton>

            <GlassButton
              onPress={() => router.push('/(public)/login')}
              colors={adaptiveColors}
              colorScheme={colorScheme}
            >
              Ya tengo cuenta
            </GlassButton>
          </View>
        </Animated.View>
      </SafeAreaView>
    </GradientBackground>
  );
}

// ============================================
// COMPONENTE: Feature Card - FIX ANDROID
// ============================================
interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  colors: any;
  colorScheme: ColorSchemeName;
}

function FeatureCard({ icon, title, description, colors, colorScheme }: FeatureCardProps) {
  return (
    <View
      style={[
        styles.featureCard,
        {
          // ✅ FIX: Usar color sólido en lugar de rgba para Android
          backgroundColor: colors.cardBg,
          borderColor: colors.cardBorder,
          borderWidth: 1,
          
          // Shadow para iOS y elevation para Android
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
            },
            android: {
              elevation: 3,
            },
          }),
        },
      ]}
    >
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={[styles.featureTitle, { color: colors.text }]}>
        {title}
      </Text>
      <Text style={[styles.featureDescription, { color: colors.secondaryText }]}>
        {description}
      </Text>
    </View>
  );
}

// ============================================
// COMPONENTE: Glass Button - FIX ANDROID
// ============================================
interface GlassButtonProps {
  onPress: () => void;
  colors: any;
  colorScheme: ColorSchemeName;
  children: React.ReactNode;
  primary?: boolean;
}

function GlassButton({ 
  onPress, 
  colors, 
  colorScheme, 
  children, 
  primary = false 
}: GlassButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.glassButton,
        {
          // ✅ FIX: Usar colores sólidos con mejor contraste
          backgroundColor: primary ? colors.buttonBg : colors.cardBg,
          borderColor: primary ? colors.buttonBorder : colors.buttonBorder,
          borderWidth: 1,
          
          // Shadow para iOS y elevation para Android
          ...Platform.select({
            ios: {
              shadowColor: primary ? colors.buttonBg : '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: primary ? 0.3 : 0.1,
              shadowRadius: 8,
            },
            android: {
              elevation: primary ? 4 : 2,
            },
          }),
        },
      ]}
    >
      <Text
        style={[
          styles.glassButtonText,
          {
            color: primary ? '#FFFFFF' : colors.buttonBg,
            fontWeight: '600',
          },
        ]}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );
}

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Header
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 24,
  },
  headerText: {
    alignItems: 'center',
    marginTop: 20,
  },
  appName: {
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: -1,
  },
  appSubtitle: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: 4,
    letterSpacing: 0.5,
    fontStyle: 'italic',
  },
  
  // Cards Container
  cardsContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  
  // Features
  featuresContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  featureCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    minHeight: 140,
    justifyContent: 'center',
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  
  // CTA Section
  ctaSection: {
    gap: 12,
  },
  ctaTitle: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  ctaDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
  },
  
  // Glass Button
  glassButton: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  glassButtonText: {
    fontSize: 17,
  },
});