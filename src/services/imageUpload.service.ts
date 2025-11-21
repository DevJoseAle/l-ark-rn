// src/services/imageUploadService.ts
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
import { decode as base64Decode } from 'base64-arraybuffer';
import { supabase } from '../lib/supabaseClient';
import { LocalImage, CampaignImageType, UploadedImage } from '../types/campaign-create.types';

export class ImageUploadService {
  // Constantes
  private static readonly MAX_WIDTH = 1920;
  private static readonly MAX_HEIGHT = 1920;
  private static readonly COMPRESSION_QUALITY = 0.8; // 80% quality
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  /**
   * Validar imagen antes de procesar
   */
  static validateImage(image: LocalImage): { valid: boolean; error?: string } {
    // Validar tamaño
    if (image.size > this.MAX_FILE_SIZE) {
      return {
        valid: false,
        error: 'La imagen excede el tamaño máximo de 10MB',
      };
    }

    // Validar tipo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(image.type.toLowerCase())) {
      return {
        valid: false,
        error: 'Formato no soportado. Usa JPG, PNG o WebP',
      };
    }

    return { valid: true };
  }

  /**
   * Resize y compresión de imagen
   */
  static async resizeAndCompress(imageUri: string): Promise<string> {
    try {
      const manipResult = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          {
            resize: {
              width: this.MAX_WIDTH,
              height: this.MAX_HEIGHT,
            },
          },
        ],
        {
          compress: this.COMPRESSION_QUALITY,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      return manipResult.uri;
    } catch (error) {
      console.error('Error resizing image:', error);
      throw new Error('Error al procesar la imagen');
    }
  }

  /**
   * Convertir imagen a base64
   */
  static async imageToBase64(uri: string): Promise<string> {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64',
      });
      return base64;
    } catch (error) {
      console.error('Error converting to base64:', error);
      throw new Error('Error al leer la imagen');
    }
  }

  /**
   * Generar path para storage
   */
  static generateStoragePath(
    campaignId: string,
    imageType: CampaignImageType,
    beneficiaryId?: string
  ): string {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const filename = `${timestamp}_${randomStr}.jpg`;

    if (imageType === 'campaign') {
      return `campaigns/${campaignId}/${filename}`;
    } else if (imageType === 'diagnosis') {
      return `campaigns/${campaignId}/diagnosis/${filename}`;
    } else if (imageType === 'beneficiary') {
      return `beneficiaries/${beneficiaryId}/${filename}`;
    }

    return `campaigns/${campaignId}/${filename}`;
  }

  /**
   * Determinar bucket según tipo de imagen
   */
  static getBucketName(imageType: CampaignImageType): string {
    if (imageType === 'diagnosis') {
      return 'campaign-diagnosis';
    }
    return 'campaign-media';
  }

  /**
   * Subir imagen a Supabase Storage
   */
  static async uploadImage(
    campaignId: string,
    image: LocalImage,
    imageType: CampaignImageType,
    beneficiaryId?: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      // 1. Validar imagen
      const validation = this.validateImage(image);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // 2. Resize y comprimir
      onProgress?.(10);
      const resizedUri = await this.resizeAndCompress(image.uri);
      onProgress?.(30);

      // 3. Convertir a base64
      const base64 = await this.imageToBase64(resizedUri);
      onProgress?.(50);

      // 4. Decodificar a ArrayBuffer
      const arrayBuffer = base64Decode(base64);
      onProgress?.(60);

      // 5. Generar path
      const storagePath = this.generateStoragePath(campaignId, imageType, beneficiaryId);
      const bucketName = this.getBucketName(imageType);

      // 6. Upload a Supabase
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(storagePath, arrayBuffer, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (error) {
        throw error;
      }

      onProgress?.(90);

      // 7. Obtener URL pública
      const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(storagePath);

      onProgress?.(100);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  /**
   * Subir múltiples imágenes
   */
  static async uploadMultipleImages(
    campaignId: string,
    images: LocalImage[],
    imageType: CampaignImageType,
    beneficiaryId?: string,
    onProgress?: (imageId: string, progress: number) => void
  ): Promise<UploadedImage[]> {
    const uploadPromises = images.map(async (image, index) => {
      const url = await this.uploadImage(campaignId, image, imageType, beneficiaryId, (progress) =>
        onProgress?.(image.id, progress)
      );

      return {
        id: image.id,
        url,
        displayOrder: index + 1,
        isPrimary: index === 0,
        type: imageType,
      };
    });

    return await Promise.all(uploadPromises);
  }

  /**
   * Eliminar imagen de Storage
   */
  static async deleteImage(imageUrl: string, imageType: CampaignImageType): Promise<void> {
    try {
      const bucketName = this.getBucketName(imageType);

      // Extraer path de la URL
      const url = new URL(imageUrl);
      const pathSegments = url.pathname.split('/');
      const bucketIndex = pathSegments.findIndex((s) => s === bucketName);
      const storagePath = pathSegments.slice(bucketIndex + 1).join('/');

      const { error } = await supabase.storage.from(bucketName).remove([storagePath]);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  }

  /**
   * Obtener tamaño de archivo
   */
  static async getFileSize(uri: string): Promise<number> {
    try {
      const info = await FileSystem.getInfoAsync(uri);
      return info.exists && 'size' in info ? info.size : 0;
    } catch (error) {
      console.error('Error getting file size:', error);
      return 0;
    }
  }

  /**
   * Obtener dimensiones de imagen
   */
  static async getImageDimensions(uri: string): Promise<{ width: number; height: number }> {
    // Esta función requiere react-native-image-size
    // Por ahora retornamos valores por defecto
    return { width: 0, height: 0 };
  }
}
