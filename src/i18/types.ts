export const languages = {
  en: { label: 'English', flag: '🇺🇸' },
  es: { label: 'Español', flag: '🇪🇸' },
} as const;

export type Language = keyof typeof languages;

// Para autocompletado de keys
import enCommon from './locales/en/common.json';

export type CommonTranslations = typeof enCommon;
