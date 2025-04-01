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
 * It can handle wallet-specific tooltips by checking for wallet-specific translation keys.
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
  
  // Normalize to create a valid translation key
  const normalizedKey = normalizeKey(displayValue);
  
  // Try to find wallet-specific translation first (e.g., "limited_bitkit")
  let tooltipText = '';
  let tooltipLabel = '';
  
  if (wallet && featureName === 'availability') {
    // Special cases for limited availability
    if (value === 'limited') {
      if (['Blink', 'Phoenix', 'Wallet of Satoshi'].includes(wallet.name)) {
        // Try wallet-group specific translation
        tooltipLabel = t(`featureStatus.values.limited_blink_phoenix_wos.label`, undefined, '');
        tooltipText = t(`featureStatus.values.limited_blink_phoenix_wos.title`, undefined, '');
      } else if (wallet.name === 'Bitkit') {
        // Try wallet-specific translation
        tooltipLabel = t(`featureStatus.values.limited_bitkit.label`, undefined, '');
        tooltipText = t(`featureStatus.values.limited_bitkit.title`, undefined, '');
      }
    }
  }
  
  // If no wallet-specific tooltip was found, try generic value translation
  if (!tooltipText) {
    const translationKey = `featureStatus.values.${normalizedKey}`;
    tooltipText = t(`${translationKey}.title`, undefined, displayValue);
    tooltipLabel = t(`${translationKey}.label`, undefined, displayValue);
  }

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