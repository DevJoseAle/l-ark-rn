// src/features/vault/hooks/useFilePicker.ts

import { FileToUpload } from '@/src/types/vault.types';
import { VAULT_LIMITS } from '@/src/utils/vaultConstants';
import { isAcceptedMimeType } from '@/src/utils/vaultUtils';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert } from 'react-native';


/**
 * Hook para manejar la selección de archivos desde galería o file picker
 */
export function useFilePicker() {
  const [isPickingFile, setIsPickingFile] = useState(false);

  /**
   * Valida que el archivo sea aceptado
   */
  const validateFile = (file: FileToUpload): { isValid: boolean; error?: string } => {
    // Validar tamaño
    if (file.size > VAULT_LIMITS.MAX_FILE_SIZE_BYTES) {
      return {
        isValid: false,
        error: `El archivo excede el tamaño máximo de ${VAULT_LIMITS.MAX_FILE_SIZE_MB} MB`,
      };
    }

    // Validar MIME type
    if (!isAcceptedMimeType(file.type)) {
      return {
        isValid: false,
        error: `Tipo de archivo no soportado: ${file.type}`,
      };
    }

    return { isValid: true };
  };

  /**
   * Abre la galería de imágenes/videos
   */
  const pickFromGallery = async (): Promise<FileToUpload | null> => {
    try {
      setIsPickingFile(true);

      // Solicitar permisos
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permisos necesarios',
          'Necesitamos acceso a tu galería para subir archivos.',
          [{ text: 'OK' }]
        );
        return null;
      }

      // Abrir galería
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: false,
        quality: 1,
      });

      if (result.canceled) {
        console.log('Usuario canceló la selección');
        return null;
      }

      const asset = result.assets[0];

      // Construir FileToUpload
      const file: FileToUpload = {
        uri: asset.uri,
        name: asset.fileName || `image_${Date.now()}.jpg`,
        type: asset.type === 'video' ? 'video/mp4' : 'image/jpeg',
        size: asset.fileSize || 0,
      };

      // Validar archivo
      const validation = validateFile(file);
      if (!validation.isValid) {
        Alert.alert('Archivo no válido', validation.error, [{ text: 'OK' }]);
        return null;
      }

      console.log('✅ Archivo seleccionado desde galería:', file.name);
      return file;

    } catch (error) {
      console.error('❌ Error abriendo galería:', error);
      Alert.alert(
        'Error',
        'No se pudo abrir la galería. Intenta nuevamente.',
        [{ text: 'OK' }]
      );
      return null;
    } finally {
      setIsPickingFile(false);
    }
  };

  /**
   * Abre el selector de documentos
   */
  const pickDocument = async (): Promise<FileToUpload | null> => {
    try {
      setIsPickingFile(true);

      // Abrir document picker
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*', // Permitir todos los tipos
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        console.log('Usuario canceló la selección');
        return null;
      }

      const doc = result.assets[0];

      // Construir FileToUpload
      const file: FileToUpload = {
        uri: doc.uri,
        name: doc.name,
        type: doc.mimeType || 'application/octet-stream',
        size: doc.size || 0,
      };

      // Validar archivo
      const validation = validateFile(file);
      if (!validation.isValid) {
        Alert.alert('Archivo no válido', validation.error, [{ text: 'OK' }]);
        return null;
      }

      console.log('✅ Documento seleccionado:', file.name);
      return file;

    } catch (error) {
      console.error('❌ Error abriendo document picker:', error);
      Alert.alert(
        'Error',
        'No se pudo abrir el selector de archivos. Intenta nuevamente.',
        [{ text: 'OK' }]
      );
      return null;
    } finally {
      setIsPickingFile(false);
    }
  };

  return {
    isPickingFile,
    pickFromGallery,
    pickDocument,
  };
}