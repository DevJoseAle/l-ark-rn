// app/(public)/otp.tsx
import { View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import React, { useRef } from 'react';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useThemeColors } from '@/hooks/use-theme-color';
import { GradientBackground } from '@/src/components/common/GradiendBackground';
import { LarkLogo } from '@/src/components/common/LarkLogo';
import { createOTPStyles } from '@/src/features/auth/styles/otpStyles';
import { useOTPForm } from '@/src/features/auth/hooks/useLogin';

export default function OTPScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const styles = createOTPStyles(colors);
  const {
    otp,
    setOtp,
    isCodeComplete,
    code,
    handleConfirm,
    handleResend,
    handleKeyPress,
    handleOtpChange,
    inputRefs,
  } = useOTPForm(6, router);

  return (
    <GradientBackground>
      <View style={styles.container}>
        {/* Header con botón atrás */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
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

        {/* Subtítulo */}
        <Text style={styles.description}>Ingresa el código para crear tu cuenta</Text>

        {/* Input de OTP (6 dígitos) */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              style={[styles.otpInput, digit && styles.otpInputFilled]}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              autoFocus={index === 0}
            />
          ))}
        </View>

        {/* Texto descriptivo del input */}
        <Text style={styles.inputLabel}>Ingresa Código de 6 dígitos</Text>

        {/* Botón confirmar */}
        <TouchableOpacity
          style={[styles.confirmButton, !isCodeComplete && styles.confirmButtonDisabled]}
          onPress={handleConfirm}
          disabled={!isCodeComplete}
          activeOpacity={0.8}
        >
          <Text
            style={[styles.confirmButtonText, !isCodeComplete && styles.confirmButtonTextDisabled]}
          >
            Confirmar código
          </Text>
        </TouchableOpacity>

        {/* Link reenviar */}
        <TouchableOpacity style={styles.resendContainer} onPress={handleResend} activeOpacity={0.7}>
          <Text style={styles.resendText}>Reenviar</Text>
        </TouchableOpacity>
      </View>
    </GradientBackground>
  );
}
