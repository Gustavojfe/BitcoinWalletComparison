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

// Get the current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WALLET_UPDATES = {
  'alby.json': 'LND',
  'aqua.json': 'does_not_apply',
  'blink.json': 'LND',
  'coinos.json': 'CLN',
  'muun.json': 'does_not_apply'
};

function processWalletFiles() {
  const walletsDir = path.join(__dirname, '../data/wallets');
  
  // Get all wallet files
  const walletFiles = Object.keys(WALLET_UPDATES).map(file => path.join(walletsDir, file));
  
  // Process each wallet file
  walletFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      processWalletFile(filePath);
    } else {
      console.log(`File not found: ${filePath}`);
    }
  });
}

function processWalletFile(filePath) {
  try {
    // Read the wallet file
    const walletData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const filename = path.basename(filePath);
    const newValue = WALLET_UPDATES[filename];
    
    // Skip if this wallet is not in our update list
    if (!newValue) return;
    
    // Ensure features object exists
    if (!walletData.features) {
      walletData.features = {};
    }
    
    // Update the implementation value
    walletData.features.implementation = newValue;
    
    // Write the updated wallet data back to the file
    fs.writeFileSync(filePath, JSON.stringify(walletData, null, 2), 'utf8');
    console.log(`Updated implementation to "${newValue}" in ${filename}`);
  } catch (error) {
    console.error(`Error processing ${filePath}: ${error.message}`);
  }
}

// Execute the script
processWalletFiles();
console.log('Implementation values update completed.');