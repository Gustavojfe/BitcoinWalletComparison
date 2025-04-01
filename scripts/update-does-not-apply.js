/**
 * This script updates wallet JSON files to:
 * 1. Look for specific feature values that need to be changed to "does_not_apply"
 * 2. Replace those values with "does_not_apply"
 * 
 * Run with: node scripts/update-does-not-apply.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Features to check and potentially update to does_not_apply
const featuresForDoesNotApply = [
  'scbManagement', // Static Channel Backup (SCB) management may not apply to certain wallet types
  'liquidTransactions', // Liquid transactions may not apply to some wallets
  'taproot', // Taproot may not apply to some wallets
  'wumboChannels', // Wumbo channels may not apply to some wallets
  'multiPath', // Multi-path payments may not apply to some wallets
  'minChannelSize', // Minimum channel size may not apply to some wallets
  'maxChannelSize' // Maximum channel size may not apply to some wallets
];

// Wallets that should have "does_not_apply" for specific features
const walletFeaturesToUpdate = {
  // Define wallets and which features should be updated to "does_not_apply"
  // Format: 'walletName': ['feature1', 'feature2', ...]
  
  // Custodial wallets don't need these features since they manage the Lightning node for you
  'blink': [
    'peerBackupOptions',
    'nodeType',
    'submarineSwaps',
    'implementation',
    'lspIntegration',
    'channelManagement',
    'zeroConfChannels',
    'clientSideRouting',
    'watchtowerIntegration',
    'mppSupport',
    'maxRoutingFee',
    'purchaseInbound',
    'splicingSupport',
    'routingNode',
    'scidAlias',
    'simpleTaprootChannels'
  ],
  'coinos': [
    'peerBackupOptions',
    'nodeType',
    'submarineSwaps',
    'implementation',
    'lspIntegration',
    'channelManagement',
    'zeroConfChannels',
    'clientSideRouting',
    'watchtowerIntegration',
    'mppSupport',
    'maxRoutingFee',
    'purchaseInbound',
    'splicingSupport',
    'routingNode',
    'scidAlias',
    'simpleTaprootChannels'
  ],
  'primal': [
    'peerBackupOptions',
    'nodeType',
    'submarineSwaps',
    'implementation',
    'lspIntegration',
    'channelManagement',
    'zeroConfChannels',
    'clientSideRouting',
    'watchtowerIntegration',
    'mppSupport',
    'maxRoutingFee',
    'purchaseInbound',
    'splicingSupport',
    'routingNode',
    'scidAlias',
    'simpleTaprootChannels'
  ],
  'sati': [
    'peerBackupOptions',
    'nodeType',
    'submarineSwaps',
    'implementation',
    'lspIntegration',
    'channelManagement',
    'zeroConfChannels',
    'clientSideRouting',
    'watchtowerIntegration',
    'mppSupport',
    'maxRoutingFee',
    'purchaseInbound',
    'splicingSupport',
    'routingNode',
    'scidAlias',
    'simpleTaprootChannels'
  ],
  'speed': [
    'peerBackupOptions',
    'nodeType',
    'submarineSwaps',
    'implementation',
    'lspIntegration',
    'channelManagement',
    'zeroConfChannels',
    'clientSideRouting',
    'watchtowerIntegration',
    'mppSupport',
    'maxRoutingFee',
    'purchaseInbound',
    'splicingSupport',
    'routingNode',
    'scidAlias',
    'simpleTaprootChannels'
  ],
  'walletofsatoshi': [
    'peerBackupOptions',
    'nodeType',
    'submarineSwaps',
    'implementation',
    'lspIntegration',
    'channelManagement',
    'zeroConfChannels',
    'clientSideRouting',
    'watchtowerIntegration',
    'mppSupport',
    'maxRoutingFee',
    'purchaseInbound',
    'splicingSupport',
    'routingNode',
    'scidAlias',
    'simpleTaprootChannels'
  ],
  'zbd': [
    'peerBackupOptions',
    'nodeType',
    'submarineSwaps',
    'implementation',
    'lspIntegration',
    'channelManagement',
    'zeroConfChannels',
    'clientSideRouting',
    'watchtowerIntegration',
    'mppSupport',
    'maxRoutingFee',
    'purchaseInbound',
    'splicingSupport',
    'routingNode',
    'scidAlias',
    'simpleTaprootChannels'
  ]
};

// Get all wallet files from the data/wallets directory
function processWalletFiles() {
  const walletDir = path.join(__dirname, '../data/wallets');
  
  if (!fs.existsSync(walletDir)) {
    console.error(`Directory not found: ${walletDir}`);
    return;
  }
  
  const walletFiles = fs.readdirSync(walletDir)
    .filter(file => file.endsWith('.json'));
  
  console.log(`Found ${walletFiles.length} wallet files to process`);
  
  let updateCount = 0;
  
  walletFiles.forEach(file => {
    const changesMade = processWalletFile(path.join(walletDir, file));
    if (changesMade) updateCount++;
  });
  
  console.log(`Completed processing. Updated ${updateCount} wallet files.`);
}

// Process a single wallet file
function processWalletFile(filePath) {
  const fileName = path.basename(filePath);
  const walletName = fileName.replace('.json', '');
  
  try {
    // Read the wallet file
    const data = fs.readFileSync(filePath, 'utf8');
    let wallet;
    
    try {
      wallet = JSON.parse(data);
    } catch (parseError) {
      console.error(`Error parsing JSON in ${fileName}: ${parseError.message}`);
      return false;
    }
    
    if (!wallet.features) {
      console.log(`No features found in ${fileName}, skipping`);
      return false;
    }
    
    let changesMade = false;
    
    // Get the specific features to update for this wallet
    const specificFeaturesToUpdate = walletFeaturesToUpdate[walletName] || [];
    
    // First check for existing features and update them if needed
    Object.keys(wallet.features).forEach(feature => {
      // Check if this feature should be updated for this wallet
      if (specificFeaturesToUpdate.includes(feature)) {
        // Handle both direct values and objects with 'value' property
        if (typeof wallet.features[feature] === 'object' && wallet.features[feature] !== null) {
          if (wallet.features[feature].value !== 'does_not_apply') {
            console.log(`Updating ${fileName} - ${feature} from ${wallet.features[feature].value} to "does_not_apply"`);
            wallet.features[feature].value = 'does_not_apply';
            changesMade = true;
          }
        } else if (wallet.features[feature] !== 'does_not_apply') {
          console.log(`Updating ${fileName} - ${feature} from ${wallet.features[feature]} to "does_not_apply"`);
          wallet.features[feature] = 'does_not_apply';
          changesMade = true;
        }
      }
    });
    
    // Then add missing features with does_not_apply value
    specificFeaturesToUpdate.forEach(feature => {
      if (!wallet.features[feature]) {
        console.log(`Adding missing feature to ${fileName} - ${feature} with value "does_not_apply"`);
        wallet.features[feature] = 'does_not_apply';
        changesMade = true;
      }
    });
    
    if (changesMade) {
      // Write the updated wallet data back to the file
      fs.writeFileSync(filePath, JSON.stringify(wallet, null, 2), 'utf8');
      console.log(`Updated ${fileName}`);
      return true;
    } else {
      console.log(`No changes needed for ${fileName}`);
      return false;
    }
  } catch (error) {
    console.error(`Error processing ${fileName}: ${error.message}`);
    return false;
  }
}

// Execute the script
processWalletFiles();