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
import { useTranslation } from "react-i18next";

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
  const { t: translate } = useTranslation("common");
  const handleContinue = async () => {
    if (!isFormValid) return;

    showLoading(translate("common.loading"));

    try {
      const cleanEmail = email.toLowerCase().trim();
      const { success, message } = await authService.verifyIsADeletedUser(cleanEmail);
      console.log('Post Login', { success, message });
      if (!success) {
        hideLoading();
        Alert.alert(message!)
        return;
      }

      // 1. Verificar si el usuario existe
      const { data: existingUser, error } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      console.log(error);
      console.log('Existing', existingUser);
      hideLoading();

      if (existingUser) {
        console.log('Entre a existing')
        // Usuario existe → Verificar si aceptó la versión actual
        const { data: acceptance, error: accError } = await supabase
          .from('user_terms_acceptances')
          .select('id')
          .eq('user_id', existingUser.id)
          .eq('terms_version', CURRENT_TERMS_VERSION)
        console.log('Acceptance', acceptance)
        if (accError) {
          console.log('Error verificando aceptación de términos:', accError);
        }

        if (acceptance) {
          // Ya aceptó términos actuales → Enviar OTP
          console.log('Caí aqui');
          console.log('✅ Usuario existente con términos aceptados');
          await sendOTP(cleanEmail);
        } else {
          // Debe aceptar nueva versión
          console.log('📝 Usuario debe aceptar términos actualizados');
          setPendingEmail(cleanEmail);
          setShowTermsModal(true);
        }
      } else {
        // Usuario nuevo → Mostrar modal de T&C
        console.log('📝 Usuario nuevo, mostrando T&C...');
        setPendingEmail(cleanEmail);
        setShowTermsModal(true);
      }
    } catch (error: any) {
      hideLoading();
      console.error('Error verificando usuario:', error);
      Alert.alert('Error', translate("common.error") );
    }
  };

  const sendOTP = async (emailToSend: string) => {
    setEmailStore(emailToSend);
    showLoading(translate("common.sendingCode"));
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
    await sendOTP(pendingEmail);
  };

  const handleDeclineTerms = () => {
    setShowTermsModal(false);
    setPendingEmail('');
    Alert.alert(
      translate("public.tyc.requiredModalTitle"),
      translate("public.tyc.requiredModalMessage")
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
    translate
  };
};
// src/features/auth/hooks/useAuthForm.ts


export function useOTPForm(length: number = 6, router: Router) {
  const { showLoading, hideLoading } = useLoadingStore();
  const { email } = useAuthStore();
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const { t: translate }=useTranslation("common");
  const isCodeComplete = useMemo(() => {
    return isValidOTPArray(otp);
  }, [otp]);
  const handleConfirm = async () => {
    const code = otp.join('');
    console.log('******-------******');
    if (code.length !== 6) {
      Alert.alert('Error', translate("common.fullCodeMsj"));
      return;
    }

    showLoading(translate("common.verifyingCode"));
    try {
      // Lógica de verificación
      const response = await authService.verifyOTP(email, code);
      console.log(email, code);
      console.log('✅ Código verificado:');
      console.log("response", response);
      if (!response.success) {
        console.log('no response');
        router.replace('/(public)/welcome');
        Alert.alert('Error', translate("common.error") )
        throw new Error();
      }

      router.replace('/(auth)/(tabs)/arkHome');
      hideLoading();
      Alert.alert('Éxito', translate("common.codeVerified"));
    } catch (error) {
      console.error('❌ Error:', error);
      hideLoading();
    }
  };

  const handleResend = async () => {
    showLoading(translate("common.resendedCodeLoading"));
    try {
      Alert.alert('Éxito', translate("common.resendedCode"));
      setOtp(['', '', '', '', '', '']); // Limpia el input
      inputRefs.current[0]?.focus();
      hideLoading();
    } catch (error) {
      Alert.alert('Error', translate("common.resendedCodeFailed"));
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
    handleOtpChange,
    translate
  };
}


