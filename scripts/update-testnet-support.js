/**
 * This script updates the testnetSupport feature in wallet JSON files:
 * 1. Change "unknown" to "no" for bitkit
 * 2. Add the testnetSupport feature with value "no" if it doesn't exist
 * 
 * Run with: node scripts/update-testnet-support.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Wallet to update
const walletName = 'bitkit';

async function processWalletFile() {
  console.log(`Updating testnetSupport feature for ${walletName}...`);
  
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
    
    // Check if the testnetSupport feature exists
    if (walletData.features.testnetSupport === undefined) {
      // Add the feature with value "no"
      walletData.features.testnetSupport = 'no';
      
      // Write the updated data back to the file
      fs.writeFileSync(filePath, JSON.stringify(walletData, null, 2));
      console.log(`Success: Added testnetSupport feature with value "no" to ${walletName}`);
      return;
    }
    
    // Get the current value
    const currentValue = walletData.features.testnetSupport;
    
    // Check if it's a simple string value
    if (typeof currentValue === 'string' && currentValue === 'unknown') {
      // Update to "no"
      walletData.features.testnetSupport = 'no';
      
      // Write the updated data back to the file
      fs.writeFileSync(filePath, JSON.stringify(walletData, null, 2));
      console.log(`Success: Updated ${walletName}'s testnetSupport from "unknown" to "no"`);
    } 
    // Check if it's an object with value="unknown"
    else if (typeof currentValue === 'object' && currentValue.value === 'unknown') {
      currentValue.value = 'no';
      
      // Write the updated data back to the file
      fs.writeFileSync(filePath, JSON.stringify(walletData, null, 2));
      console.log(`Success: Updated ${walletName}'s testnetSupport from object with "unknown" to "no"`);
    }
    else {
      console.log(`No change needed: ${walletName}'s testnetSupport is not "unknown" (current value: ${
        typeof currentValue === 'object' 
          ? `object with value "${currentValue.value}"` 
          : `"${currentValue}"`
      })`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}: ${error.message}`);
  }
}

// Execute the script
processWalletFile().catch(error => {
  console.error('Error executing script:', error);
});