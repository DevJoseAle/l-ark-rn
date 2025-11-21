// src/components/common/SplashScreen.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { GradientBackground } from './GradiendBackground';
import { LarkLogo } from './LarkLogo';
import { useThemeColors } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface SplashScreenProps {
  onAnimationComplete?: () => void;
}

export function SplashScreen({ onAnimationComplete }: SplashScreenProps) {
  const colors = useThemeColors();
  const colorScheme = useColorScheme();

  // Animated values
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Secuencia de animaciones
    Animated.sequence([
      // 1. Logo fade in + scale
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),

      // 2. Text fade in
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),

      // 3. Pequeña pausa antes de completar
      Animated.delay(500),
    ]).start(() => {
      // Callback cuando termina la animación
      if (onAnimationComplete) {
        setTimeout(onAnimationComplete, 200);
      }
    });
  }, []);

  return (
    <GradientBackground>
      <View style={styles.container}>
        {/* Logo animado */}
        <Animated.View
          style={{
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          }}
        >
          <LarkLogo size={200} />
        </Animated.View>

        {/* Texto animado */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: textOpacity,
            },
          ]}
        >
          <Text style={[styles.title, { color: colors.text }]}>L-Ark</Text>
          <Text style={[styles.subtitle, { color: colors.secondaryText }]}>Digital Heritage</Text>
        </Animated.View>

        {/* Shimmer/loading indicator minimalista */}
        <Animated.View
          style={[
            styles.loadingContainer,
            {
              opacity: textOpacity,
            },
          ]}
        >
          <View style={styles.dotsContainer}>
            <AnimatedDot delay={0} color={colors.primary} />
            <AnimatedDot delay={200} color={colors.primary} />
            <AnimatedDot delay={400} color={colors.primary} />
          </View>
        </Animated.View>
      </View>
    </GradientBackground>
  );
}

// Componente para los dots animados
function AnimatedDot({ delay, color }: { delay: number; color: string }) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          opacity,
          backgroundColor: color,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  textContainer: {
    marginTop: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 56,
    fontWeight: '600',
    letterSpacing: -1,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '400',
    fontStyle: 'italic',
    letterSpacing: 0.5,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 100,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
