/**
 * This script updates wallet JSON files to:
 * 1. Change any value of "no" or "does_not_apply" for the "otherNetworks" feature to "API"
 * 2. Leave other values (e.g., "yes", "custom", or objects) unchanged
 * 
 * Run with: node scripts/update-other-networks.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// This function processes all wallet files
function processWalletFiles() {
  console.log('Updating otherNetworks feature values...');
  
  const walletsDir = path.join(__dirname, '..', 'data', 'wallets');
  
  // Get all JSON files in the wallets directory
  const walletFiles = fs.readdirSync(walletsDir)
    .filter(file => file.endsWith('.json'));
  
  let updatedCount = 0;
  let unchangedCount = 0;
  
  // Process each wallet file
  walletFiles.forEach(file => {
    const filePath = path.join(walletsDir, file);
    const wasUpdated = processWalletFile(filePath);
    
    if (wasUpdated) {
      updatedCount++;
    } else {
      unchangedCount++;
    }
  });
  
  console.log(`Updated ${updatedCount} wallets, ${unchangedCount} wallets unchanged.`);
}

// This function updates the otherNetworks feature in a single wallet file
function processWalletFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return false;
    }
    
    // Read and parse the wallet JSON file
    const wallet = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let wasUpdated = false;
    
    // Check if the wallet has the otherNetworks feature
    if (wallet.features && 'otherNetworks' in wallet.features) {
      const currentValue = wallet.features.otherNetworks;
      
      // Only update if the value is "no" or "does_not_apply"
      if (currentValue === 'no' || currentValue === 'does_not_apply') {
        wallet.features.otherNetworks = 'API';
        wasUpdated = true;
        console.log(`Updated ${path.basename(filePath)}: otherNetworks from "${currentValue}" to "API"`);
      }
    }
    
    // Only write to the file if it was updated
    if (wasUpdated) {
      fs.writeFileSync(filePath, JSON.stringify(wallet, null, 2), 'utf8');
    }
    
    return wasUpdated;
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    return false;
  }
}

// Execute the update function
processWalletFiles();