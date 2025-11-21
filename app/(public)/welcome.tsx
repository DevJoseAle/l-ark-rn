import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Platform,
  ColorSchemeName,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientBackground } from '@/src/components/common/GradiendBackground';
import { LarkLogo } from '@/src/components/common/LarkLogo';
import { useThemeColors } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function WelcomeScreenAlt() {
  const router = useRouter();
  const colors = useThemeColors();
  const colorScheme = useColorScheme();

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
            <Text style={[styles.appName, { color: colors.text }]}>L-Ark</Text>
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
              colors={colors}
              colorScheme={colorScheme}
            />
            <FeatureCard
              icon="🌍"
              title="Global"
              description="Disponible en 4 países"
              colors={colors}
              colorScheme={colorScheme}
            />
            <FeatureCard
              icon="⚡"
              title="Rápido"
              description="Activación automática"
              colors={colors}
              colorScheme={colorScheme}
            />
          </View>

          {/* Call to Action */}
          <View style={styles.ctaContainer}>
            <Text style={[styles.ctaTitle, { color: colors.text }]}>Protege tu legado hoy</Text>
            <Text style={[styles.ctaDescription, { color: colors.secondaryText }]}>
              Únete a miles de usuarios que confían en L-Ark
            </Text>

            {/* Botones */}
            <GlassButton
              onPress={() => router.push('/(public)/login')}
              colors={colors}
              colorScheme={colorScheme}
              primary
            >
              Comenzar Ahora
            </GlassButton>

            <GlassButton
              onPress={() => router.push('/(public)/login')}
              colors={colors}
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
// COMPONENTE: Feature Card
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
          backgroundColor:
            colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.6)',
          borderColor:
            colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.8)',
        },
      ]}
    >
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={[styles.featureTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.featureDescription, { color: colors.secondaryText }]}>
        {description}
      </Text>
    </View>
  );
}

// ============================================
// COMPONENTE: Glass Button
// ============================================
interface GlassButtonProps {
  onPress: () => void;
  colors: any;
  colorScheme: ColorSchemeName;
  children: React.ReactNode;
  primary?: boolean;
}

function GlassButton({ onPress, colors, colorScheme, children, primary }: GlassButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 0.97,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  if (primary) {
    return (
      <Animated.View
        style={[
          styles.glassButtonWrapper,
          {
            transform: [{ scale }],
            opacity,
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={onPress}
        >
          <LinearGradient
            colors={colorScheme === 'dark' ? ['#4BA3D9', '#3A8FC7'] : ['#5CB0E0', '#4BA3D9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.primaryGlassButton}
          >
            <Text style={styles.primaryGlassButtonText}>{children}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.glassButtonWrapper,
        {
          transform: [{ scale }],
          opacity,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
      >
        <View
          style={[
            styles.secondaryGlassButton,
            {
              backgroundColor:
                colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.4)',
              borderColor:
                colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.6)',
            },
          ]}
        >
          <Text style={[styles.secondaryGlassButtonText, { color: colors.text }]}>{children}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    paddingTop: 40,
    alignItems: 'center',
  },
  headerText: {
    marginTop: 16,
    alignItems: 'center',
  },
  appName: {
    fontSize: 48,
    fontWeight: '700',
    letterSpacing: -1,
  },
  appSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    fontStyle: 'italic',
    marginTop: 4,
  },
  cardsContainer: {
    paddingBottom: 40,
  },
  featuresContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  featureCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 14,
  },
  ctaContainer: {
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  ctaDescription: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
  },
  glassButtonWrapper: {
    width: '100%',
    marginBottom: 12,
  },
  primaryGlassButton: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#4BA3D9',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  primaryGlassButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  secondaryGlassButton: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  secondaryGlassButtonText: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
