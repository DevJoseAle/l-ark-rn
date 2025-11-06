// src/services/terms.service.ts

import { supabase } from "../lib/supabaseClient";


export const TermsService = {
  /**
   * Guardar aceptación de términos
   */
  async acceptTerms(userId: string, version: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_terms_acceptances')
        .insert({
          user_id: userId,
          terms_version: version,
          accepted_at: new Date().toISOString(),
        });

      if (error) {
        // Si ya existe (UNIQUE constraint), está ok
        if (error.code === '23505') {
          //console.log('⚠️ Usuario ya aceptó esta versión');
          return true;
        }
        throw error;
      }

      // Actualizar columna helper en users
      await supabase
        .from('users')
        .update({ current_terms_version: version })
        .eq('id', userId);

      //console.log('✅ Términos aceptados:', version);
      return true;
    } catch (error) {
      console.error('Error guardando aceptación:', error);
      return false;
    }
  },

  /**
   * Verificar si usuario aceptó versión específica
   */
  async hasAcceptedVersion(userId: string, version: string): Promise<boolean> {
    const { data } = await supabase
      .from('user_terms_acceptances')
      .select('id')
      .eq('user_id', userId)
      .eq('terms_version', version)
      .maybeSingle();

    return !!data;
  },

  /**
   * Obtener versión actual de términos
   */
  async getCurrentVersion(): Promise<string> {
    const { data } = await supabase
      .from('terms_versions')
      .select('version')
      .eq('is_current', true)
      .single();

    return data?.version || '1.0';
  }
};