import enTranslations from './en.json';
import esTranslations from './es.json';

export type Language = 'en' | 'es';

export interface TranslationMap {
  [key: string]: {
    [key: string]: string | TranslationMap
  };
}

export const translations: Record<Language, TranslationMap> = {
  en: enTranslations,
  es: esTranslations
};

export const languageNames: Record<Language, string> = {
  en: 'English',
  es: 'Español'
};

export function getTranslationPath(key: string): string[] {
  return key.split('.');
}

export function getTranslation(lang: Language, key: string): string {
  const path = getTranslationPath(key);
  let result: any = translations[lang];
  
  for (const segment of path) {
    if (result[segment] === undefined) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
    result = result[segment];
  }
  
  if (typeof result !== 'string') {
    console.warn(`Translation key does not resolve to a string: ${key}`);
    return key;
  }
  
  return result;
}