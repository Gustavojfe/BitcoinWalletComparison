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

// This function processes all wallet files
function processWalletFiles() {
  console.log('Updating nodeType feature in wallet files...');
  
  const walletsDir = path.join(__dirname, '..', 'data', 'wallets');
  const files = fs.readdirSync(walletsDir);
  
  // Track statistics for reporting
  let stats = {
    total: 0,
    updated: 0,
    skipped: 0,
    errors: 0
  };
  
  files.forEach(file => {
    if (file.endsWith('.json')) {
      const filePath = path.join(walletsDir, file);
      try {
        stats.total++;
        const updated = processWalletFile(filePath);
        if (updated) {
          stats.updated++;
        } else {
          stats.skipped++;
        }
      } catch (error) {
        console.error(`Error processing file ${file}:`, error);
        stats.errors++;
      }
    }
  });
  
  console.log(`\nSummary:`);
  console.log(`Total wallet files processed: ${stats.total}`);
  console.log(`Files updated: ${stats.updated}`);
  console.log(`Files skipped (no changes needed): ${stats.skipped}`);
  console.log(`Errors: ${stats.errors}`);
}

// This function updates a single wallet file
function processWalletFile(filePath) {
  // Read the wallet file
  const walletData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const fileName = path.basename(filePath);
  
  // Check if the wallet has a nodeType feature
  if (walletData.features && 'nodeType' in walletData.features) {
    const currentValue = walletData.features.nodeType;
    
    // Check if the value needs to be updated
    if (currentValue === 'no' || currentValue === 'does_not_apply') {
      // Update the value to "API"
      walletData.features.nodeType = 'API';
      
      // Write the updated data back to the file
      fs.writeFileSync(filePath, JSON.stringify(walletData, null, 2), 'utf8');
      console.log(`Updated ${fileName}: nodeType changed from "${currentValue}" to "API"`);
      return true;
    } else {
      console.log(`Skipped ${fileName}: nodeType is "${currentValue}" (not "no" or "does_not_apply")`);
      return false;
    }
  } else {
    console.log(`Skipped ${fileName}: no nodeType feature found`);
    return false;
  }
}

// Execute the update function
processWalletFiles();