// src/features/auth/service/auth.service.ts
import { supabase } from '@/src/lib/supabaseClient';
import { AuthError, Session } from '@supabase/supabase-js';

interface AuthServiceResponse<T = void> {
  success: boolean;
  message?: string;
  data?: T;
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

// 🍎 Constantes para Apple Review
const DEMO_EMAIL = 'demo@l-ark-review.com';

export const authService = {

  loginSendOTP: async (email: string): Promise<AuthServiceResponse<SendOTPData>> => {
    console.log("SendOTPData email:", email);

    try {

      // 🍎 DEMO MODE: Si es el email de Apple Review, NO enviar OTP
      if (email.toLowerCase() === DEMO_EMAIL.toLowerCase()) {
        console.log('🍎 Demo mode: Usando password en lugar de OTP');
        return {
          success: true,
          message: 'Usuario demo detectado. Ingresa el código: 123456',
        };
      }

      // Flujo normal para usuarios reales
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
      };
    }
  },

  verifyOTP: async (email: string, token: string): Promise<AuthServiceResponse<VerifyOTPData>> => {
    console.log("Verificando OTP para:", email);

    try {
      // 🍎 DEMO MODE: Si es el email de Apple Review, usar password
      if (email.toLowerCase() === DEMO_EMAIL.toLowerCase()) {
        console.log('🍎 Demo mode: Login con password');

        // Usar el "token" como password (será "123456")
        const { data, error } = await supabase.auth.signInWithPassword({
          email: DEMO_EMAIL,
          password: token, // El usuario ingresa "123456" como si fuera OTP
        });

        if (error) {
          console.error('❌ Error en login demo:', error);
          throw new Error()

        }

        console.log('✅ Login demo exitoso');

        // Asegurar que existe en public.users
        await authService.ensureUserExists(data.user.id, data.user.email!);

        return {
          success: true,
          message: 'Verificación exitosa (Demo)',
          data: data as VerifyOTPData,
        };
      }

      // Flujo normal para usuarios reales
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

      // Manejar aceptación de términos
      try {
        const { data: currentTerms } = await supabase
          .from('terms_versions')
          .select('version')
          .eq('is_current', true)
          .maybeSingle();

        const currentVersion = currentTerms?.version || '1.0';

        const { data: existingAcceptance } = await supabase
          .from('user_terms_acceptances')
          .select('id')
          .eq('user_id', data.user.id)
          .eq('terms_version', currentVersion)
          .maybeSingle();

        if (!existingAcceptance) {
          const { error: acceptanceError } = await supabase
            .from('user_terms_acceptances')
            .insert({
              user_id: data.user.id,
              terms_version: currentVersion,
              accepted_at: new Date().toISOString(),
            });

          if (acceptanceError) {
            console.error('⚠️ Error guardando aceptación de términos:', acceptanceError);
          } else {
            console.log('✅ Términos aceptados:', currentVersion);

            await supabase
              .from('users')
              .update({ current_terms_version: currentVersion })
              .eq('id', data.user.id);
          }
        } else {
          console.log('✅ Usuario ya aceptó términos:', currentVersion);
        }
      } catch (termsError) {
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
      };
    }
  },

  verifyIsADeletedUser: async (email: string): Promise<AuthServiceResponse> => {
    try {
      console.log('Antes');
      const { data, error } = await supabase.functions.invoke('check-account-status', {
        body: {email}
      })
      console.log('Despues', {
        data,
        error
      });
      if (data.is_deleted === true) {
        return {
          success: false,
          message: 'Esta cuenta ha sido eliminada y ya no puede acceder. Si crees que es un error o si necesitas reactivarla, contacta a soporte@l-ark.app',
        }
      }
      if(error){
        throw error
      }
      return {
        success: true,
      }
    } catch (error){
      console.log(error)
      return {
        success: false,
        message: 'No se pudo Validar usuario',
      }
    }

  },

  /**
   * Asegura que el usuario existe en public.users
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
      }
    }
  },

  onAuthStateChange: (callback: (session: any) => void) => {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });
  },
};