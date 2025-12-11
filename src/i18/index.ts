// src/i18n/index.ts

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

// Importar traducciones
import enCommon from './locales/en/common.json';
// import enAuth from './locales/en/auth.json';
// import enCampaign from './locales/en/campaign.json';
// import enKyc from './locales/en/kyc.json';
// import enVault from './locales/en/vault.json';

import esCommon from './locales/es/common.json';
// import esAuth from './locales/es/auth.json';
// import esCampaign from './locales/es/campaign.json';
// import esKyc from './locales/es/kyc.json';
// import esVault from './locales/es/vault.json';

const LANGUAGE_KEY = '@lark:language';

const getDeviceLanguage = async (): Promise<string> => {
  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (savedLanguage) return savedLanguage;

    const locales = Localization.getLocales();
    const deviceLocale = locales[0]?.languageCode || 'en'; // "es", "en"
    return ['en', 'es'].includes(deviceLocale) ? deviceLocale : 'en';
  } catch {
    return 'en';
  }
};


// Inicializar i18next
i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v4', // Para React Native
    resources: {
      en: {
        common: enCommon,
        // auth: enAuth,
        // campaign: enCampaign,
        // kyc: enKyc,
        // vault: enVault,
      },
      es: {
        common: esCommon,
        // auth: esAuth,
        // campaign: esCampaign,
        // kyc: esKyc,
        // vault: esVault,
      },
    },
    fallbackLng: 'en',
    defaultNS: 'common',
    interpolation: {
      escapeValue: false, // React ya escapa
    },
    react: {
      useSuspense: false,
    },
  });

// Cargar idioma inicial
getDeviceLanguage().then((language) => {
  i18n.changeLanguage(language);
});

// Función para cambiar idioma
export const changeLanguage = async (language: string) => {
  await AsyncStorage.setItem(LANGUAGE_KEY, language);
  await i18n.changeLanguage(language);
};

export default i18n;