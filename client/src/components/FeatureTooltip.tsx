import React from 'react';
import { Wallet } from '@/lib/types';
import { useLanguage } from '@/hooks/use-language';

interface FeatureTooltipProps {
  featureName?: string;
  value: string;
  customText?: string;
  wallet?: Wallet;
  children: React.ReactNode;
}

/**
 * FeatureTooltip Component
 * 
 * Provides consistent tooltip handling for feature values across the application.
 * This component normalizes feature values and looks up translations in a consistent way.
 * It dynamically constructs translation keys based on:
 * 1. The normalized feature value
 * 2. Wallet-specific overrides when a wallet is provided
 * 
 * Translation keys follow these formats:
 * - Base key: featureStatus.values.{normalizedValue}
 * - Wallet-specific key: featureStatus.values.{normalizedValue}_{normalized_wallet_name}
 * 
 * Wallet-specific keys take precedence over base keys.
 */
const FeatureTooltip = ({ 
  featureName, 
  value, 
  customText, 
  wallet, 
  children 
}: FeatureTooltipProps) => {
  const { t } = useLanguage();
  
  // Normalize a string to create a valid translation key
  // e.g., "Yes (GitHub)" -> "yes_github" 
  const normalizeKey = (key: string): string => {
    return key
      .trim()
      .toLowerCase()
      .replace(/[^\w\s]/g, '')  // Remove non-alphanumeric characters
      .replace(/\s+/g, '_');    // Replace spaces with underscores
  };
  
  // Determine which value to use for display and tooltips
  const displayValue = (value === 'custom' && customText) ? customText : value;
  
  // Normalize to create a valid translation key for the feature value
  const normalizedKey = normalizeKey(displayValue);
  
  // Create base translation key path
  const baseKey = `featureStatus.values.${normalizedKey}`;
  
  // If wallet is provided, create a wallet-specific key
  let walletSpecificKey = '';
  if (wallet) {
    // Special case for Blink, Phoenix, and Wallet of Satoshi sharing the same tooltip
    if (['Blink', 'Phoenix', 'Wallet of Satoshi'].includes(wallet.name) && normalizedKey === 'limited') {
      walletSpecificKey = `featureStatus.values.limited_blink_phoenix_wos`;
    } else {
      // Normal case: create a wallet-specific key by appending normalized wallet name
      const normalizedWalletName = normalizeKey(wallet.name);
      walletSpecificKey = `featureStatus.values.${normalizedKey}_${normalizedWalletName}`;
    }
  }
  
  // Try wallet-specific key first, then fall back to the base key, then to displayValue
  // This prioritizes more specific translations
  const tooltipText = walletSpecificKey
    ? t(`${walletSpecificKey}.title`, undefined, t(`${baseKey}.title`, undefined, displayValue))
    : t(`${baseKey}.title`, undefined, displayValue);

  return (
    <div
      className="inline-flex items-center justify-center cursor-help"
      title={tooltipText}
      data-tooltip={tooltipText}
    >
      {children}
    </div>
  );
};

export default FeatureTooltip;