// src/services/certificate.service.ts

import { Alert } from "react-native";
import { CampaignDetail } from "../types/campaign.types";
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import Share, { Social } from 'react-native-share';
export type CertificateStyle = 'elegant' | 'modern' | 'warm';
export type CertificateTone = 'inspirational' | 'direct' | 'emotional';

interface CertificateConfig {
  style: CertificateStyle;
  tone: CertificateTone;
  includeQR?: boolean;
}

interface CertificateData {
  ownerName: string;
  beneficiariesCount: number;
  goalAmount: number;
  currency: string;
  shortCode: string;
  createdDate: string;
  campaignId: string;
}

export class CertificateService {
  /**
   * Generar mensaje según el tono seleccionado
   */
  static getMessage(
    tone: CertificateTone,
    ownerName: string,
    beneficiariesCount: number,
    goalAmount: number,
    currency: string
  ): string {
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(goalAmount);

    switch (tone) {
      case 'inspirational':
        return `${ownerName} está escribiendo su legado digital.\nHa asegurado el futuro de ${beneficiariesCount} ${beneficiariesCount === 1 ? 'ser querido' : 'seres queridos'
          }.\n${formattedAmount} de tranquilidad para su familia.`;

      case 'direct':
        return `${ownerName} ha creado su Plan de Herencia Digital.\nProtegiendo a ${beneficiariesCount} ${beneficiariesCount === 1 ? 'beneficiario' : 'beneficiarios'
          } con ${formattedAmount}.`;

      case 'emotional':
        return `${ownerName} eligió el amor sobre la incertidumbre.\n${beneficiariesCount} ${beneficiariesCount === 1 ? 'persona dormirá' : 'personas dormirán'
          } tranquila${beneficiariesCount === 1 ? '' : 's'} gracias a esta decisión.\n${formattedAmount} de protección y paz mental.`;
    }
  }

  /**
   * Obtener configuración de colores según el estilo
   */
  static getStyleConfig(style: CertificateStyle) {
    const styles = {
      elegant: {
        primary: '#1E3A5F',
        secondary: '#C5A572',
        background: '#F5F1E8',
        text: '#2C2C2C',
        accent: '#8B7355',
        gradient: ['#1E3A5F', '#2C5282'],
      },
      modern: {
        primary: '#6366F1',
        secondary: '#EC4899',
        background: '#0F172A',
        text: '#FFFFFF',
        accent: '#8B5CF6',
        gradient: ['#6366F1', '#EC4899'],
      },
      warm: {
        primary: '#F97316',
        secondary: '#FB923C',
        background: '#FFF7ED',
        text: '#431407',
        accent: '#FDBA74',
        gradient: ['#F97316', '#FB923C'],
      },
    };

    return styles[style];
  }

  /**
   * Generar certificado desde campaign
   */
  static async generateFromCampaign(
    campaign: CampaignDetail,
    config: CertificateConfig
  ): Promise<string> {
    const data: CertificateData = {
      ownerName: campaign.owner.display_name,
      beneficiariesCount: campaign.beneficiaries.length,
      goalAmount: campaign.goal_amount || 0,
      currency: campaign.currency,
      shortCode: campaign.short_code,
      createdDate: new Date(campaign.created_at).toLocaleDateString('es', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      campaignId: campaign.id,
    };

    return this.generate(data, config);
  }

  /**
   * Generar certificado (retorna URI de la imagen)
   */
  static async generate(
    data: CertificateData,
    config: CertificateConfig
  ): Promise<string> {
    // Por ahora retornamos un placeholder
    // En el siguiente paso implementaremos react-native-view-shot
    console.log('Generando certificado:', { data, config });

    // Placeholder: retornar una imagen de ejemplo
    return 'https://placehold.co/1080x1920/1E3A5F/white?text=Certificate+L-ark';
  }

  /**
   * Compartir certificado
   */
  static async share(imageUri: string, campaignShortCode: string): Promise<void> {
    try {
      const isAvailable = await Sharing.isAvailableAsync();

      if (!isAvailable) {
        Alert.alert('Error', 'Sharing is not available on this device');
        return;
      }

      await Sharing.shareAsync(imageUri, {
        mimeType: 'image/png',
        dialogTitle: `Mi Certificado L-ark - #${campaignShortCode}`,
        UTI: 'public.png',
      });
    } catch (error) {
      console.error('Error sharing certificate:', error);
      Alert.alert('Error', 'Could not share certificate');
    }
  }

  /**
   * Guardar en galería
   */
  static async saveToGallery(imageUri: string): Promise<void> {
    try {
      // Solicitar permisos
      const { status } = await MediaLibrary.requestPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permisos requeridos',
          'Necesitamos acceso a tu galería para guardar el certificado'
        );
        return;
      }

      // Guardar
      const asset = await MediaLibrary.createAssetAsync(imageUri);

      // Crear álbum si no existe
      const album = await MediaLibrary.getAlbumAsync('L-ark Certificates');

      if (album) {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      } else {
        await MediaLibrary.createAlbumAsync('L-ark Certificates', asset, false);
      }

      Alert.alert('Guardado', 'Tu certificado se guardó en la galería');
    } catch (error) {
      console.error('Error saving to gallery:', error);
      Alert.alert('Error', 'No se pudo guardar el certificado');
    }
  }

  /**
   * Compartir en redes sociales específicas
   */
  static async shareToSocial(
    imageUri: string,
    platform: 'instagram' | 'facebook' | 'twitter' | 'whatsapp',
    campaignShortCode: string
  ): Promise<void> {
    const message = `He protegido el legado de mi familia con L-ark 💙\n\nCampaña: #${campaignShortCode}\n\nCrea tu propio plan: lark.app`;

    const urls = {
      instagram: `instagram://library?AssetPath=${imageUri}`,
      facebook: `fb://share?quote=${encodeURIComponent(message)}`,
      twitter: `twitter://post?message=${encodeURIComponent(message)}`,
      whatsapp: `whatsapp://send?text=${encodeURIComponent(message)}`,
    };

    // TODO: Implementar deep linking a cada red social
    // Por ahora usamos el share nativo
    await this.share(imageUri, campaignShortCode);
  }

  /**
   * Generar URL de QR Code
   */
  static getQRCodeUrl(campaignShortCode: string, size: number = 200): string {
    const url = `https://lark.app/donate?code=${campaignShortCode}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`;
  }

  static async shareToInstagramStories(imageUri: string, campaignShortCode: string): Promise<void> {
    try {
      // 1. Convertir la imagen a Base64
      // Instagram suele procesar mejor los stickers/fondos recibiendo base64
      // para evitar problemas de permisos de lectura de archivos temporales.
      const base64Data = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const imageBase64 = `data:image/png;base64,${base64Data}`;

      const shareOptions = {
        title: 'Compartir Legado L-Ark',
        social: Social.Instagram,
        url: imageBase64,
        backgroundBottomColor: '#1E3A5F',
        backgroundTopColor: '#0F172A',
        // stickerImage: imageBase64, 
        backgroundImage: imageBase64,
        appId: 'tu_facebook_app_id', // Opcional, pero recomendado si tienes config de FB
      };

      // 2. Ejecutar shareSingle
      await Share.shareSingle(shareOptions);

    } catch (error) {
      console.error('Error sharing to Instagram:', error);
      // Fallback: Si falla el directo, abrimos el genérico
      this.share(imageUri, campaignShortCode);
    }
  }
}
