// src/services/kyc.service.ts
import { supabase } from '../lib/supabaseClient';
import * as FileSystem from 'expo-file-system/legacy';
import { decode as base64Decode } from 'base64-arraybuffer';
import { KYCDocument } from '../types/kyc.types';

export class KYCService {
  /**
   * Subir documento KYC a Supabase Storage
   */
  static async uploadKYCDocument(
    userId: string,
    document: KYCDocument,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      onProgress?.(10);

      // Leer archivo como base64
      const base64 = await FileSystem.readAsStringAsync(document.uri, {
        encoding: 'base64',
      });
      onProgress?.(40);

      // Decodificar a ArrayBuffer
      const arrayBuffer = base64Decode(base64);
      onProgress?.(60);

      // Generar path
      const timestamp = Date.now();
      const extension = document.name.split('.').pop() || 'jpg';
      const filename = `${document.type}_${timestamp}.${extension}`;
      const storagePath = `${userId}/${filename}`;

      // Upload a Supabase
      const { data, error } = await supabase.storage
        .from('kyc_documents')
        .upload(storagePath, arrayBuffer, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (error) {
        throw error;
      }

      onProgress?.(90);

      // Obtener URL pública
      const { data: urlData } = supabase.storage.from('kyc_documents').getPublicUrl(storagePath);

      onProgress?.(100);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading KYC document:', error);
      throw error;
    }
  }

  /**
   * Enviar solicitud de verificación KYC
   */
  static async submitKYCVerification(
    documents: {
      id_front: KYCDocument;
      id_back: KYCDocument;
      selfie: KYCDocument;
    },
    onProgress?: (step: string, progress: number) => void
  ): Promise<void> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // 1. Subir documento frontal
      onProgress?.('Subiendo documento frontal', 20);
      const frontUrl = await this.uploadKYCDocument(user.id, documents.id_front);

      // 2. Subir documento reverso
      onProgress?.('Subiendo documento reverso', 40);
      const backUrl = await this.uploadKYCDocument(user.id, documents.id_back);

      // 3. Subir selfie
      onProgress?.('Subiendo selfie', 60);
      const selfieUrl = await this.uploadKYCDocument(user.id, documents.selfie);

      // 4. Crear registro en la tabla kyc_verifications
      onProgress?.('Creando solicitud', 80);
      const { error: insertError } = await supabase.from('kyc_verifications').insert({
        user_id: user.id,
        id_front_url: frontUrl,
        id_back_url: backUrl,
        selfie_url: selfieUrl,
        status: 'pending',
        submitted_at: new Date().toISOString(),
      });

      if (insertError) {
        throw insertError;
      }

      // 5. Actualizar estado del usuario
      onProgress?.('Actualizando perfil', 90);
      const { error: updateError } = await supabase
        .from('users')
        .update({ kyc_status: 'kyc_review' })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      onProgress?.('Completado', 100);
    } catch (error) {
      console.error('Error submitting KYC:', error);
      throw error;
    }
  }

  /**
   * Verificar si el usuario ya tiene KYC
   */
  static async getUserKYCStatus(): Promise<{
    status: string;
    canCreateCampaign: boolean;
  }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const { data, error } = await supabase
        .from('users')
        .select('kyc_status')
        .eq('id', user.id)
        .single();

      if (error) {
        throw error;
      }

      const kycStatus = data.kyc_status;
      const canCreateCampaign = kycStatus === 'kyc_verified';

      return {
        status: kycStatus,
        canCreateCampaign,
      };
    } catch (error) {
      console.error('Error getting KYC status:', error);
      return {
        status: 'kyc_pending',
        canCreateCampaign: false,
      };
    }
  }
}
