/**
 * This script updates multiple node-related features in wallet JSON files for aqua and muun:
 * 1. Change "unknown" to "does_not_apply" for the following features:
 *    - lspIntegration
 *    - channelManagement
 *    - zeroConfChannels
 *    - clientSideRouting
 *    - watchtowerIntegration
 *    - mppSupport
 *    - maxRoutingFee
 *    - purchaseInbound
 *    - splicingSupport
 *    - routingNode
 *    - scidAlias
 *    - simpleTaprootChannels
 * 2. Add these features with value "does_not_apply" if they don't exist
 * 
 * Run with: node scripts/update-node-features.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Wallets to update
const walletNames = ['aqua', 'muun'];

// Features to update
const featuresToUpdate = [
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
];

async function processWalletFiles() {
  for (const walletName of walletNames) {
    console.log(`\nUpdating node-related features for ${walletName}...`);
    await processWalletFile(walletName);
  }
}

async function processWalletFile(walletName) {
  const filePath = path.join('data', 'wallets', `${walletName}.json`);
  
  if (!fs.existsSync(filePath)) {
    console.error(`Error: Wallet file not found at ${filePath}`);
    return;
  }
  
  try {
    // Read the wallet file
    const walletData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Check if the wallet has features
    if (!walletData.features) {
      console.error(`Error: No features object found in ${walletName}.json`);
      return;
    }
    
    // Track changes
    let changesCount = 0;
    
    // Process each feature
    for (const featureName of featuresToUpdate) {
      // Check if the feature exists
      if (walletData.features[featureName] === undefined) {
        // Add the feature with value "does_not_apply"
        walletData.features[featureName] = 'does_not_apply';
        console.log(`Added ${featureName} feature with value "does_not_apply" to ${walletName}`);
        changesCount++;
        continue;
      }
      
      // Get the current value
      const currentValue = walletData.features[featureName];
      
      // Check if it's a simple string value
      if (typeof currentValue === 'string' && currentValue === 'unknown') {
        // Update to "does_not_apply"
        walletData.features[featureName] = 'does_not_apply';
        console.log(`Updated ${walletName}'s ${featureName} from "unknown" to "does_not_apply"`);
        changesCount++;
      } 
      // Check if it's an object with value="unknown"
      else if (typeof currentValue === 'object' && currentValue.value === 'unknown') {
        currentValue.value = 'does_not_apply';
        console.log(`Updated ${walletName}'s ${featureName} from object with "unknown" to "does_not_apply"`);
        changesCount++;
      }
      else {
        console.log(`No change needed: ${walletName}'s ${featureName} is not "unknown" (current value: ${
          typeof currentValue === 'object' 
            ? `object with value "${currentValue.value}"` 
            : `"${currentValue}"`
        })`);
      }
    }
    
    // Write the updated data back to the file if changes were made
    if (changesCount > 0) {
      fs.writeFileSync(filePath, JSON.stringify(walletData, null, 2));
      console.log(`Success: Updated ${changesCount} features in ${walletName}.json`);
    } else {
      console.log(`No changes made to ${walletName}.json`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}: ${error.message}`);
  }
}

// Execute the script
processWalletFiles().catch(error => {
  console.error('Error executing script:', error);
});