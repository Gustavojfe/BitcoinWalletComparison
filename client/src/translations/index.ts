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
  
  // Handle feature values specially to ensure they're properly translated
  if (keys.length === 2 && keys[0] === 'features') {
    const featureKey = keys[1];
    
    // Check if the features section exists in current language
    if (typeof current === 'object' && 
        current !== null && 
        'features' in current && 
        typeof current.features === 'object' && 
        current.features !== null && 
        featureKey in current.features) {
      const featureValue = current.features[featureKey];
      if (typeof featureValue === 'string') {
        return featureValue;
      }
    }
    
    // If we're not in English and the key doesn't exist, fall back to English
    if (lang !== 'en') {
      const enTranslations = translations['en'];
      if (typeof enTranslations === 'object' && 
          enTranslations !== null && 
          'features' in enTranslations && 
          typeof enTranslations.features === 'object' && 
          enTranslations.features !== null && 
          featureKey in enTranslations.features) {
        const enValue = enTranslations.features[featureKey];
        if (typeof enValue === 'string') {
          return enValue;
        }
      }
    }
    
    // If all else fails, return a formatted version of the key
    return featureKey.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }
  
  // Regular translation lookup
  for (const k of keys) {
    if (!current[k]) {
      // Fallback to English if key doesn't exist in the selected language
      if (lang !== 'en') {
        return getTranslation('en', key);
      }
      return key; // Return the key itself as fallback
    }
    current = current[k];
  }
  
  return current as string;
}