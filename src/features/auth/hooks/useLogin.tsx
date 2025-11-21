import { CURRENT_TERMS_VERSION } from "@/constants/Constants";
import { useThemeColors } from "@/hooks/use-theme-color";
import { supabase } from "@/src/lib/supabaseClient";
import { isValidOTPArray } from "@/src/lib/validators";
import { useAuthStore } from "@/src/stores/authStore";
import { useLoadingStore } from "@/src/stores/LoadingStore";
import { Router } from "expo-router";
import { useMemo, useRef, useState } from "react";
import { Alert, TextInput } from "react-native";
import { authService } from "../service/auth.service";
import { createLoginStyles } from "../styles/loginStyles";

export const useLogin = (router: any) => {
  const colors = useThemeColors();
  const styles = createLoginStyles(colors);
  const { showLoading, hideLoading } = useLoadingStore();
  const { setEmail: setEmailStore } = useAuthStore();

  const [email, setEmail] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');

  const isFormValid = email.length > 0 && isChecked && /\S+@\S+\.\S+/.test(email);

  const handleContinue = async () => {
    if (!isFormValid) return;

    showLoading('Verificando...');

    try {
      const cleanEmail = email.toLowerCase().trim();

      // 1. Verificar si el usuario existe
      const { data: existingUser, error } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      hideLoading();

      if (existingUser) {
        // Usuario existe → Verificar si aceptó la versión actual
        const { data: acceptance, error: accError } = await supabase
          .from('user_terms_acceptances')
          .select('id')
          .eq('user_id', existingUser.id)
          .eq('terms_version', CURRENT_TERMS_VERSION)
        if (accError) {
        }

        if (acceptance) {
          // Ya aceptó términos actuales → Enviar OTP
await sendOTP(cleanEmail);
        } else {
          // Debe aceptar nueva versión
          setPendingEmail(cleanEmail);
          setShowTermsModal(true);
        }
      } else {
        // Usuario nuevo → Mostrar modal de T&C
        setPendingEmail(cleanEmail);
        setShowTermsModal(true);
      }
    } catch (error: any) {
      hideLoading();
      console.error('Error verificando usuario:', error);
      Alert.alert('Error', 'Hubo un problema. Intenta nuevamente.');
    }
  };

  const sendOTP = async (emailToSend: string) => {
    setEmailStore(emailToSend);
    showLoading('Enviando código...');

    const response = await authService.loginSendOTP(emailToSend);

    if (response.success) {
      router.push({
        pathname: '/(public)/otp',
        params: { email: emailToSend }
      });
      hideLoading();
    } else {
      Alert.alert('Error', response.message);
      hideLoading();
    }
  };

  const handleAcceptTerms = async () => {
    setShowTermsModal(false);
    // El registro de aceptación se hará después de verificar OTP
    await sendOTP(pendingEmail);
  };

  const handleDeclineTerms = () => {
    setShowTermsModal(false);
    setPendingEmail('');
    Alert.alert(
      'Términos requeridos',
      'Debes aceptar los Términos y Condiciones para usar L-ark.'
    );
  };

  return {
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
  };
};
// src/features/auth/hooks/useAuthForm.ts

export function useOTPForm(length: number = 6, router: Router) {
  const { showLoading, hideLoading } = useLoadingStore();
  const { email } = useAuthStore();
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const isCodeComplete = useMemo(() => {
    return isValidOTPArray(otp);
  }, [otp]);
  const handleConfirm = async () => {
    const code = otp.join('');

    if (code.length !== 6) {
      Alert.alert('Error', 'Por favor ingresa el código completo');
      return;
    }

    showLoading('Verificando código...');
    try {
      // Lógica de verificación
      const response = await authService.verifyOTP(email, code);
router.replace('/(auth)/(tabs)/arkHome');
      hideLoading();
      Alert.alert('Éxito', 'Código verificado exitosamente');
    } catch (error) {
      console.error('❌ Error:', error);
      Alert.alert('Error', 'Código inválido');
      hideLoading();
    }
  };

  const handleResend = async () => {
    showLoading('Reenviando código...');
    try {
      await authService.loginSendOTP(email);
      Alert.alert('Éxito', 'Código reenviado');
      setOtp(['', '', '', '', '', '']); // Limpia el input
      inputRefs.current[0]?.focus();
      hideLoading();
    } catch (error) {
      Alert.alert('Error', 'No se pudo reenviar el código');
    } finally {
      hideLoading();
    }
  };
  const code = useMemo(() => otp.join(''), [otp]);
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

  return {
    otp,
    setOtp,
    isCodeComplete,
    code,
    handleConfirm,
    handleResend,
    inputRefs,
    handleKeyPress,
    handleOtpChange
  };
}

