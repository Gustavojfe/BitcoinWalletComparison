import React, { useState } from 'react';
import { useLanguage } from '@/hooks/use-language';

const Newsletter = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [subscriptionState, setSubscriptionState] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset state
    setSubscriptionState('idle');
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setSubscriptionState('error');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Send the email to our API endpoint
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to subscribe');
      }
      
      // Success case
      setSubscriptionState('success');
      
      // Wait 3 seconds before clearing the form
      setTimeout(() => {
        setEmail('');
        setSubscriptionState('idle');
      }, 3000);
      
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setSubscriptionState('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-card shadow-md rounded-lg p-6 my-8">
      <div className="max-w-3xl mx-auto">
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
              disabled={isLoading || subscriptionState === 'success'}
              className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 whitespace-nowrap ${
                subscriptionState === 'error' 
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' 
                  : subscriptionState === 'success' 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }`}
            >
              {isLoading ? (
                <span className="animate-pulse">{t('newsletter.submitting')}</span>
              ) : subscriptionState === 'success' ? (
                t('newsletter.successTitle')
              ) : subscriptionState === 'error' ? (
                t('newsletter.invalidEmail')
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
    </div>
  );
};

export default Newsletter;