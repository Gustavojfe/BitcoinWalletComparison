import { Wallet, WalletType } from './types';

// This file contains helper functions to work with wallet data
// The actual wallet data is stored in the backend and fetched via API

/**
 * Creates a logo key for a wallet to be used with react-icons
 * @param walletName The name of the wallet
 * @returns A normalized logo key 
 */
export const walletLogoKey = (walletName: string): string => {
  return walletName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '') // Remove special characters
    .replace(/\s+/g, ''); // Remove spaces
};

/**
 * Returns the URL for a wallet's website
 * @param wallet The wallet object
 * @returns The formatted website URL for display
 */
export const getDisplayWebsite = (wallet: Wallet): string => {
  try {
    const url = new URL(wallet.website);
    return url.hostname.replace(/^www\./, '');
  } catch (error) {
    return wallet.website;
  }
};

/**
 * Returns a truncated description for display in tables/cards
 * @param description The full description
 * @param maxLength Maximum length before truncation
 * @returns Truncated description with ellipsis
 */
export const getTruncatedDescription = (description: string, maxLength: number = 100): string => {
  if (description.length <= maxLength) return description;
  return `${description.substring(0, maxLength).trim()}...`;
};

/**
 * Gets a human-readable wallet type for display
 * @param type The wallet type
 * @returns Formatted wallet type
 */
export const getWalletTypeDisplay = (type: WalletType): string => {
  switch (type) {
    case 'lightning':
      return 'Lightning';
    case 'onchain':
      return 'On-Chain';
    case 'hardware':
      return 'Hardware';
    default:
      return 'Unknown';
  }
};

/**
 * Provides a standard text summary of a wallet's capabilities
 * @param wallet The wallet object
 * @returns A standardized summary string
 */
export const getWalletSummary = (wallet: Wallet): string => {
  let typeLabel = '';
  
  switch (wallet.type) {
    case 'lightning':
      typeLabel = 'Lightning';
      break;
    case 'onchain':
      typeLabel = 'On-Chain';
      break;
    case 'hardware':
      typeLabel = 'Hardware';
      break;
  }
  
  return `${wallet.name} is a ${typeLabel} Bitcoin wallet. ${wallet.description}`;
};
