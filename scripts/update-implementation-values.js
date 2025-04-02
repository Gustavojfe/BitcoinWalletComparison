/**
 * This script updates implementation values in wallet JSON files.
 * It applies the following specific changes:
 * - Alby: set implementation to "LND"
 * - Aqua: set implementation to "does_not_apply"
 * - Blink: set implementation to "LND"
 * - CoinOS: set implementation to "CLN" 
 * - Muun: set implementation to "does_not_apply"
 * 
 * Run with: node scripts/update-implementation-values.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WALLETS_DIR = path.join(__dirname, '../data/wallets');

// Map of wallet filenames (without .json) to their new implementation values
const IMPLEMENTATION_UPDATES = {
  'alby': 'LND',
  'aqua': 'does_not_apply',
  'blink': 'LND',
  'coinos': 'CLN',
  'muun': 'does_not_apply',
  // Add more wallets to update as needed
};

function processWalletFiles() {
  // Get all JSON files in the wallets directory
  const walletFiles = fs.readdirSync(WALLETS_DIR)
    .filter(file => file.endsWith('.json'));

  console.log(`Found ${walletFiles.length} wallet JSON files.`);
  
  let updatedCount = 0;
  
  // Process each wallet file
  for (const file of walletFiles) {
    const walletName = path.basename(file, '.json');
    
    // Check if this wallet needs updating
    if (walletName in IMPLEMENTATION_UPDATES) {
      const filePath = path.join(WALLETS_DIR, file);
      const updated = processWalletFile(filePath, walletName, IMPLEMENTATION_UPDATES[walletName]);
      if (updated) {
        updatedCount++;
      }
    }
  }
  
  console.log(`Updated implementation values in ${updatedCount} wallet files.`);
}

function processWalletFile(filePath, walletName, newImplementationValue) {
  try {
    // Read and parse the wallet JSON file
    const walletData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Skip if there's no implementation feature
    if (!walletData.features || !('implementation' in walletData.features)) {
      console.log(`Skipping ${walletName}: No implementation feature found.`);
      return false;
    }
    
    // Store current value for logging
    const currentValue = JSON.stringify(walletData.features.implementation);
    
    // Update the implementation value
    walletData.features.implementation = newImplementationValue;
    
    // Write the changes back to the file
    fs.writeFileSync(filePath, JSON.stringify(walletData, null, 2));
    console.log(`Updated ${walletName}: implementation changed from ${currentValue} to "${newImplementationValue}"`);
    return true;
  } catch (error) {
    console.error(`Error processing ${walletName}:`, error);
    return false;
  }
}

// Run the script
processWalletFiles();