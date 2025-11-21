// src/services/sharing.service.ts

import * as Clipboard from 'expo-clipboard';
import { Platform, Share } from 'react-native';
import { Campaign } from '../types/campaign.types';

export interface CampaignShareData {
    shortCode: string;
    title: string;
    description?: string;
    goalAmount?: number;
    currency?: string;
}

export class SharingService {
    private static readonly BASE_URL = 'https://l-ark.app';

    /**
     * Genera el link completo de una campaña
     */
    static generateCampaignLink(shortCode: string): string {
        return `${this.BASE_URL}/campaign/${shortCode}`;
    }

    /**
     * Genera el link con scheme personalizado (para deep linking directo)
     */
    static generateDeepLink(shortCode: string): string {
        return `lark://campaign/${shortCode}`;
    }

    /**
     * Comparte una campaña usando el Share Sheet nativo
     */
    static async shareCampaign(data: Campaign): Promise<boolean> {
        try {
            const url = this.generateCampaignLink(data.short_code);
            let message;
            // Construir mensaje
            message = `Apoya esta campaña en L-ark:\n`;
            message += `${data.title}\n\n`;

            if (data.description) {
                message += `${data.description}\n\n`;
            }

            if (data.goal_amount && data.currency) {
                message += `Meta: ${this.formatAmount(data.goal_amount!, data.currency)}\n\n\n${url}`;
            }

            const result = await Share.share({
                message: Platform.OS === 'ios' ? message : message,
                url: Platform.OS === 'ios' ? url : undefined,
                title: data.title,
            });

            if (result.action === Share.sharedAction) {
return true;
            } else if (result.action === Share.dismissedAction) {
return false;
            }

            return false;
        } catch (error) {
            console.error('❌ Error al compartir campaña:', error);
            throw new Error('No se pudo compartir la campaña');
        }
    }

    /**
     * Copia el link al portapapeles
     */
    static async copyLinkToClipboard(shortCode: string): Promise<void> {
        try {
            const url = this.generateCampaignLink(shortCode);
            await Clipboard.setStringAsync(url);
} catch (error) {
            console.error('❌ Error al copiar link:', error);
            throw new Error('No se pudo copiar el link');
        }
    }

    /**
     * Comparte directamente en WhatsApp
     */
    static async shareToWhatsApp(data: CampaignShareData): Promise<void> {
        try {
            const url = this.generateCampaignLink(data.shortCode);
            const text = encodeURIComponent(
                `${data.title}\n\n${data.description || ''}\n\nApoya esta campaña: ${url}`
            );

            const whatsappUrl = `whatsapp://send?text=${text}`;

            // En tu app, abrirías esto con Linking.openURL(whatsappUrl)
            // pero aquí solo retornamos el URL para que lo uses
} catch (error) {
            console.error('❌ Error al compartir en WhatsApp:', error);
            throw new Error('No se pudo compartir en WhatsApp');
        }
    }

    /**
     * Genera un mensaje personalizado para compartir
     */
    static generateShareMessage(data: CampaignShareData): string {
        const url = this.generateCampaignLink(data.shortCode);
        let message = `🌟 ${data.title}\n\n`;

        if (data.description) {
            message += `${data.description}\n\n`;
        }

        if (data.goalAmount && data.currency) {
            message += `💰 Meta: ${this.formatAmount(data.goalAmount, data.currency)}\n\n`;
        }

        message += `Apoya esta campaña de legado digital en L-ark:\n${url}`;

        return message;
    }

    /**
     * Formatea un monto con su moneda
     */
    private static formatAmount(amount: number, currency: string): string {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    }

    /**
     * Verifica si la app de WhatsApp está instalada
     */
    static async canOpenWhatsApp(): Promise<boolean> {
        try {
            const { Linking } = await import('react-native');
            return await Linking.canOpenURL('whatsapp://');
        } catch {
            return false;
        }
    }
}

// Export singleton por si se necesita
export const sharingService = SharingService;
