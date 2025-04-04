import { Feature, FeatureValue, WalletType } from './types';

/**
 * Gets a display label for a feature value
 * @param value The feature value
 * @param customText Optional custom text for custom values
 * @returns A human-readable representation of the feature value
 */
export const getFeatureValueDisplay = (value: FeatureValue, customText?: string): string => {
  switch (value) {
    // Standard values
    case 'yes':
      return 'Yes';
    case 'no':
      return 'No';
    case 'partial':
      return 'Partial';
    case 'custom':
      return customText || 'Custom';
    
    // Platform types
    case 'ios':
      return 'iOS';
    case 'android':
      return 'Android';
    case 'desktop':
      return 'Desktop';
    case 'web':
      return 'Web';
    
    // Transactional capabilities
    case 'send_only':
      return 'Send Only';
    case 'receive_only':
      return 'Receive Only';
    
    // Channel management
    case 'mandatory':
      return 'Mandatory';
    case 'optional':
      return 'Optional';
    case 'not_possible':
      return 'Not Possible';
    
    // Wallet types
    case 'custodial':
      return 'Custodial';
    case 'ln_node':
      return 'LN Node';
    case 'liquid_swap':
      return 'Liquid Swap';
    case 'on_chain_swap':
      return 'On-Chain Swap';
    case 'remote_node':
      return 'Remote Node';
    
    // Lightning implementations
    case 'lnd':
      return 'LND';
    case 'ldk':
      return 'LDK';
    case 'core_lightning':
      return 'Core Lightning';
    case 'eclair':
      return 'Eclair';
    
    default:
      return String(value).replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
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
  // Positive values
  if (['yes', 'ios', 'android', 'desktop', 'web', 'optional'].includes(value)) {
    return { bgColor: 'bg-green-100', textColor: 'text-green-600' };
  }
  
  // Negative values
  if (['no', 'not_possible'].includes(value)) {
    return { bgColor: 'bg-red-100', textColor: 'text-red-600' };
  }
  
  // Values we want displayed as regular text (no special styling)
  if (['send_only', 'api', 'lnd', 'cln', 'core_lightning'].includes(value.toLowerCase())) {
    return { bgColor: '', textColor: 'text-foreground' };
  }
  
  // Wallet types (purple)
  if (['custodial', 'ln_node', 'liquid_swap', 'on_chain_swap', 'remote_node'].includes(value)) {
    return { bgColor: 'bg-purple-100', textColor: 'text-purple-600' };
  }
  
  // Partial values (amber/yellow)
  if (['partial', 'custom', 'receive_only', 'mandatory'].includes(value)) {
    return { bgColor: 'bg-amber-100', textColor: 'text-amber-700' };
  }
  
  // Default for any other value
  return { bgColor: 'bg-gray-100', textColor: 'text-gray-700' };
};

/**
 * Categorizes features into groups for better organization in UI
 * @param features List of features to categorize
 * @returns Object with features grouped by category
 */
export const categorizeFeatures = (features: Feature[]): { [key: string]: Feature[] } => {
  const categories: { [key: string]: Feature[] } = {
    'wallet_info': [],
    'platform': [],
    'technical': [],
    'interface': [],
    'lightning': [],
    'other': []
  };

  // Categorize features based on their name/id
  features.forEach(feature => {
    const lowerName = feature.name.toLowerCase();
    const id = feature.id?.toString().toLowerCase() || '';
    
    // Wallet info category
    if (lowerName.includes('open-source') || 
        lowerName.includes('kyc') || 
        lowerName.includes('type of wallet') ||
        id === 'opensource' || 
        id === 'kyc' || 
        id === 'wallettype') {
      categories.wallet_info.push(feature);
    } 
    // Platform category
    else if (lowerName.includes('platform')) {
      categories.platform.push(feature);
    } 
    // Lightning features
    else if (lowerName.includes('bolt') || 
             lowerName.includes('lightning') || 
             lowerName.includes('lnurl') || 
             lowerName.includes('mpp') ||
             lowerName.includes('channel')) {
      categories.lightning.push(feature);
    } 
    // Technical features
    else if (lowerName.includes('implementation') || 
             lowerName.includes('blip32') || 
             lowerName.includes('on-chain')) {
      categories.technical.push(feature);
    } 
    // Interface features
    else if (lowerName.includes('interface') || 
             lowerName.includes('address')) {
      categories.interface.push(feature);
    } 
    // Fallback for other features
    else {
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
        'Platform',
        'Open-Source',
        'KYC',
        'Type of Wallet',
        'On-Chain Support',
        'Lightning Address Support',
        'LNURL Support',
        'Channel Management'
      ];
    case 'onchain':
      return [
        'Platform',
        'Open-Source',
        'KYC',
        'Segwit Support',
        'RBF Support',
        'Coin Control'
      ];
    case 'hardware':
      return [
        'Platform',
        'Open-Source',
        'Secure Element',
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
