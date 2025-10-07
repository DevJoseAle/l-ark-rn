import { useThemeColors } from "@/hooks/use-theme-color";
import { useLoadingStore } from "@/src/stores/LoadingStore";
import { Router } from "expo-router";
import { useState } from "react";
import { createLoginStyles } from "../styles/loginStyles";

export const useLogin = (router: Router) =>{
      const colors = useThemeColors();
      const styles = createLoginStyles(colors);
      const { showLoading, hideLoading } = useLoadingStore();
      
      const [email, setEmail] = useState('');
      const [isChecked, setIsChecked] = useState(false);
    
      const handleContinue = async () => {
        if (!email || !isChecked) return;
        
        showLoading('Verificando correo...');
        try {
          // Lógica de login/registro
          await new Promise(resolve => setTimeout(resolve, 2000));
          router.push('/(public)/otp');
          console.log('✅ Continuar con:', email);
        } catch (error) {
          console.error('❌ Error:', error);
        } finally {
          hideLoading();
          
        }
      };
    
      const isFormValid = email.length > 0 && isChecked;

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