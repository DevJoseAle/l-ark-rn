import { supabase } from "../lib/supabaseClient";
import { FileToUpload, UploadResult } from "../types/vault.types";
import { STORAGE_BUCKET } from "../utils/vaultConstants";
import { validateFileUpload, generateStoragePath } from "../utils/vaultUtils";
import * as FileSystem from 'expo-file-system/legacy';

export class VaultService {
  /**
   * Sube un archivo a Supabase Storage
   */
  static async uploadFile(
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
        console.error('❌ Validación fallida:', validation.error);
        return {
          success: false,
          error: validation.error,
        };
      }

      // 2. Generar path único en Storage
      const storagePath = generateStoragePath(userId, campaignId, file.name);
      console.log('📁 Storage path:', storagePath);

      // 3. ✅ LEER ARCHIVO CON EXPO-FILE-SYSTEM (React Native compatible)
      console.log('🔄 Leyendo archivo desde:', file.uri);
      
      // Leer archivo como base64
      const base64Data = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      console.log('✅ Archivo leído, tamaño base64:', base64Data.length, 'chars');

      // Convertir base64 a Uint8Array
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      console.log('✅ Uint8Array creado:', bytes.length, 'bytes');

      // 4. Subir a Supabase Storage
      console.log('☁️ Subiendo a Supabase Storage...');
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(storagePath, bytes, {
          contentType: file.type,
          upsert: false, // No sobrescribir si existe
        });

      if (uploadError) {
        console.error('❌ Error en upload:', uploadError);
        throw uploadError;
      }

      console.log('✅ Upload a Storage exitoso:', uploadData.path);

      // 5. Crear registro en la tabla vault_files
      console.log('💾 Creando registro en DB...');
      const { data: fileRecord, error: dbError } = await supabase
        .from('vault_files')
        .insert({
          user_id: userId,
          campaign_id: campaignId,
          subscription_id: subscriptionId,
          file_name: file.name,
          file_size_bytes: file.size,
          file_type: file.type.split('/')[0], // 'image', 'application', etc.
          mime_type: file.type,
          storage_path: storagePath,
        })
        .select()
        .single();

      if (dbError) {
        console.error('❌ Error al crear registro:', dbError);
        // Intentar eliminar archivo de storage si falla la DB
        await supabase.storage
          .from(STORAGE_BUCKET)
          .remove([storagePath]);
        throw dbError;
      }

      console.log('✅ Registro creado en DB:', fileRecord.id);

      // 6. Actualizar bytes usados en la suscripción
      console.log('📊 Actualizando cuota...');
      const newUsedBytes = currentUsedBytes + file.size;
      
      const { error: updateError } = await supabase
        .from('vault_subscriptions')
        .update({ storage_used_bytes: newUsedBytes })
        .eq('id', subscriptionId);

      if (updateError) {
        console.error('⚠️ Error actualizando cuota:', updateError);
        // No es crítico, continuar
      }

      console.log('✅ Upload completado exitosamente!');

      return {
        success: true,
        file: fileRecord,
      };

    } catch (error: any) {
      console.error('❌ Error en uploadFile:', error.message || error);
      return {
        success: false,
        error: error.message || 'Error desconocido al subir archivo',
      };
    }
  }

  /**
   * Obtiene todos los archivos de una campaña
   */
  /**
   * Obtiene todos los archivos de una campaña
   */
  static async getFiles(
    userId: string,
    campaignId: string
  ): Promise<any[]> {
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
      return [];
    }
  }

  /**
   * Elimina un archivo
   */
  static async deleteFile(fileId: string, storagePath: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🗑️ Eliminando archivo:', fileId);

      // 1. Eliminar de Storage
      console.log('☁️ Eliminando de Storage:', storagePath);
      const { error: storageError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([storagePath]);

      if (storageError) {
        console.error('❌ Error eliminando de Storage:', storageError);
        throw new Error(storageError.message || 'Error al eliminar de Storage');
      }

      // 2. Eliminar registro de DB
      console.log('💾 Eliminando registro de DB...');
      const { error: dbError } = await supabase
        .from('vault_files')
        .delete()
        .eq('id', fileId);

      if (dbError) {
        console.error('❌ Error eliminando de DB:', dbError);
        throw new Error(dbError.message || 'Error al eliminar de DB');
      }

      console.log('✅ Archivo eliminado exitosamente');
      return { success: true };

    } catch (error: any) {
      console.error('❌ Error en deleteFile:', error.message || error);
      return {
        success: false,
        error: error.message || 'Error desconocido al eliminar archivo',
      };
    }
  }
  // 📍 AGREGAR ESTAS 2 FUNCIONES al final de tu VaultService
// Justo ANTES del cierre de la clase (antes de la última "}")

  /**
   * Descarga un archivo al dispositivo
   */
  static async downloadFile(
    file: any
  ): Promise<{ success: boolean; localUri?: string; error?: string }> {
    try {
      console.log('⬇️ Descargando archivo:', file.file_name);

      // 1. Obtener URL pública temporal del archivo
      const { data: urlData } = await supabase.storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(file.storage_path, 60); // 60 segundos

      if (!urlData?.signedUrl) {
        throw new Error('No se pudo obtener URL del archivo');
      }

      console.log('🔗 URL obtenida, descargando...');

      // 2. Descargar archivo con expo-file-system
      const fileUri = `${FileSystem.documentDirectory}${file.file_name}`;
      
      const downloadResult = await FileSystem.downloadAsync(
        urlData.signedUrl,
        fileUri
      );

      if (downloadResult.status !== 200) {
        throw new Error('Error al descargar el archivo');
      }

      console.log('✅ Archivo descargado en:', downloadResult.uri);

      return {
        success: true,
        localUri: downloadResult.uri,
      };

    } catch (error: any) {
      console.error('❌ Error en downloadFile:', error.message || error);
      return {
        success: false,
        error: error.message || 'Error desconocido al descargar archivo',
      };
    }
  }

  /**
   * Obtiene una URL pública temporal para preview
   */
  static async getFilePreviewUrl(storagePath: string): Promise<string | null> {
    try {
      const { data } = await supabase.storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(storagePath, 3600); // 1 hora

      return data?.signedUrl || null;
    } catch (error) {
      console.error('❌ Error obteniendo preview URL:', error);
      return null;
    }
  }

}

// Export por defecto para compatibilidad
export default VaultService;