// app/(auth)/kyc/intro.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { GradientBackground } from '@/src/components/common/GradiendBackground';
import { useRouter } from 'expo-router';

export default function KYCIntroScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const steps = [
    {
      icon: 'card-outline' as const,
      title: 'Cédula de identidad - Frontal',
      description: 'Foto clara del frente de tu cédula',
    },
    {
      icon: 'card-outline' as const,
      title: 'Cédula de identidad - Reverso',
      description: 'Foto clara del reverso de tu cédula',
    },
    {
      icon: 'person-circle-outline' as const,
      title: 'Selfie',
      description: 'Una foto tuya para verificar tu identidad',
    },
  ];

  return (
    <GradientBackground>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      <View style={styles.container}>
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
          <Ionicons name="shield-checkmark" size={80} color={colors.primary} />
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.text }]}>Verificación de identidad</Text>

        {/* Subtitle */}
        <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
          Para crear campañas necesitamos verificar tu identidad
        </Text>

        {/* Steps */}
        <View style={styles.stepsContainer}>
          {steps.map((step, index) => (
            <View
              key={index}
              style={[
                styles.stepCard,
                {
                  backgroundColor:
                    colorScheme === 'dark' ? 'rgba(30, 42, 54, 0.7)' : 'rgba(251, 252, 251, 0.7)',
                  borderColor:
                    colorScheme === 'dark' ? 'rgba(42, 63, 84, 0.5)' : 'rgba(172, 202, 231, 0.3)',
                },
              ]}
            >
              <View style={[styles.stepIcon, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name={step.icon} size={24} color={colors.primary} />
              </View>
              <View style={styles.stepContent}>
                <Text style={[styles.stepTitle, { color: colors.text }]}>{step.title}</Text>
                <Text style={[styles.stepDescription, { color: colors.secondaryText }]}>
                  {step.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* Buttons */}
        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/(auth)/kyc/documents')}
          >
            <Text style={[styles.buttonText, { color: colors.customWhite }]}>Continuar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.buttonOutline, { borderColor: colors.primary }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.buttonOutlineText, { color: colors.primary }]}>Regresar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  stepsContainer: {
    gap: 16,
  },
  stepCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 16,
  },
  stepIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepContent: {
    flex: 1,
    justifyContent: 'center',
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  buttons: {
    gap: 12,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '700',
  },
  buttonOutline: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
  },
  buttonOutlineText: {
    fontSize: 17,
    fontWeight: '600',
  },
});
