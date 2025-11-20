// src/features/auth/service/auth.service.ts
import { supabase } from '@/src/lib/supabaseClient';
import { AuthError, Session } from '@supabase/supabase-js';

interface AuthServiceResponse<T = void> {
  success: boolean;
  message: string;
  data?: T;
  error?: AuthError;
}

interface SendOTPData {
  user: any;
  session: Session | null;
}

interface VerifyOTPData {
  user: any;
  session: Session;
}

interface UserExist {
  exists: boolean;
}

export const authService = {
  loginSendOTP: async (email: string): Promise<AuthServiceResponse<SendOTPData>> => {
    console.log("SendOTPData email:", email);
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        },
      });
      
      if (error) throw error;

      return {
        success: true,
        message: "OTP enviado exitosamente",
        data: data as SendOTPData,
      };
    } catch (error) {
      console.error("Error enviando OTP:", error);
      return {
        success: false,
        message: `${error}`,
        error: error as AuthError,
      };
    }
  },

  verifyOTP: async (email: string, token: string): Promise<AuthServiceResponse<VerifyOTPData>> => {
    console.log("Verificando OTP para:", email);

    try {
      // 1. Verificar OTP
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      });

      if (error) throw error;

      if (!data.user) {
        throw new Error('No se obtuvo información del usuario');
      }
      console.log("✅ OTP verificado, usuario autenticado");
      await authService.ensureUserExists(data.user.id, data.user.email!);
      try {
        // Obtener versión actual de términos
        const { data: currentTerms } = await supabase
          .from('terms_versions')
          .select('version')
          .eq('is_current', true)
          .maybeSingle();

        const currentVersion = currentTerms?.version || '1.0';

        // Verificar si ya aceptó esta versión
        const { data: existingAcceptance } = await supabase
          .from('user_terms_acceptances')
          .select('id')
          .eq('user_id', data.user.id)
          .eq('terms_version', currentVersion)
          .maybeSingle();

        if (!existingAcceptance) {
          // Guardar aceptación de términos
          const { error: acceptanceError } = await supabase
            .from('user_terms_acceptances')
            .insert({
              user_id: data.user.id,
              terms_version: currentVersion,
              accepted_at: new Date().toISOString(),
            });

          if (acceptanceError) {
            // Si aún falla, loguear pero no fallar el login
            console.error('⚠️ Error guardando aceptación de términos:', acceptanceError);
          } else {
            console.log('✅ Términos aceptados:', currentVersion);

            // Actualizar columna helper en users
            await supabase
              .from('users')
              .update({ current_terms_version: currentVersion })
              .eq('id', data.user.id);
          }
        } else {
          console.log('✅ Usuario ya aceptó términos:', currentVersion);
        }
      } catch (termsError) {
        // No fallar el login si hay error con términos
        console.error('⚠️ Error procesando términos:', termsError);
      }

      return {
        success: true,
        message: "OTP Verificado Exitosamente",
        data: data as VerifyOTPData
      };

    } catch (error) {
      console.error("❌ Error verificando OTP:", error);
      return {
        success: false,
        message: "Error al verificar OTP (Falla servicio)",
        error: error as AuthError,
      };
    }
  },

  /**
   * Asegura que el usuario existe en public.users
   * Espera hasta 5 segundos a que el trigger lo cree
   * Si no existe, lo crea manualmente
   */
  ensureUserExists: async (userId: string, email: string): Promise<void> => {
    const maxAttempts = 10;
    const delayMs = 500;

    for (let i = 0; i < maxAttempts; i++) {
      console.log(`🔍 Intento ${i + 1}/${maxAttempts}: Verificando usuario en public.users...`);

      const { data: user, error } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (user) {
        console.log('✅ Usuario encontrado en public.users');
        return;
      }

      if (i === maxAttempts - 1) {
        // Último intento: crear manualmente
        console.log('⚠️ Trigger no creó el usuario, creando manualmente...');
        
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: userId,
            email: email,
            display_name: email.split('@')[0],
            kyc_status: 'kyc_pending',
            default_currency: 'USD',
            pin_set: false,
          });

        if (insertError) {
          console.error('❌ Error creando usuario manualmente:', insertError);
          throw new Error('No se pudo crear el usuario en la base de datos');
        }

        console.log('✅ Usuario creado manualmente en public.users');
        return;
      }

      // Esperar antes del siguiente intento
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }

    throw new Error('Timeout esperando creación de usuario');
  },

  getSession: async (): Promise<AuthServiceResponse<Session>> => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return {
        success: true,
        message: "Session obtenida",
        data: data.session as Session
      };
    } catch (error) {
      return {
        success: false,
        message: "Error al obtener Sesion",
        error: error as AuthError
      }
    }
  },

  signOut: async (): Promise<AuthServiceResponse> => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return {
      success: true,
      message: "Sesión cerrada",
    };
  },

  checkIfUserExists: async (email: string): Promise<AuthServiceResponse<UserExist>> => {
    try {
      const { data, error } = await supabase.functions.invoke('check-user-exists', {
        body: { email }
      })
      if (error) throw error
      const exists = data as UserExist
      if (exists.exists == false) {
        return {
          success: true,
          message: "Usuario no existe en la base de datos",
          data
        }
      }
      return {
        success: true,
        message: "Usuario encontrado Exitosamente",
        data
      }

    } catch (error) {
      return {
        success: false,
        message: "Error al verificar el usuario",
        error: error as AuthError
      }
    }
  },

  onAuthStateChange: (callback: (session: any) => void) => {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });
  },
};