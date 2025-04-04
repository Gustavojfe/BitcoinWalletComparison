import { Link, useLocation } from 'wouter';
import { useLanguage } from '@/hooks/use-language';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeSwitcher from './ThemeSwitcher';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const [location] = useLocation();
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
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
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-muted-foreground">{t('common.theme')}</span>
              <ThemeSwitcher />
            </div>
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-muted-foreground">{t('common.language')}</span>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
