import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, getTranslation, languageNames } from '../translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  availableLanguages: Language[];
  languageNames: Record<Language, string>;
}

const defaultLanguage: Language = 'en';

const LanguageContext = createContext<LanguageContextType>({
  language: defaultLanguage,
  setLanguage: () => {},
  t: (key: string) => key,
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

  const value = {
    language,
    setLanguage,
    t,
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

export default useLanguage;