// app/(public)/login.tsx
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/hooks/use-theme-color';
import { createLoginStyles } from '@/src/features/auth/styles/loginStyles';
import { useLoadingStore } from '@/src/stores/LoadingStore';
import { LarkLogo } from '@/src/components/common/LarkLogo';
import { GradientBackground } from '@/src/components/common/GradiendBackground';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLogin } from '@/src/features/auth/hooks/useLogin';

export default function LoginScreen() {
  const router = useRouter();
  const  {
        email,
        setEmail,
        isChecked,
        setIsChecked,
        handleContinue,
        isFormValid,
        styles,
        colors
      } = useLogin(router);


  return (
    <GradientBackground>
      <View style={styles.container}>
        {/* Header con botón atrás */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
          <Text style={styles.backText}>Atrás</Text>
        </TouchableOpacity>

        {/* Logo y título */}
        <View style={styles.logoContainer}>
          <LarkLogo size={100} />
          <Text style={styles.title}>L-Ark</Text>
          <Text style={styles.subtitle}>Digital Heritage</Text>
        </View>

        {/* Título de sección */}
        <Text style={styles.heading}>Ingresar</Text>

        {/* Input de email */}
        <View style={styles.inputContainer}>
          <Ionicons 
            name="mail-outline" 
            size={20} 
            color={colors.secondaryText} 
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={colors.secondaryText}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Checkbox */}
        <TouchableOpacity 
          style={styles.checkboxContainer}
          onPress={() => setIsChecked(!isChecked)}
          activeOpacity={0.7}
        >
          <View style={[
            styles.checkbox,
            isChecked && styles.checkboxChecked
          ]}>
            {isChecked && (
              <Ionicons name="checkmark" size={16} color={colors.invertedText} />
            )}
          </View>
          <Text style={styles.checkboxText}>
            Entiendo que, si no existe una cuenta con este correo, se registrará una nueva
          </Text>
        </TouchableOpacity>

        {/* Botón continuar */}
        <TouchableOpacity
          style={[
            styles.continueButton,
            !isFormValid && styles.continueButtonDisabled
          ]}
          onPress={handleContinue}
          disabled={!isFormValid}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.continueButtonText,
            !isFormValid && styles.continueButtonTextDisabled
          ]}>
            Continuar
          </Text>
        </TouchableOpacity>
      </View>
    </GradientBackground>
  );
}