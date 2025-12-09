// app/(public)/otp.tsx
import { useThemeColors } from '@/hooks/use-theme-color';
import { GradientBackground } from '@/src/components/common/GradiendBackground';
import { LarkLogo } from '@/src/components/common/LarkLogo';
import { useOTPForm } from '@/src/features/auth/hooks/useLogin';
import { createOTPStyles } from '@/src/features/auth/styles/otpStyles';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

const OS = Platform.OS

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
    translate,
    inputRefs } = useOTPForm(6, router);

  return (
    <GradientBackground>
      <KeyboardAvoidingView
        behavior={OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={OS === 'ios' ? 10 : 20}
      >
        <ScrollView>
          <View style={styles.container}>
            {/* Header con botón atrás */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={24} color={colors.primary} />
              <Text style={styles.backText}>{translate("common.backButton")}</Text>
            </TouchableOpacity>

            {/* Logo y título */}
            <View style={styles.logoContainer}>
              <LarkLogo size={100} />
              <Text style={styles.title}>L-Ark</Text>
              <Text style={styles.subtitle}>Digital Heritage</Text>
            </View>

            {/* Título de sección */}
            <Text style={styles.heading}>{translate("public.otp.title")}</Text>

            {/* Subtítulo */}
            <Text style={styles.description}>
              {translate("public.otp.subtitle")}
            </Text>

            {/* Input de OTP (6 dígitos) */}
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={ref => { inputRefs.current[index] = ref; }}
                  style={[
                    styles.otpInput,
                    digit && styles.otpInputFilled
                  ]}
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
            <Text style={styles.inputLabel}>{translate("public.otp.enterCode")}</Text>

            {/* Botón confirmar */}
            <TouchableOpacity
              style={[
                styles.confirmButton,
                !isCodeComplete && styles.confirmButtonDisabled
              ]}
              onPress={handleConfirm}
              disabled={!isCodeComplete}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.confirmButtonText,
                !isCodeComplete && styles.confirmButtonTextDisabled
              ]}>
                {translate("public.otp.confirmCodeButton")}
              </Text>
            </TouchableOpacity>

            {/* Link reenviar */}
            <TouchableOpacity
              style={styles.resendContainer}
              onPress={handleResend}
              activeOpacity={0.7}
            >
              <Text style={styles.resendText}>{translate("public.otp.resendCode")}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}