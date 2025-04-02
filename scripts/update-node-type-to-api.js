/**
 * This script updates all wallet JSON files to:
 * 1. Replace "no" or "does_not_apply" with "API" for the nodeType feature
 * 2. Leave other values (e.g., "yes", "custom", or objects) unchanged
 * 
 * Run with: node scripts/update-node-type-to-api.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WALLETS_DIR = path.join(__dirname, '../data/wallets');

function processWalletFiles() {
  // Get all JSON files in the wallets directory
  const walletFiles = fs.readdirSync(WALLETS_DIR)
    .filter(file => file.endsWith('.json'));

  console.log(`Found ${walletFiles.length} wallet JSON files.`);
  
  let updatedCount = 0;
  
  // Process each wallet file
  walletFiles.forEach(file => {
    const filePath = path.join(WALLETS_DIR, file);
    const updated = processWalletFile(filePath);
    if (updated) {
      updatedCount++;
    }
  });
  
  console.log(`Updated nodeType to "API" in ${updatedCount} wallet files.`);
}

function processWalletFile(filePath) {
  try {
    // Read and parse the wallet JSON file
    const walletData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Skip if there's no nodeType feature
    if (!walletData.features || !('nodeType' in walletData.features)) {
      return false;
    }
    
    let updated = false;
    const currentValue = walletData.features.nodeType;
    
    // Check if nodeType is a simple "no" or "does_not_apply" string value
    if (currentValue === "no" || currentValue === "does_not_apply") {
      // Update to "API"
      walletData.features.nodeType = "API";
      updated = true;
    }
    // If nodeType is an object, check if its value property is "no" or "does_not_apply"
    else if (typeof currentValue === 'object' && currentValue !== null && 
             (currentValue.value === "no" || currentValue.value === "does_not_apply")) {
      // Update to "API"
      walletData.features.nodeType = "API";
      console.log(`Updated ${path.basename(filePath)}: nodeType object with value "${currentValue.value}" changed to "API" string`);
      updated = true;
    }
    
    // If updated, write the changes back to the file
    if (updated) {
      fs.writeFileSync(filePath, JSON.stringify(walletData, null, 2));
      console.log(`Updated ${path.basename(filePath)}: nodeType changed from "${currentValue}" to "API"`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing ${path.basename(filePath)}:`, error);
    return false;
  }
}

// Run the script
processWalletFiles();