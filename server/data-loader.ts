import fs from 'fs';
import path from 'path';
import { FeatureValue, InsertFeature, InsertWallet, InsertWalletFeature, Wallet, Feature, WalletFeature } from '../shared/schema';

interface WalletFileFormat {
  name: string;
  website: string;
  description: string;
  type: "lightning" | "onchain" | "hardware";
  logo: string;
  order: number;
  features: {
    [key: string]: FeatureValue | FeatureValue[] | { value: FeatureValue; customText: string };
  };
}

interface FeatureFileFormat {
  id: string;
  name: string;
  description: string;
  type: "lightning" | "onchain" | "hardware";
  order: number;
}

// Get a list of all wallet JSON files
export function getWalletFiles(): string[] {
  const walletDir = path.join(process.cwd(), 'data', 'wallets');
  if (!fs.existsSync(walletDir)) {
    return [];
  }
  
  return fs.readdirSync(walletDir)
    .filter(file => file.endsWith('.json'))
    .map(file => path.join(walletDir, file));
}

// Get a list of all feature JSON files
export function getFeatureFiles(): string[] {
  const featureDir = path.join(process.cwd(), 'data', 'features');
  if (!fs.existsSync(featureDir)) {
    return [];
  }
  
  return fs.readdirSync(featureDir)
    .filter(file => file.endsWith('.json'))
    .map(file => path.join(featureDir, file));
}

// Load wallet from file
export function loadWalletFromFile(filePath: string): WalletFileFormat | null {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(fileContent) as WalletFileFormat;
  } catch (error) {
    console.error(`Error loading wallet from ${filePath}:`, error);
    return null;
  }
}

// Load features from file
export function loadFeaturesFromFile(filePath: string): FeatureFileFormat[] {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(fileContent) as FeatureFileFormat[];
  } catch (error) {
    console.error(`Error loading features from ${filePath}:`, error);
    return [];
  }
}

// Helper function to convert WalletFileFormat to InsertWallet
export function walletFileToInsertWallet(wallet: WalletFileFormat): InsertWallet {
  return {
    name: wallet.name,
    website: wallet.website,
    description: wallet.description,
    type: wallet.type,
    logo: wallet.logo,
    order: wallet.order
  };
}

// Helper function to convert FeatureFileFormat to InsertFeature
export function featureFileToInsertFeature(feature: FeatureFileFormat): InsertFeature {
  return {
    name: feature.name,
    description: feature.description,
    type: feature.type,
    order: feature.order
  };
}

// Create the wallet-feature relationship
export function createWalletFeature(
  walletId: number,
  featureId: number,
  featureValue: FeatureValue | FeatureValue[] | { value: FeatureValue; customText: string }
): InsertWalletFeature {
  // Handle object with custom text
  if (typeof featureValue === 'object' && !Array.isArray(featureValue) && 'value' in featureValue) {
    return {
      walletId,
      featureId,
      value: featureValue.value,
      customText: featureValue.customText
    };
  } 
  // Handle array of values (like platform)
  else if (Array.isArray(featureValue)) {
    // Join array values with commas to store in database
    // We'll parse this back into an array on the client side
    return {
      walletId,
      featureId,
      value: 'custom', // Using custom as indicator that this is a multi-value
      customText: featureValue.join(',')
    };
  } 
  // Handle simple string values
  else {
    return {
      walletId,
      featureId,
      value: featureValue
    };
  }
}

// Find a feature ID by its string ID
export function findFeatureIdByStringId(features: Feature[], stringId: string): number | undefined {
  // Get normalized string ID
  const normalizedId = stringId.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Try to find exact match first
  const exactMatch = features.find(f => 
    featureNameToStringId(f.name) === normalizedId || 
    // Check common variations
    f.name.toLowerCase().replace(/[^a-z0-9]/g, '_') === stringId.toLowerCase() ||
    f.name.toLowerCase().replace(/[\s-]/g, '_') === stringId.toLowerCase()
  );
  
  if (exactMatch) {
    return exactMatch.id;
  }
  
  // Log available features when a match is not found
  console.warn(`Feature ${stringId} not found for wallet. Available features: ${features.map(f => 
    featureNameToStringId(f.name) + ', ' + 
    f.name.toLowerCase().replace(/[^a-z0-9]/g, '_') + ', ' + 
    f.name.toLowerCase().replace(/[\s-]/g, '_')
  ).join(', ')}`);
  
  // For new feature structure, map old feature names to new ones
  const featureMap: Record<string, string> = {
    'onchain': 'onchainSupport',
    'receiveonchain': 'onchainSupport',
    'sendonchain': 'onchainSupport',
    'invoice': 'bolt11Support',
    'bolt11': 'bolt11Support',
    'lnurl': 'lnurlSupport',
    'lightningaddress': 'lightningAddressSupport',
    'dnsseeds': 'hrnBlip32Support',
    'paymentrouting': 'channelManagement',
    'mpp': 'mppSupport',
    'manageownchannels': 'channelManagement',
    'lowincoming': 'channelManagement'
  };
  
  // Check if we have a mapping for this old feature name
  if (featureMap[normalizedId]) {
    const mappedFeature = features.find(f => 
      featureNameToStringId(f.name) === featureMap[normalizedId] ||
      f.name.toLowerCase().replace(/[^a-z0-9]/g, '_') === featureMap[normalizedId] ||
      f.name.toLowerCase().replace(/[\s-]/g, '_') === featureMap[normalizedId]
    );
    
    if (mappedFeature) {
      return mappedFeature.id;
    }
  }
  
  return undefined;
}

// Convert a feature name to a string ID
export function featureNameToStringId(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}