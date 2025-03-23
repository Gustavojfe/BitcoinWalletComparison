import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ThemeMode = 'dark' | 'light' | 'system';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  setTheme: () => {},
  isDarkMode: false,
});

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const getInitialTheme = (): ThemeMode => {
    if (typeof window === 'undefined') return 'system';
    
    const storedTheme = localStorage.getItem('theme') as ThemeMode;
    if (storedTheme && ['dark', 'light', 'system'].includes(storedTheme)) {
      return storedTheme;
    }
    
    return 'system';
  };

  const [theme, setThemeState] = useState<ThemeMode>(getInitialTheme);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    localStorage.setItem('theme', mode);
  };

  useEffect(() => {
    const updateTheme = () => {
      const root = window.document.documentElement;
      
      let dark = false;
      
      if (theme === 'system') {
        dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      } else {
        dark = theme === 'dark';
      }
      
      setIsDarkMode(dark);
      
      if (dark) {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
      }
    };

    updateTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        updateTheme();
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);