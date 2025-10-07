// app/(public)/otp.tsx
import { View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import React, { useState, useRef } from 'react';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useThemeColors } from '@/hooks/use-theme-color';
import { GradientBackground } from '@/src/components/common/GradiendBackground';
import { LarkLogo } from '@/src/components/common/LarkLogo';
import { createOTPStyles } from '@/src/features/auth/styles/otpStyles';
import { useLoadingStore } from '@/src/stores/LoadingStore';


export default function OTPScreen() {

  
  const colors = useThemeColors();
  const styles = createOTPStyles(colors);
  const { showLoading, hideLoading } = useLoadingStore();
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const handleOtpChange = (value: string, index: number) => {
    // Solo permite números
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus al siguiente input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Retroceso: borra y vuelve al anterior
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleConfirm = async () => {
    const code = otp.join('');
    
    if (code.length !== 6) {
      Alert.alert('Error', 'Por favor ingresa el código completo');
      return;
    }

    showLoading('Verificando código...');
    try {
      // Lógica de verificación
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('✅ Código verificado:', code);
      
      // Navegar a pantalla principal
      router.replace('/(auth)/(tabs)/arkHome');
    } catch (error) {
      console.error('❌ Error:', error);
      Alert.alert('Error', 'Código inválido');
      hideLoading();
    }
  };

  const handleResend = async () => {
    showLoading('Reenviando código...');
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      Alert.alert('Éxito', 'Código reenviado');
      setOtp(['', '', '', '', '', '']); // Limpia el input
      inputRefs.current[0]?.focus();
    } catch (error) {
      Alert.alert('Error', 'No se pudo reenviar el código');
    } finally {
      hideLoading();
    }
  };

  const isCodeComplete = otp.every(digit => digit !== '');

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

        {/* Subtítulo */}
        <Text style={styles.description}>
          Ingresa el código para crear tu cuenta
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
        <Text style={styles.inputLabel}>Ingresa Código de 6 dígitos</Text>

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
            Confirmar código
          </Text>
        </TouchableOpacity>

        {/* Link reenviar */}
        <TouchableOpacity
          style={styles.resendContainer}
          onPress={handleResend}
          activeOpacity={0.7}
        >
          <Text style={styles.resendText}>Reenviar</Text>
        </TouchableOpacity>
      </View>
    </GradientBackground>
  );
}