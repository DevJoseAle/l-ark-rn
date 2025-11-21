// src/hooks/useDeepLinking.ts

import { useAuthStore } from '@/src/stores/authStore';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { useEffect } from 'react';

export function useDeepLinking() {
  const isAuthenticated = useAuthStore((state) => !!state.user);

  useEffect(() => {
    // 1. Manejar link cuando la app se abre desde un link
    const handleInitialURL = async () => {
      try {
        const initialUrl = await Linking.getInitialURL();

        if (initialUrl) {
          handleDeepLink(initialUrl);
        }
      } catch (error) {
        console.error('❌ Error obteniendo URL inicial:', error);
      }
    };

    // 2. Manejar links cuando la app ya está abierta
    const handleUrlEvent = (event: { url: string }) => {
      handleDeepLink(event.url);
    };

    // Listener para links
    const subscription = Linking.addEventListener('url', handleUrlEvent);

    // Verificar si hay link inicial
    handleInitialURL();

    // Cleanup
    return () => {
      subscription.remove();
    };
  }, [isAuthenticated]);

  /**
   * Procesa el deep link y navega a la pantalla correcta
   */
  const handleDeepLink = (url: string) => {
    try {
      // Parsear URL
      const { hostname, path, queryParams } = Linking.parse(url);

      // Verificar si es un link de campaña
      if (hostname === 'campaign' || path?.includes('campaign')) {
        // Extraer campaign ID
        let campaignId: string | null = null;

        // Formato: lark://campaign/[ID]
        if (hostname === 'campaign' && path) {
          campaignId = path.replace('/', '');
        }

        // Formato: https://lark.app/campaign/[ID]
        if (path?.includes('campaign/')) {
          campaignId = path.split('campaign/')[1];
        }

        // Query params: ?campaignId=xxx
        if (queryParams?.campaignId) {
          campaignId = queryParams.campaignId as string;
        }

        if (campaignId) {
          navigateToCampaign(campaignId);
        } else {
          console.warn('⚠️ No se pudo extraer campaign ID del link');
        }
      }
    } catch (error) {
      console.error('❌ Error procesando deep link:', error);
    }
  };

  /**
   * Navega a la pantalla de campaña
   */
  const navigateToCampaign = (campaignId: string) => {
    // Verificar autenticación
    if (!isAuthenticated) {
      // Guardar el campaignId para después del login
      // Podrías usar AsyncStorage para persistir esto
      router.push({
        pathname: '/(public)/welcome',
        params: { redirect: `/campaign/${campaignId}` },
      });
      return;
    }

    // Usuario autenticado, ir directamente a la campaña
    router.push(`/(auth)/campaign/${campaignId}`);
  };
}

/**
 * Genera un deep link para una campaña
 */
export function generateCampaignLink(campaignId: string): string {
  // Link scheme (funciona si la app está instalada)
  return `lark://campaign/${campaignId}`;
}

/**
 * Genera un link universal (funciona con o sin app)
 * Requiere dominio configurado
 */
export function generateUniversalLink(campaignId: string): string {
  // Si tienes dominio:
  return `https://lark.app/campaign/${campaignId}`;

  // Si NO tienes dominio, usar scheme:
  // return `lark://campaign/${campaignId}`;
}

/**
 * Genera un link compartible con información adicional
 */
export function generateShareableLink(
  campaignId: string,
  options?: {
    source?: string; // 'whatsapp' | 'instagram' | 'facebook'
    referrerId?: string; // userId que comparte
  }
): string {
  const baseUrl = `lark://campaign/${campaignId}`;

  const params = new URLSearchParams();

  if (options?.source) {
    params.append('source', options.source);
  }

  if (options?.referrerId) {
    params.append('ref', options.referrerId);
  }

  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}
