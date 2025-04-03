/**
 * This script updates the transactionLimits feature in wallet JSON files.
 * It changes the value from "unknown" to "no" for specific wallets.
 * 
 * Run with: node scripts/update-transaction-limits.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// List of wallets to update
const walletsToUpdate = [
  'alby',
  'aqua',
  'blitz',
  'blixt',
  'breez',
  'coinos',
  'electrum',
  'muun',
  'phoenix',
  'rtl',
  'sati',
  'zeus'
];

async function processWalletFiles() {
  console.log('Updating transaction limits from "unknown" to "no" for specified wallets...');
  
  let updatedCount = 0;
  let skippedCount = 0;
  
  // Process each wallet in the list
  for (const walletName of walletsToUpdate) {
    const filePath = path.join('data', 'wallets', `${walletName}.json`);
    
    if (fs.existsSync(filePath)) {
      const wasUpdated = await processWalletFile(filePath);
      if (wasUpdated) {
        updatedCount++;
      } else {
        skippedCount++;
      }
    } else {
      console.warn(`Warning: Wallet file not found for ${walletName}`);
    }
  }
  
  console.log(`Done! Updated ${updatedCount} wallets, skipped ${skippedCount} wallets.`);
}

async function processWalletFile(filePath) {
  try {
    // Read the wallet file
    const walletData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const walletName = path.basename(filePath, '.json');
    
    // Check if the wallet has features
    if (walletData.features) {
      // Check if the transactionLimits feature exists
      if (walletData.features.transactionLimits !== undefined) {
        // Check if the current value is "unknown"
        if (walletData.features.transactionLimits === 'unknown') {
          // Update to "no"
          walletData.features.transactionLimits = 'no';
          
          // Write the updated data back to the file
          fs.writeFileSync(filePath, JSON.stringify(walletData, null, 2));
          console.log(`Updated ${walletName}: transactionLimits from "unknown" to "no"`);
          return true;
        } else {
          console.log(`Skipped ${walletName}: transactionLimits is not "unknown" (current value: "${walletData.features.transactionLimits}")`);
          return false;
        }
      } else {
        // Add the transactionLimits feature with value "no"
        walletData.features.transactionLimits = 'no';
        
        // Write the updated data back to the file
        fs.writeFileSync(filePath, JSON.stringify(walletData, null, 2));
        console.log(`Added to ${walletName}: transactionLimits with value "no"`);
        return true;
      }
    } else {
      console.log(`Skipped ${walletName}: features object not found`);
      return false;
    }
  } catch (error) {
    console.error(`Error processing ${filePath}: ${error.message}`);
    return false;
  }
}

// Execute the script
processWalletFiles().catch(error => {
  console.error('Error executing script:', error);
});