import { useThemeColors } from "@/hooks/use-theme-color";
import { useLoadingStore } from "@/src/stores/LoadingStore";
import { Router } from "expo-router";
import { useMemo, useRef, useState } from "react";
import { createLoginStyles } from "../styles/loginStyles";
import { isValidEmail, isValidOTPArray } from "@/src/lib/validators";
import { authService } from "../service/auth.service";
import { Alert, TextInput } from "react-native";
import { useAuthStore } from "@/src/stores/authStore";

export const useLogin = (router: Router) =>{
      const colors = useThemeColors();
      const styles = createLoginStyles(colors);
      const { showLoading, hideLoading } = useLoadingStore();
      const { setEmail: setEmailStore, email: emailStore  } = useAuthStore();

    const [email, setEmail] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  
  const isFormValid = isValidEmail(email) && isChecked;

  const handleContinue = async () => {
    if (!isFormValid) return;
    setEmailStore(email);
    showLoading('Enviando código...');
    const response = await authService.loginSendOTP(email);
    
    if (response.success) {
      router.push({
        pathname: '/(public)/otp',
        params: { email }
      });
       hideLoading();
    } else {
      Alert.alert('Error', response.message);
      hideLoading();
    }
  };
    

      return {
        email,
        setEmail,
        isChecked,
        setIsChecked,
        handleContinue,
        isFormValid,
        styles,
        colors
      }
}

// src/features/auth/hooks/useAuthForm.ts


export function useOTPForm(length: number = 6, router: Router) {
     const { showLoading, hideLoading } = useLoadingStore();
     const {email} = useAuthStore();
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
     console.log(email, code);
      console.log('✅ Código verificado:');
      console.log("response",response);
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


