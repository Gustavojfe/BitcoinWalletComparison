import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, getTranslation, languageNames } from '../translations';
import { Feature, FeatureValue, Wallet } from '../lib/types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  translateFeature: (feature: Feature) => { name: string; description: string };
  translateWallet: (wallet: Wallet) => { name: string; description: string };
  translateFeatureValue: (value: FeatureValue) => string;
  availableLanguages: Language[];
  languageNames: Record<Language, string>;
}

const defaultLanguage: Language = 'en';

const LanguageContext = createContext<LanguageContextType>({
  language: defaultLanguage,
  setLanguage: () => {},
  t: (key: string) => key,
  translateFeature: (feature) => ({ name: feature.name, description: feature.description }),
  translateWallet: (wallet) => ({ name: wallet.name, description: wallet.description }),
  translateFeatureValue: (value) => String(value),
  availableLanguages: ['en', 'es'],
  languageNames
});

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Try to get stored language from localStorage or use browser language
  const getInitialLanguage = (): Language => {
    if (typeof window === 'undefined') return defaultLanguage;
    
    const storedLanguage = localStorage.getItem('language') as Language;
    if (storedLanguage && ['en', 'es'].includes(storedLanguage)) {
      return storedLanguage;
    }
    
    // Try to use browser language
    const browserLang = navigator.language.split('-')[0];
    if (browserLang === 'es') return 'es';
    
    return defaultLanguage;
  };

  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  // Update localStorage when language changes
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    
    // Optional: Set lang attribute on html element
    document.documentElement.setAttribute('lang', lang);
  };

  // Initialize language on mount
  useEffect(() => {
    document.documentElement.setAttribute('lang', language);
  }, []);

  // Translation function
  const t = (key: string): string => {
    return getTranslation(language, key);
  };

  // Feature translation function
  const translateFeature = (feature: Feature) => {
    // Look up translation by feature name exactly as it appears in the data files
    const translatedName = getTranslation(language, `features.${feature.name}.name`) || feature.name;
    const translatedDescription = getTranslation(language, `features.${feature.name}.description`) || feature.description;
    
    return {
      name: translatedName,
      description: translatedDescription
    };
  };

  // Wallet translation function
  const translateWallet = (wallet: Wallet) => {
    // Look up translation by wallet name exactly as it appears in the data files
    const translatedName = getTranslation(language, `wallets.${wallet.name}.name`) || wallet.name;
    const translatedDescription = getTranslation(language, `wallets.${wallet.name}.description`) || wallet.description;
    
    return {
      name: translatedName,
      description: translatedDescription
    };
  };

  // Feature value translation function
  const translateFeatureValue = (value: FeatureValue): string => {
    // First check if there's a specific translation for this feature value
    const featureTranslation = getTranslation(language, `features.${value}`);
    if (featureTranslation) {
      return featureTranslation;
    }
    
    // Fall back to common translations for standard values
    switch (value) {
      case 'yes':
        return t('common.yes');
      case 'no':
        return t('common.no');
      case 'partial':
        return t('common.partial');
      case 'custom':
        return t('common.custom');
      case 'mandatory':
        return t('common.mandatory') || 'Mandatory';
      case 'optional':
        return t('common.optional') || 'Optional';
      case 'not_possible':
        return t('common.not_possible') || 'Not Possible';
      case 'send_only':
        return t('common.send_only') || 'Send Only';
      case 'receive_only':
        return t('common.receive_only') || 'Receive Only';
      default:
        // Return the value as is if no translation found
        return String(value);
    }
  };

  const value = {
    language,
    setLanguage,
    t,
    translateFeature,
    translateWallet,
    translateFeatureValue,
    availableLanguages: ['en', 'es'] as Language[],
    languageNames
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);