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
    [key: string]: FeatureValue | { value: FeatureValue; customText: string };
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
  featureValue: FeatureValue | { value: FeatureValue; customText: string }
): InsertWalletFeature {
  if (typeof featureValue === 'string') {
    return {
      walletId,
      featureId,
      value: featureValue
    };
  } else {
    return {
      walletId,
      featureId,
      value: featureValue.value,
      customText: featureValue.customText
    };
  }
}

// Find a feature ID by its string ID
export function findFeatureIdByStringId(features: Feature[], stringId: string): number | undefined {
  const feature = features.find(f => f.name.toLowerCase().replace(/[^a-z0-9]/g, '') === stringId.toLowerCase());
  return feature?.id;
}

// Convert a feature name to a string ID
export function featureNameToStringId(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}