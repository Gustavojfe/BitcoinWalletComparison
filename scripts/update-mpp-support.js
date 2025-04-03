/**
 * This script updates the mppSupport feature in wallet JSON files:
 * 1. Change "unknown" to "no" for bitkit and blitz
 * 2. Add the mppSupport feature with value "no" if it doesn't exist
 * 
 * Run with: node scripts/update-mpp-support.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Wallets to update
const walletNames = ['bitkit', 'blitz'];

async function processWalletFiles() {
  console.log(`Updating mppSupport feature for wallets: ${walletNames.join(', ')}...`);
  
  for (const walletName of walletNames) {
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
    
    // Check if the mppSupport feature exists
    if (walletData.features.mppSupport === undefined) {
      // Add the feature with value "no"
      walletData.features.mppSupport = 'no';
      
      // Write the updated data back to the file
      fs.writeFileSync(filePath, JSON.stringify(walletData, null, 2));
      console.log(`Success: Added mppSupport feature with value "no" to ${walletName}`);
      return;
    }
    
    // Get the current value
    const currentValue = walletData.features.mppSupport;
    
    // Check if it's a simple string value
    if (typeof currentValue === 'string' && currentValue === 'unknown') {
      // Update to "no"
      walletData.features.mppSupport = 'no';
      
      // Write the updated data back to the file
      fs.writeFileSync(filePath, JSON.stringify(walletData, null, 2));
      console.log(`Success: Updated ${walletName}'s mppSupport from "unknown" to "no"`);
    } 
    // Check if it's an object with value="unknown"
    else if (typeof currentValue === 'object' && currentValue.value === 'unknown') {
      currentValue.value = 'no';
      
      // Write the updated data back to the file
      fs.writeFileSync(filePath, JSON.stringify(walletData, null, 2));
      console.log(`Success: Updated ${walletName}'s mppSupport from object with "unknown" to "no"`);
    }
    else {
      console.log(`No change needed: ${walletName}'s mppSupport is not "unknown" (current value: ${
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
processWalletFiles().catch(error => {
  console.error('Error executing script:', error);
});