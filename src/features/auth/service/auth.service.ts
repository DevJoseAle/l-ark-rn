// src/features/auth/services/authService.ts

import { supabase } from "@/src/lib/supabaseClient";
import { AuthError, Session, User } from "@supabase/supabase-js";

export interface AuthServiceResponse<T = void> {
    success: boolean;
    message: string;
    data?: T;
    error?: AuthError | null; 
}
export interface SendOTPData {
  messageId?: string;
}

export interface VerifyOTPData {
  session: Session;
  user: User;
}

export interface CheckUserExistsData {
  exists: boolean;
  userId?: string;
}

export interface UserExist {
  exists: boolean;
  userId?: string;
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
        console.log(data);
        if (error) throw error;
        console.log(error);

        return {
            success: true,
            message: "OTP enviado exitosamente",
            data: data as SendOTPData,
        };
        } catch (error) {
            console.log(error)
            return {
                success: false,
                message: `${error}`,
                error: error as AuthError,
            };
        }
    },

    verifyOTP: async (email: string, token: string):Promise<AuthServiceResponse<VerifyOTPData>> => {
        console.log("entre")
        try {
            const { data, error } = await supabase.auth.verifyOtp({
            email,
            token,
            type: 'email',
        });
        console.log("Data",{data});
        if (error) throw error;
        return {
            success: true,
            message: "OTP Verificado Exitosamente",
            data: data as VerifyOTPData
        };
        } catch (error) {
            return {
                success: false,
                message: "Error al verificar OTP (Falla servicio)",
                error: error as AuthError,
            };
        }
    },

    getSession: async ():Promise<AuthServiceResponse<Session>> => {
        try {
                    const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        return {
            success: true,
            message: "Session obtenida",
            data: data.session as Session
        };
        } catch (error) {
            return{
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
        if(error) throw error
        const exists = data as UserExist
        if(exists.exists == false){
            return{
                success: true,
                message: "Usuario no existe en la base de datos",
                data
            }
        }
        return{
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