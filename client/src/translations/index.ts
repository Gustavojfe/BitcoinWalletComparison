import en from './en.json';
import es from './es.json';
import enFeatures from './features/en.json';
import esFeatures from './features/es.json';
import enWallets from './wallets/en.json';
import esWallets from './wallets/es.json';

export type Language = 'en' | 'es';

export interface TranslationMap {
  [key: string]: string | TranslationMap | {
    [key: string]: any;
  };
}

// Merge the feature and wallet translations with the main translations
const mergedEn = {
  ...en,
  ...enFeatures,
  ...enWallets
};

const mergedEs = {
  ...es,
  ...esFeatures,
  ...esWallets
};

export const translations: Record<Language, TranslationMap> = {
  en: mergedEn,
  es: mergedEs
};

export const languageNames: Record<Language, string> = {
  en: 'English',
  es: 'Español'
};

export function getTranslationPath(key: string): string[] {
  return key.split('.');
}

export function getTranslation(lang: Language, key: string): string {
  const keys = getTranslationPath(key);
  let current: any = translations[lang];
  
  // Regular translation lookup
  for (const k of keys) {
    if (!current || !current[k]) {
      // Log missing translation
      console.warn(`Missing translation for ${lang}: ${key}`);
      
      // Fallback to English if key doesn't exist in the selected language
      if (lang !== 'en') {
        return getTranslation('en', key);
      }
      return key; // Return the key itself as fallback
    }
    current = current[k];
  }

  // If the result is an object, it's not a valid translation
  if (typeof current === 'object') {
    // Log missing translation
    console.warn(`Invalid translation (object) for ${lang}: ${key}`);
    
    // Fallback to English if result isn't a string in the selected language
    if (lang !== 'en') {
      return getTranslation('en', key);
    }
    return key; // Return the key itself as fallback
  }
  
  return current as string;
}