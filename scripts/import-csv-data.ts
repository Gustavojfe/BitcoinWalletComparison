import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

// Define a function to convert a string to camelCase
function toCamelCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, '');
}

// Function to normalize feature values based on our schema values
function normalizeFeatureValue(value: string) {
  if (!value || value === '-' || value === '--') return 'not_applicable';
  
  // Common value mappings
  const valueMap: Record<string, string> = {
    'yes': 'yes',
    'no': 'no',
    'partial': 'partial',
    'send': 'send_only',
    'receive': 'receive_only',
    'send only': 'send_only',
    'yes, automated': 'automatic',
    'full': 'full',
    'lsp managed': 'lsp_managed',
    'user managed': 'user_managed',
    'automatic cloud upload': 'automatic_cloud',
    'restricted in usa and others': 'restricted',
    'unrestricted': 'unrestricted',
    'restricted in usa': 'restricted',
    'restricted in us and others': 'restricted'
  };

  // Normalize and check for mapped values
  const normalizedValue = value.trim().toLowerCase();
  return valueMap[normalizedValue] || normalizedValue;
}

// Map of column headers to feature IDs
const headerToFeatureId: Record<string, string> = {
  'Platform': 'platform',
  'Open Source': 'openSource',
  'Availability': 'availability',
  'Category': 'custodialStatus',
  'KYC': 'kyc',
  'Limits': 'transactionLimits',
  'Extra Fees': 'transactionFees',
  'Recovery Method': 'backupOptions',
  'SCB Management': 'peerBackupOptions',
  'BOLT11': 'bolt11Support',
  'BOLT12': 'bolt12Support',
  'BOLT12 + BIP353 HRN': 'bolt12HrnSupport',
  'LNURL-pay': 'lnurlPay',
  'Lightning Address Support': 'lightningAddressSupport',
  'LNURL-withdraw': 'lnurlWithdraw',
  'No-Amount Invoices': 'noAmountInvoices',
  'Custom Metadata': 'customInvoiceMetadata',
  'Expiry Control': 'invoiceExpiryControl',
  'Receive On-Chain': 'receiveOnChain',
  'Address Type': 'bitcoinAddressType',
  'Send On-Chain': 'sendOnChain',
  'Taproot (P2TR)': 'taprootTransactions',
  'Bitcoin Network': 'nodeType',
  'Swap': 'submarineSwaps',
  'Other Networks': 'otherNetworks',
  'Implementation': 'implementation',
  'LSP Integration': 'lspIntegration',
  'Channel / Peer Management': 'channelManagement',
  'Zero-Conf Channels': 'zeroConfChannels',
  'Client-Side Routing': 'clientSideRouting',
  'Watchtower Integration': 'watchtowerIntegration',
  'MPP / AMP': 'mppSupport',
  'Max Routing Fee': 'maxRoutingFee',
  'Purchase Inbound': 'purchaseInbound',
  'Splicing Support': 'splicingSupport',
  'Routing Node': 'routingNode',
  'NWC (Nostr Wallet Connect)': 'nostrWalletConnect',
  'Blind Routing': 'blindRouting',
  'SCID Alias': 'scidAlias',
  'Simple Taproot Channels': 'simpleTaprootChannels',
  'Tor': 'torSupport',
  'Testnet Support': 'testnetSupport',
  'API/SDKs': 'developerApis'
};

// Feature categories for categorization
const featureCategories: Record<string, string> = {
  'Platform': 'basics',
  'Open Source': 'basics',
  'Availability': 'basics',
  'Category': 'basics',
  'KYC': 'basics',
  'Limits': 'basics',
  'Extra Fees': 'basics',
  'Recovery Method': 'recover',
  'SCB Management': 'recover',
  'BOLT11': 'ln_formats',
  'BOLT12': 'ln_formats',
  'BOLT12 + BIP353 HRN': 'ln_formats',
  'LNURL-pay': 'ln_formats',
  'Lightning Address Support': 'ln_formats',
  'LNURL-withdraw': 'ln_formats',
  'No-Amount Invoices': 'invoice_customization',
  'Custom Metadata': 'invoice_customization',
  'Expiry Control': 'invoice_customization',
  'Receive On-Chain': 'on_chain_and_other_layers',
  'Address Type': 'on_chain_and_other_layers',
  'Send On-Chain': 'on_chain_and_other_layers',
  'Taproot (P2TR)': 'on_chain_and_other_layers',
  'Bitcoin Network': 'on_chain_and_other_layers',
  'Swap': 'on_chain_and_other_layers',
  'Other Networks': 'on_chain_and_other_layers',
  'Implementation': 'lightning_specific',
  'LSP Integration': 'lightning_specific',
  'Channel / Peer Management': 'lightning_specific',
  'Zero-Conf Channels': 'lightning_specific',
  'Client-Side Routing': 'lightning_specific',
  'Watchtower Integration': 'lightning_specific',
  'MPP / AMP': 'lightning_specific',
  'Max Routing Fee': 'lightning_specific',
  'Purchase Inbound': 'lightning_specific',
  'Splicing Support': 'lightning_specific',
  'Routing Node': 'lightning_specific',
  'NWC (Nostr Wallet Connect)': 'lightning_specific',
  'Blind Routing': 'lightning_specific',
  'SCID Alias': 'lightning_specific',
  'Simple Taproot Channels': 'lightning_specific',
  'Tor': 'privacy',
  'Testnet Support': 'dev_tools',
  'API/SDKs': 'dev_tools'
};

// Import the CSV file
function importCSV() {
  // Read CSV file
  const csvPath = path.join(process.cwd(), 'attached_assets', 'lightning wallet table data - final.csv');
  const csvData = fs.readFileSync(csvPath, 'utf8');
  
  // Parse CSV with raw option to access headers
  const rawRecords = parse(csvData, {
    skip_empty_lines: true,
    from_line: 1,
    relax_column_count: true
  });
  
  // The first row should contain feature category headers
  const categoryRow = rawRecords[0];
  
  // The second row contains feature headers
  const headerRow = rawRecords[1];
  
  // Build proper header mapping
  const finalHeaders: string[] = [];
  for (let i = 0; i < headerRow.length; i++) {
    if (headerRow[i] && headerRow[i].trim() !== '') {
      finalHeaders.push(headerRow[i]);
    }
  }
  
  // Parse again with proper column headers
  const records = parse(csvData, {
    columns: headerRow,
    skip_empty_lines: true,
    from_line: 3 // Start from row 3 (after category and header rows)
  });
  
  // Create data directory if it doesn't exist
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }
  
  // Create wallets directory if it doesn't exist
  const walletsDir = path.join(dataDir, 'wallets');
  if (!fs.existsSync(walletsDir)) {
    fs.mkdirSync(walletsDir);
  }
  
  // Create features directory if it doesn't exist
  const featuresDir = path.join(dataDir, 'features');
  if (!fs.existsSync(featuresDir)) {
    fs.mkdirSync(featuresDir);
  }
  
  // Process Lightning Features
  const lightningFeatures: any[] = [];
  
  // Get feature description based on the feature name
  const getFeatureDescription = (featureName: string): string => {
    // Map of feature names to descriptions
    const descriptionMap: Record<string, string> = {
      "Platform": "Operating systems and platforms the wallet is available on.",
      "Open Source": "Whether the wallet's source code is publicly available for review.",
      "Availability": "Geographic restrictions on wallet usage.",
      "Category": "Type of wallet architecture (custodial, non-custodial, etc.).",
      "KYC": "Know Your Customer requirements for wallet usage.",
      "Limits": "Transaction amount limitations imposed by the wallet.",
      "Extra Fees": "Additional fees charged by the wallet beyond standard network fees.",
      "Recovery Method": "Methods available to recover wallet funds in case of device loss.",
      "SCB Management": "Static Channel Backup management approach.",
      "BOLT11": "Support for BOLT11 Lightning invoice format.",
      "BOLT12": "Support for BOLT12 (Offers) payment format.",
      "BOLT12 + BIP353 HRN": "Support for BOLT12 with BIP353 Human Readable Names.",
      "LNURL-pay": "Support for LNURL-pay protocol for simplified payments.",
      "Lightning Address Support": "Support for Lightning Address format (user@domain.com).",
      "LNURL-withdraw": "Support for LNURL-withdraw protocol for simplified withdrawals.",
      "No-Amount Invoices": "Support for invoices without a specified amount.",
      "Custom Metadata": "Ability to add custom information to Lightning invoices.",
      "Expiry Control": "Ability to control when Lightning invoices expire.",
      "Receive On-Chain": "Support for receiving Bitcoin on-chain.",
      "Address Type": "Type of Bitcoin addresses supported for on-chain transactions.",
      "Send On-Chain": "Support for sending Bitcoin on-chain.",
      "Taproot (P2TR)": "Support for Taproot transaction format.",
      "Bitcoin Network": "How the wallet connects to the Bitcoin network.",
      "Swap": "Support for swapping between Lightning and on-chain Bitcoin.",
      "Other Networks": "Support for other networks beyond Bitcoin.",
      "Implementation": "Lightning Network implementation used by the wallet.",
      "LSP Integration": "Lightning Service Provider integration for channel management.",
      "Channel / Peer Management": "Approach to managing Lightning channels and peers.",
      "Zero-Conf Channels": "Support for channels that become usable before on-chain confirmation.",
      "Client-Side Routing": "Whether the wallet performs payment routing calculations.",
      "Watchtower Integration": "Support for watchtower services to protect against channel breaches.",
      "MPP / AMP": "Support for Multi-Path Payments or Atomic Multi-Path payments.",
      "Max Routing Fee": "Ability to set maximum routing fees for payments.",
      "Purchase Inbound": "Ability to purchase inbound liquidity for receiving capacity.",
      "Splicing Support": "Support for splicing (adding/removing funds from channels without closing).",
      "Routing Node": "Whether the wallet can function as a routing node.",
      "NWC (Nostr Wallet Connect)": "Support for Nostr Wallet Connect protocol.",
      "Blind Routing": "Support for blind routing for enhanced privacy.",
      "SCID Alias": "Support for Short Channel ID aliases.",
      "Simple Taproot Channels": "Support for simplified Taproot channel setup.",
      "Tor": "Support for routing through the Tor network for enhanced privacy.",
      "Testnet Support": "Support for Bitcoin testnet for development and testing.",
      "API/SDKs": "Available developer APIs and SDKs for integration."
    };
    
    return descriptionMap[featureName] || `${featureName} capability for Lightning wallets.`;
  };

  // For each header, create a feature
  finalHeaders.slice(1).forEach((header, index) => {
    if (header && headerToFeatureId[header]) {
      const feature = {
        id: headerToFeatureId[header],
        name: header,
        description: getFeatureDescription(header),
        type: "lightning",
        category: featureCategories[header] || "basics",
        order: index + 1
      };
      
      lightningFeatures.push(feature);
    }
  });
  
  // Save features to JSON file
  fs.writeFileSync(
    path.join(featuresDir, 'lightning-features.json'),
    JSON.stringify(lightningFeatures, null, 2)
  );
  
  // Process each wallet
  records.forEach((record, index) => {
    const walletName = record["Feature"]; // First column is the wallet name
    
    if (!walletName) return; // Skip if no wallet name
    
    // Get real website URL based on wallet name
    const getWalletWebsite = (name: string): string => {
      const websiteMap: Record<string, string> = {
        "Alby": "https://getalby.com",
        "Aqua": "https://www.aquawallet.io",
        "Bitkit": "https://bitkit.to",
        "Blink": "https://www.blink.sv",
        "Blitz": "https://blitz.cash",
        "Blixt": "https://blixtwallet.github.io",
        "Breez": "https://breez.technology",
        "Coinos": "https://coinos.io",
        "Electrum": "https://electrum.org",
        "Muun": "https://muun.com",
        "Phoenix": "https://phoenix.acinq.co",
        "Primal": "https://primal.net/wallet",
        "RTL": "https://github.com/Ride-The-Lightning/RTL",
        "Sati": "https://satiwallet.site",
        "Speed": "https://speed.money",
        "Wallet of Satoshi": "https://www.walletofsatoshi.com",
        "ZBD": "https://zbd.gg",
        "Zeus": "https://zeusln.com/"
      };
      
      return websiteMap[name] || `https://example.com/${toCamelCase(name).toLowerCase()}`;
    };
    
    // Get description based on wallet name and available info
    const getWalletDescription = (name: string, category: string): string => {
      const descMap: Record<string, string> = {
        "Alby": "Browser extension wallet for Lightning payments",
        "Aqua": "Liquid and Bitcoin wallet with Lightning support",
        "Bitkit": "Self-custodial Bitcoin and Lightning wallet",
        "Blink": "Custodial wallet for Bitcoin and Lightning",
        "Blitz": "Hybrid Liquid and Lightning wallet",
        "Blixt": "Non-custodial Lightning wallet",
        "Breez": "Non-custodial Lightning wallet and payment platform",
        "Coinos": "Web-based Lightning and Bitcoin wallet",
        "Electrum": "Feature-rich Bitcoin wallet with Lightning support",
        "Muun": "Self-custodial wallet with Lightning support",
        "Phoenix": "Non-custodial Lightning wallet by ACINQ",
        "Primal": "Nostr-integrated Lightning wallet",
        "RTL": "Ride The Lightning node management tool",
        "Sati": "WhatsApp-based Lightning wallet",
        "Speed": "Custodial wallet for Bitcoin and Lightning",
        "Wallet of Satoshi": "Simple custodial Lightning wallet",
        "ZBD": "Account-based Lightning wallet and platform",
        "Zeus": "Mobile client for Lightning node control"
      };
      
      return descMap[name] || `${name} is a ${category || "Lightning"} wallet.`;
    };
    
    // Create wallet object
    const wallet: any = {
      name: walletName,
      website: getWalletWebsite(walletName),
      description: getWalletDescription(walletName, record["Category"] || ""),
      type: "lightning",
      logo: toCamelCase(walletName).toLowerCase(),
      order: index + 1,
      features: {}
    };
    
    // Special handling for availability and category fields
    if (record["Availability"]) {
      wallet.availability = record["Availability"];
    }
    
    if (record["Category"]) {
      wallet.category = record["Category"];
    }
    
    // Process features for this wallet
    finalHeaders.slice(1).forEach(header => {
      const value = record[header];
      if (value && value !== '-' && value !== '--' && headerToFeatureId[header]) {
        // Handle platform as an array
        if (header === 'Platform' && value.includes(',')) {
          // Convert to array of platform values
          const platforms = value.split(',').map(p => normalizeFeatureValue(p.trim()));
          wallet.features[headerToFeatureId[header]] = platforms;
        } else {
          const normalizedValue = normalizeFeatureValue(value);
          
          // If value contains detailed information, add as custom text
          if (normalizedValue !== 'yes' && normalizedValue !== 'no' && normalizedValue !== 'partial') {
            wallet.features[headerToFeatureId[header]] = {
              value: 'custom',
              customText: value
            };
          } else {
            wallet.features[headerToFeatureId[header]] = normalizedValue;
          }
        }
      }
    });
    
    // Save wallet to JSON file
    fs.writeFileSync(
      path.join(walletsDir, `${toCamelCase(walletName).toLowerCase()}.json`),
      JSON.stringify(wallet, null, 2)
    );
  });
  
  console.log(`Imported ${records.length} wallets and ${lightningFeatures.length} features.`);
}

// Run the import
importCSV();