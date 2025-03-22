import { Feature, FeatureValue, WalletType } from './types';

/**
 * Gets a display label for a feature value
 * @param value The feature value
 * @param customText Optional custom text for custom values
 * @returns A human-readable representation of the feature value
 */
export const getFeatureValueDisplay = (value: FeatureValue, customText?: string): string => {
  switch (value) {
    case 'yes':
      return 'Yes';
    case 'no':
      return 'No';
    case 'partial':
      return 'Partial';
    case 'custom':
      return customText || 'Custom';
    default:
      return 'Unknown';
  }
};

/**
 * Gets CSS classes for styling feature values
 * @param value The feature value
 * @returns CSS class names for the feature value indicator
 */
export const getFeatureValueClasses = (value: FeatureValue): { 
  bgColor: string; 
  textColor: string;
} => {
  switch (value) {
    case 'yes':
      return { bgColor: 'bg-green-100', textColor: 'text-green-600' };
    case 'no':
      return { bgColor: 'bg-red-100', textColor: 'text-red-600' };
    case 'partial':
    case 'custom':
      return { bgColor: 'bg-amber-100', textColor: 'text-amber-700' };
    default:
      return { bgColor: 'bg-gray-100', textColor: 'text-gray-700' };
  }
};

/**
 * Categorizes features into groups for better organization in UI
 * @param features List of features to categorize
 * @returns Object with features grouped by category
 */
export const categorizeFeatures = (features: Feature[]): { [key: string]: Feature[] } => {
  const categories: { [key: string]: Feature[] } = {
    'basic': [],
    'advanced': [],
    'security': [],
    'usability': [],
    'other': []
  };

  // Attempt to categorize features based on their name/description
  features.forEach(feature => {
    if (feature.name.toLowerCase().includes('chain') || 
        feature.name.toLowerCase().includes('invoice') ||
        feature.name.toLowerCase().includes('bolt')) {
      categories.basic.push(feature);
    } else if (feature.name.toLowerCase().includes('routing') || 
              feature.name.toLowerCase().includes('channel') ||
              feature.name.toLowerCase().includes('liquidity') ||
              feature.name.toLowerCase().includes('mpp')) {
      categories.advanced.push(feature);
    } else if (feature.name.toLowerCase().includes('seed') || 
              feature.name.toLowerCase().includes('dns')) {
      categories.security.push(feature);
    } else if (feature.name.toLowerCase().includes('lnurl') || 
              feature.name.toLowerCase().includes('address')) {
      categories.usability.push(feature);
    } else {
      categories.other.push(feature);
    }
  });

  // Remove empty categories
  Object.keys(categories).forEach(key => {
    if (categories[key].length === 0) {
      delete categories[key];
    }
  });

  return categories;
};

/**
 * Get the recommended key features for a specific wallet type
 * @param type Wallet type
 * @returns Array of key feature names for the wallet type
 */
export const getKeyFeatures = (type: WalletType): string[] => {
  switch (type) {
    case 'lightning':
      return [
        'On-Chain',
        'Invoice',
        'Lightning Address',
        'LNURL(s)',
        'Manage Own Channels',
        'Payment Routing'
      ];
    case 'onchain':
      return [
        'Segwit Support',
        'RBF Support',
        'Coin Control',
        'Multiple Accounts',
        'Multisig'
      ];
    case 'hardware':
      return [
        'Secure Element',
        'Open Source',
        'Supports Multisig',
        'Air-gapped Option',
        'Pin Protection'
      ];
    default:
      return [];
  }
};

/**
 * Sort features by their logical grouping and importance
 * @param features List of features to sort
 * @param type Wallet type
 * @returns Sorted feature list
 */
export const sortFeaturesByImportance = (features: Feature[], type: WalletType): Feature[] => {
  // Get key features for this wallet type
  const keyFeatures = getKeyFeatures(type);
  
  return [...features].sort((a, b) => {
    // First sort by their predefined order
    if (a.order !== b.order) {
      return a.order - b.order;
    }
    
    // Then prioritize key features
    const aIsKey = keyFeatures.includes(a.name);
    const bIsKey = keyFeatures.includes(b.name);
    
    if (aIsKey && !bIsKey) return -1;
    if (!aIsKey && bIsKey) return 1;
    
    // Finally sort alphabetically
    return a.name.localeCompare(b.name);
  });
};
