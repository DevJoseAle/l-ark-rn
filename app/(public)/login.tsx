// app/(public)/login.tsx
import CheckBox from '@/src/components/common/CheckBox';
import { GradientBackground } from '@/src/components/common/GradiendBackground';
import { LarkLogo } from '@/src/components/common/LarkLogo';
import TermsModal from '@/src/components/common/TermsModal';
import { useLogin } from '@/src/features/auth/hooks/useLogin';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const {
    email,
    setEmail,
    isChecked,
    setIsChecked,
    handleContinue,
    isFormValid,
    styles,
    colors,
    showTermsModal,
    handleAcceptTerms,
    handleDeclineTerms,
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
        <CheckBox
          setFn={() => setIsChecked(!isChecked)}
          isValid={isChecked}
          text="Entiendo que, si no existe una cuenta con este correo, se registrará una nueva"
        />

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
      <TermsModal
        visible={showTermsModal}
        onAccept={handleAcceptTerms}
        onDecline={handleDeclineTerms}
      />
    </GradientBackground>
  );
}
