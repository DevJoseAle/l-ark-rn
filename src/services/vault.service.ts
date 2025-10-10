import { supabase } from "../lib/supabaseClient";
import { VaultFile, FileToUpload, UploadResult } from "../types/vault.types";
import { STORAGE_BUCKET } from "../utils/vaultConstants";
import { validateFileUpload, generateStoragePath, getFileTypeFromMimeType } from "../utils/vaultUtils";

/**
 * Servicio para gestionar archivos de la bóveda
 */
export const VaultService = {
  /**
   * Obtiene todos los archivos de un usuario/campaña
   */
  async getFiles(userId: string, campaignId: string): Promise<VaultFile[]> {
    try {
      const { data, error } = await supabase
        .from('vault_files')
        .select('*')
        .eq('user_id', userId)
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('❌ Error obteniendo archivos:', error);
      throw new Error('No se pudieron cargar los archivos');
    }
  },

  /**
   * Sube un archivo a la bóveda
   * @param file - Archivo a subir
   * @param userId - ID del usuario
   * @param campaignId - ID de la campaña
   * @param subscriptionId - ID de la suscripción
   * @param currentUsedBytes - Bytes actualmente usados
   * @param quotaBytes - Cuota total en bytes
   */
  async uploadFile(
    file: FileToUpload,
    userId: string,
    campaignId: string,
    subscriptionId: string,
    currentUsedBytes: number,
    quotaBytes: number
  ): Promise<UploadResult> {
    try {
      console.log('📤 Iniciando upload:', file.name);

      // 1. Validar el archivo
      const validation = validateFileUpload(
        file.size,
        currentUsedBytes,
        quotaBytes
      );

      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error,
        };
      }

      // 2. Generar path único en Storage
      const storagePath = generateStoragePath(userId, campaignId, file.name);

      // 3. Leer el archivo como ArrayBuffer/Blob
      const response = await fetch(file.uri);
      const blob = await response.blob();

      // 4. Subir a Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(storagePath, blob, {
          contentType: file.type,
          upsert: false, // No sobrescribir si existe
        });

      if (uploadError) {
        console.error('❌ Error subiendo a Storage:', uploadError);
        throw uploadError;
      }

      console.log('✅ Archivo subido a Storage:', uploadData.path);

      // 5. Determinar el tipo de archivo
      const fileType = getFileTypeFromMimeType(file.type);

      // 6. Crear registro en la tabla vault_files
      const { data: fileRecord, error: dbError } = await supabase
        .from('vault_files')
        .insert({
          user_id: userId,
          campaign_id: campaignId,
          subscription_id: subscriptionId,
          file_name: file.name,
          file_size_bytes: file.size,
          mime_type: file.type,
          storage_path: storagePath,
          file_type: fileType,
        })
        .select()
        .single();

      if (dbError) {
        console.error('❌ Error guardando en DB:', dbError);
        
        // Rollback: eliminar archivo de Storage
        await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]);
        
        throw dbError;
      }

      console.log('✅ Archivo registrado en DB:', fileRecord.id);

      return {
        success: true,
        file: fileRecord as VaultFile,
      };
    } catch (error: any) {
      console.error('❌ Error en uploadFile:', error);
      return {
        success: false,
        error: error.message || 'Error al subir el archivo',
      };
    }
  },

  /**
   * Obtiene la URL pública de un archivo
   * Nota: El bucket es privado, así que usamos signed URLs
   */
  async getFileUrl(storagePath: string, expiresIn: number = 3600): Promise<string | null> {
    try {
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(storagePath, expiresIn);

      if (error) throw error;

      return data.signedUrl;
    } catch (error) {
      console.error('❌ Error obteniendo URL del archivo:', error);
      return null;
    }
  },

  /**
   * Descarga un archivo (genera URL firmada)
   */
  async downloadFile(file: VaultFile): Promise<{ url: string | null; error?: string }> {
    try {
      const url = await this.getFileUrl(file.storage_path, 3600); // 1 hora de validez

      if (!url) {
        return {
          url: null,
          error: 'No se pudo generar el enlace de descarga',
        };
      }

      return { url };
    } catch (error) {
      console.error('❌ Error descargando archivo:', error);
      return {
        url: null,
        error: 'Error al descargar el archivo',
      };
    }
  },

  /**
   * Elimina un archivo de la bóveda
   */
  async deleteFile(fileId: string, storagePath: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🗑️ Eliminando archivo:', fileId);

      // 1. Eliminar registro de la DB
      // Nota: El trigger tr_vf_after_del se encargará de actualizar storage_used_bytes
      const { error: dbError } = await supabase
        .from('vault_files')
        .delete()
        .eq('id', fileId);

      if (dbError) {
        console.error('❌ Error eliminando de DB:', dbError);
        throw dbError;
      }

      // 2. Eliminar archivo de Storage
      const { error: storageError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([storagePath]);

      if (storageError) {
        console.error('⚠️ Advertencia: Archivo eliminado de DB pero no de Storage:', storageError);
        // No lanzamos error porque el archivo ya se eliminó de la DB
      }

      console.log('✅ Archivo eliminado exitosamente');

      return { success: true };
    } catch (error: any) {
      console.error('❌ Error en deleteFile:', error);
      return {
        success: false,
        error: error.message || 'Error al eliminar el archivo',
      };
    }
  },

  /**
   * Obtiene el total de archivos de un usuario
   */
  async getFileCount(userId: string, campaignId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('vault_files')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('campaign_id', campaignId);

      if (error) throw error;

      return count || 0;
    } catch (error) {
      console.error('❌ Error obteniendo conteo de archivos:', error);
      return 0;
    }
  },

  /**
   * Verifica si un archivo existe en la bóveda
   */
  async fileExists(userId: string, fileName: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('vault_files')
        .select('id')
        .eq('user_id', userId)
        .eq('file_name', fileName)
        .maybeSingle();

      if (error) throw error;

      return !!data;
    } catch (error) {
      console.error('❌ Error verificando existencia del archivo:', error);
      return false;
    }
  },
};