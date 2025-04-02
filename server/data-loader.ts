import fs from 'fs';
import path from 'path';
import { FeatureValue, FeatureCategory, InsertFeature, InsertWallet, InsertWalletFeature, Wallet, Feature, WalletFeature } from '../shared/schema';

// Extended wallet file format with new fields from CSV
interface WalletFileFormat {
  name: string;
  website: string;
  description: string;
  type: "lightning" | "onchain" | "hardware";
  logo: string;
  order: number;
  availability?: string; // From CSV: Restricted in USA, etc.
  category?: string; // From CSV: Custodial, On-Chain Wallet, etc.
  features: {
    [key: string]: FeatureValue | FeatureValue[] | { 
      value: FeatureValue; 
      customText?: string;
      referenceLink?: string;
      notes?: string;
    };
  };
}

// Extended feature file format with new fields from CSV
interface FeatureFileFormat {
  id: string;
  name: string;
  description: string;
  type: "lightning" | "onchain" | "hardware";
  category?: FeatureCategory; // From CSV: basics, recover, ln_formats, etc.
  order: number;
  infoLink?: string; // For additional information links about the feature
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
    availability: wallet.availability || null,
    category: wallet.category || null,
    order: wallet.order
  };
}

// Helper function to convert FeatureFileFormat to InsertFeature
export function featureFileToInsertFeature(feature: FeatureFileFormat): InsertFeature {
  return {
    name: feature.name,
    description: feature.description,
    type: feature.type,
    category: feature.category || null,
    order: feature.order,
    infoLink: feature.infoLink || null
  };
}

// Create the wallet-feature relationship
export function createWalletFeature(
  walletId: number,
  featureId: number,
  featureValue: FeatureValue | FeatureValue[] | { 
    value: FeatureValue; 
    customText?: string;
    referenceLink?: string;
    notes?: string;
  }
): InsertWalletFeature {
  // Handle object with custom text and additional fields
  if (typeof featureValue === 'object' && !Array.isArray(featureValue) && 'value' in featureValue) {
    return {
      walletId,
      featureId,
      value: featureValue.value,
      customText: featureValue.customText || null,
      referenceLink: featureValue.referenceLink || null,
      notes: featureValue.notes || null
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
      customText: featureValue.join(','),
      referenceLink: null,
      notes: null
    };
  } 
  // Handle simple string values
  else {
    return {
      walletId,
      featureId,
      value: featureValue,
      customText: null,
      referenceLink: null,
      notes: null
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
  
  // Map feature names from CSV format to our system
  const featureMap: Record<string, string> = {
    // Basic mappings
    'platform': 'platform',
    'opensource': 'openSource',
    'availability': 'availability',
    'category': 'custodialStatus', // This maps 'category' to 'custodialStatus', which is what the UI looks for
    'kyc': 'kyc',
    'limits': 'transactionLimits',
    'extrafees': 'transactionFees',
    'recoverymethod': 'backupOptions',
    'scbmanagement': 'peerBackupOptions',
    
    // LN Formats
    'bolt11': 'bolt11Support',
    'bolt12': 'bolt12Support',
    'bolt12bip353hrn': 'bolt12HrnSupport',
    'lnurlpay': 'lnurlSupport',
    'lightningaddresssupport': 'lightningAddressSupport',
    'lnurlwithdraw': 'lnurlSupport',
    
    // Invoice Customization
    'noamountinvoices': 'noAmountInvoices',
    'custommetadata': 'customInvoiceMetadata',
    'expirycontrol': 'invoiceExpiryControl',
    
    // On-Chain Integration
    'receiveonchain': 'onChainSupport',
    'addresstype': 'bitcoinAddressType',
    'sendonchain': 'onChainSupport',
    'taproot': 'taprootTransactions',
    'bitcoinnetwork': 'nodeType',
    'swap': 'submarineSwaps',
    'othernetworks': 'taprootAssets',
    
    // Lightning Specific
    'implementation': 'implementation',
    'lspintegration': 'lspIntegration',
    'channelpeermanagement': 'channelManagement',
    'zeroconfchannels': 'zeroConfChannels',
    'clientsiderouting': 'jitRouting',
    'watchtowerintegration': 'watchtowerIntegration',
    'mppamp': 'mppSupport',
    
    // Privacy
    'tor': 'torSupport',
    'coincontrol': 'paymentDecorrelation',
    
    // Dev Tools
    'openapidocs': 'developerApis',
    'testnetsupport': 'testnetSupport',
    'selfcustodyapi': 'developerApis',
    
    // Legacy mappings
    'onchain': 'onChainSupport',
    'invoice': 'bolt11Support',
    'lnurl': 'lnurlSupport',
    'lightningaddress': 'lightningAddressSupport',
    'dnsseeds': 'hrnBlip32Support',
    'paymentrouting': 'channelManagement',
    'mpp': 'mppSupport',
    'manageownchannels': 'channelManagement',
    'lowincoming': 'inboundLiquidity'
  };
  
  // Check if we have a mapping for this feature name
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

// Helper to normalize values from CSV to our system
export function normalizeFeatureValue(value: string): FeatureValue {
  const valueMap: Record<string, FeatureValue> = {
    // Yes/No/Partial
    'yes': 'yes',
    'no': 'no',
    'partial': 'partial',
    'detailed': 'detailed',
    
    // Direction-specific
    'send': 'send_only',
    'send only': 'send_only',
    'receive': 'receive_only',
    'receive only': 'receive_only',
    
    // Platform values
    'ios': 'ios',
    'android': 'android',
    'desktop': 'desktop',
    'web': 'web',
    'chrome extension': 'chrome_extension',
    'whatsapp': 'whatsapp',
    
    // Wallet architecture types
    'custodial': 'custodial',
    'non-custodial': 'non_custodial',
    'ln node': 'ln_node',
    'hybrid': 'hybrid',
    'on-chain wallet': 'on_chain',
    
    // Implementation types
    'lnd': 'lnd',
    'ldk': 'ldk',
    'core lightning': 'core_lightning',
    'eclair': 'eclair',
    'electrum': 'electrum_impl',
    'greenlight': 'greenlight',
    
    // Taproot support levels
    'full': 'full',
    
    // Management approaches
    'user managed': 'user_managed',
    'lsp managed': 'lsp_managed',
    'automatic': 'automatic',
    'automatic cloud': 'automatic_cloud',
    
    // Networks
    'liquid': 'liquid',
    'ecash': 'ecash',
    
    // Other values
    'restricted': 'restricted',
    'unrestricted': 'unrestricted',
    'not applicable': 'not_applicable',
    '-': 'none',
    '': 'none'
  };
  
  // Normalize the input value
  const normalizedValue = value.trim().toLowerCase();
  
  // Return the mapped value or 'custom' if not found
  return valueMap[normalizedValue] || 'custom';
}