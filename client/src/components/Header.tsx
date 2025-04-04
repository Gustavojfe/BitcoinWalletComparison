import { Link, useLocation } from 'wouter';
import { useLanguage } from '@/hooks/use-language';
import { useTheme } from '@/hooks/use-theme';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeSwitcher from './ThemeSwitcher';
import { useState } from 'react';
import { Menu, X, Moon, Sun, Monitor, Globe } from 'lucide-react';

const Header = () => {
  const [location] = useLocation();
  const { t, language, setLanguage, availableLanguages, languageNames } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showThemeOptions, setShowThemeOptions] = useState(false);
  const [showLanguageOptions, setShowLanguageOptions] = useState(false);
  
  return (
    <header className="bg-card shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <span className="font-bold text-xl text-primary">{t('header.title')}</span>
              </Link>
            </div>
            {/* Desktop Navigation - Hidden on mobile */}
            <nav className="ml-6 hidden md:flex space-x-8" aria-label="Main Navigation">
              <Link href="/" className={`${location === '/' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'} border-b-2 inline-flex items-center px-1 pt-1 font-medium`}>
                {t('common.compare')}
              </Link>
              <Link href="/about" className={`${location === '/about' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'} border-b-2 inline-flex items-center px-1 pt-1 font-medium`}>
                {t('common.about')}
              </Link>
            </nav>
          </div>
          
          {/* Desktop Controls - Hidden on mobile */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeSwitcher />
            <LanguageSwitcher />
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              type="button"
              className="text-foreground p-2 rounded-md"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <span className="sr-only">{mobileMenuOpen ? 'Close menu' : 'Open menu'}</span>
              {mobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {mobileMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 border-t border-border">
            <Link
              href="/"
              className={`${
                location === '/' ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-accent'
              } block px-3 py-2 rounded-md text-base font-medium`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('common.compare')}
            </Link>
            <Link
              href="/about"
              className={`${
                location === '/about' ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-accent'
              } block px-3 py-2 rounded-md text-base font-medium`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('common.about')}
            </Link>
            {/* Theme Section */}
            <div className="border-t border-border mt-2 pt-2">
              <div 
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-accent rounded-md"
                onClick={() => setShowThemeOptions(!showThemeOptions)}
              >
                <div className="flex items-center">
                  {theme === 'dark' ? (
                    <Moon className="h-5 w-5 mr-3" />
                  ) : theme === 'light' ? (
                    <Sun className="h-5 w-5 mr-3" />
                  ) : (
                    <Monitor className="h-5 w-5 mr-3" />
                  )}
                  <span className="font-medium">{t('common.theme')}</span>
                </div>
                <div>
                  {showThemeOptions ? 
                    <X className="h-4 w-4" /> : 
                    <span className="text-sm text-muted-foreground">{t(`theme.${theme}`)}</span>
                  }
                </div>
              </div>

              {/* Theme Options */}
              {showThemeOptions && (
                <div className="mt-1 ml-4 space-y-1">
                  <div 
                    className={`flex items-center p-2 rounded-md cursor-pointer ${theme === 'light' ? 'bg-primary/10 text-primary' : 'hover:bg-accent'}`}
                    onClick={() => {
                      setTheme('light');
                      setShowThemeOptions(false);
                    }}
                  >
                    <Sun className="h-4 w-4 mr-2" />
                    <span>{t('theme.light')}</span>
                  </div>
                  <div 
                    className={`flex items-center p-2 rounded-md cursor-pointer ${theme === 'dark' ? 'bg-primary/10 text-primary' : 'hover:bg-accent'}`}
                    onClick={() => {
                      setTheme('dark');
                      setShowThemeOptions(false);
                    }}
                  >
                    <Moon className="h-4 w-4 mr-2" />
                    <span>{t('theme.dark')}</span>
                  </div>
                  <div 
                    className={`flex items-center p-2 rounded-md cursor-pointer ${theme === 'system' ? 'bg-primary/10 text-primary' : 'hover:bg-accent'}`}
                    onClick={() => {
                      setTheme('system');
                      setShowThemeOptions(false);
                    }}
                  >
                    <Monitor className="h-4 w-4 mr-2" />
                    <span>{t('theme.system')}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Language Section */}
            <div className="mt-2">
              <div 
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-accent rounded-md"
                onClick={() => setShowLanguageOptions(!showLanguageOptions)}
              >
                <div className="flex items-center">
                  <Globe className="h-5 w-5 mr-3" />
                  <span className="font-medium">{t('common.language')}</span>
                </div>
                <div>
                  {showLanguageOptions ? 
                    <X className="h-4 w-4" /> : 
                    <span className="text-sm text-muted-foreground">{languageNames[language]}</span>
                  }
                </div>
              </div>

              {/* Language Options */}
              {showLanguageOptions && (
                <div className="mt-1 ml-4 space-y-1">
                  {availableLanguages.map((lang) => (
                    <div 
                      key={lang}
                      className={`flex items-center p-2 rounded-md cursor-pointer ${language === lang ? 'bg-primary/10 text-primary' : 'hover:bg-accent'}`}
                      onClick={() => {
                        setLanguage(lang);
                        setShowLanguageOptions(false);
                      }}
                    >
                      <span>{languageNames[lang]}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
