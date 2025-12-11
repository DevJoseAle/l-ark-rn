// app/(public)/login.tsx
import CheckBox from '@/src/components/common/CheckBox';
import { GradientBackground } from '@/src/components/common/GradiendBackground';
import { LarkLogo } from '@/src/components/common/LarkLogo';
import TermsModal from '@/src/components/common/TermsModal';
import { useLogin } from '@/src/features/auth/hooks/useLogin';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

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
    translate
  } = useLogin(router);

  const OS = Platform.OS
  return (
    <GradientBackground>
    <>
    
      <KeyboardAvoidingView
        behavior={OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={OS === 'ios' ? 10 : 20}
      >
        <ScrollView>

          <View style={styles.container} >
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
            <Text style={styles.heading}>{translate("public.login.title")}</Text>

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
                placeholder={translate("public.login.inputPlaceholder")}
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
              text={translate("public.login.checkbox")}
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
                {translate("public.login.continueButton")}
              </Text>
            </TouchableOpacity>
          </View>
          <TermsModal
            visible={showTermsModal}
            onAccept={handleAcceptTerms}
            onDecline={handleDeclineTerms}
          />
        </ScrollView>
      </KeyboardAvoidingView>
      </>
    </GradientBackground>
  );
}