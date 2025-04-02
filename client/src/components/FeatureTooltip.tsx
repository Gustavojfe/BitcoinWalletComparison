import React from 'react';
import { Wallet } from '@/lib/types';
import { useLanguage } from '@/hooks/use-language';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FeatureTooltipProps {
  featureName?: string;
  value: string;
  customText?: string;
  wallet?: Wallet;
  children: React.ReactNode;
  title?: string; // Optional title to override the standard tooltip title
}

/**
 * FeatureTooltip Component
 * 
 * Provides consistent tooltip handling for feature values across the application.
 * This component normalizes feature values and looks up translations in a consistent way.
 * It dynamically constructs translation keys based on:
 * 1. Base key: featureStatus.values.{normalizedValue}
 * 2. Wallet-specific key: featureStatus.values.{normalizedValue}_{normalized_wallet_name} (if wallet provided)
 * 
 * Wallet-specific keys take precedence over base keys. For wallets sharing the same tooltip
 * (e.g., "Blink", "Phoenix", "Wallet of Satoshi"), identical translations should be defined
 * in en.json for each wallet-specific key (e.g., limited_blink, limited_phoenix, etc.).
 * 
 * No wallet-specific or feature-specific conditional logic exists in this component,
 * making it fully reusable and scalable. Adding a new wallet with a specific tooltip
 * only requires updating the translation files, not the code.
 * 
 * Uses Radix UI Tooltip for consistent, accessible tooltips that appear above the element.
 */
const FeatureTooltip = ({ 
  featureName, 
  value, 
  customText, 
  wallet, 
  children,
  title: externalTitle 
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
  
  // If an external title is provided, use that instead of going through translations
  if (externalTitle) {
    // Set tooltipText to externalTitle and skip all the translation logic
    const tooltipText = externalTitle;
    return (
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <div
              className="inline-flex items-center justify-center cursor-help"
              title={tooltipText} // Keep native title for fallback
              data-tooltip={tooltipText}
            >
              {children}
            </div>
          </TooltipTrigger>
          <TooltipContent 
            side="top" 
            align="center"
            sideOffset={5}
            className="max-w-[350px] z-[100]"
          >
            <p className="whitespace-normal break-words leading-relaxed">{tooltipText}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  // Determine which value to use for display and tooltips
  const displayValue = (value === 'custom' && customText) ? customText : value;
  
  // Normalize to create a valid translation key for the feature value
  const normalizedKey = normalizeKey(displayValue);
  
  // Create base translation key path
  const baseKey = `featureStatus.values.${normalizedKey}`;
  
  // If wallet is provided, create a wallet-specific key by appending normalized wallet name
  const walletSpecificKey = wallet 
    ? `featureStatus.values.${normalizedKey}_${normalizeKey(wallet.name)}`
    : '';
  
  // Try wallet-specific key first, then fall back to the base key, then to displayValue
  // This prioritizes more specific translations
  let tooltipText = '';
  
  if (walletSpecificKey) {
    // If wallet is provided, first try a key that combines both the feature value and wallet name
    tooltipText = t(`${walletSpecificKey}.title`, undefined, 
      // Fall back to the base key if wallet-specific translation not found
      t(`${baseKey}.title`, undefined, displayValue)
    );
  } else {
    // If no wallet provided, just use the base key
    tooltipText = t(`${baseKey}.title`, undefined, displayValue);
  }

  // Use Radix UI Tooltip for better positioning, but keep native title for fallback
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <div
            className="inline-flex items-center justify-center cursor-help"
            title={tooltipText} // Keep native title for fallback
            data-tooltip={tooltipText}
          >
            {children}
          </div>
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          align="center"
          sideOffset={5}
          className="max-w-[350px] z-[100]"
        >
          <p className="whitespace-normal break-words leading-relaxed">{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default FeatureTooltip;