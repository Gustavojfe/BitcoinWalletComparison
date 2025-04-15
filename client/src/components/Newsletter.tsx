import React, { useState } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { useToast } from '@/hooks/use-toast';

const Newsletter = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: t('newsletter.errorTitle'),
        description: t('newsletter.invalidEmail'),
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // For now, we'll just show a success message
      // In a real implementation, you would send this to a server
      // const response = await fetch('/api/newsletter', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email }),
      // });
      
      // if (!response.ok) throw new Error('Failed to subscribe');
      
      // Success case
      toast({
        title: t('newsletter.successTitle'),
        description: t('newsletter.successMessage'),
      });
      
      // Clear the input
      setEmail('');
    } catch (error) {
      toast({
        title: t('newsletter.errorTitle'),
        description: t('newsletter.errorMessage'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-card shadow-md rounded-lg p-6 my-8">
      <h3 className="text-xl font-bold mb-3">{t('newsletter.title')}</h3>
      <p className="text-muted-foreground mb-4">{t('newsletter.description')}</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('newsletter.placeholder')}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isLoading}
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            {isLoading ? (
              <span className="animate-pulse">{t('newsletter.submitting')}</span>
            ) : (
              t('newsletter.subscribe')
            )}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          {t('newsletter.privacyNotice')}
        </p>
      </form>
    </div>
  );
};

export default Newsletter;