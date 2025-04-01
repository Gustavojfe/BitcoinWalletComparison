/**
 * This script updates all wallet JSON files to:
 * 1. Find any of these features (transactionLimits, bitcoinAddressType, taprootTransactions, submarineSwaps) 
 *    with the value "unknown" and replace it with "no"
 * 2. Leave other values (e.g., "yes", "custom", or objects) unchanged
 * 
 * Run with: node scripts/convert-unknowns-to-no.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Features to update
const FEATURES_TO_UPDATE = [
  'transactionLimits',
  'bitcoinAddressType',
  'taprootTransactions',
  'submarineSwaps',
  'peerBackupOptions'
];

// Path to wallet files
const WALLETS_DIR = path.join(__dirname, '../data/wallets');

// Process all wallet files
function processWalletFiles() {
  // Get all wallet JSON files
  const walletFiles = fs.readdirSync(WALLETS_DIR)
    .filter(file => file.endsWith('.json'));
  
  console.log(`Found ${walletFiles.length} wallet JSON files to process.`);
  
  let totalChanges = 0;
  
  // Process each wallet file
  walletFiles.forEach(fileName => {
    const walletPath = path.join(WALLETS_DIR, fileName);
    const walletChanges = processWalletFile(walletPath);
    
    if (walletChanges > 0) {
      console.log(`- Updated ${fileName}: ${walletChanges} changes`);
      totalChanges += walletChanges;
    }
  });
  
  console.log(`\nSummary: Updated ${totalChanges} "unknown" values to "no" across all wallets.`);
}

// Process a single wallet file
function processWalletFile(filePath) {
  try {
    const walletName = path.basename(filePath, '.json');
    console.log(`Processing wallet: ${walletName}...`);
    
    // Read wallet JSON
    const walletData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let changes = 0;
    
    // Check if the wallet has a features object
    if (walletData.features) {
      // Check each feature that we want to update
      FEATURES_TO_UPDATE.forEach(feature => {
        // Check if feature exists and is a string equal to "unknown"
        if (
          feature in walletData.features && 
          typeof walletData.features[feature] === 'string' &&
          walletData.features[feature] === 'unknown'
        ) {
          console.log(`  - Converting ${feature} from "unknown" to "no" in ${walletName}`);
          // Convert "unknown" to "no"
          walletData.features[feature] = 'no';
          changes++;
        }
        // Check if feature is an object with a value property set to "unknown"
        else if (
          feature in walletData.features &&
          typeof walletData.features[feature] === 'object' &&
          walletData.features[feature] !== null &&
          'value' in walletData.features[feature] &&
          walletData.features[feature].value === 'unknown'
        ) {
          console.log(`  - Converting ${feature}.value from "unknown" to "no" in ${walletName}`);
          // Convert "unknown" to "no" in the value property
          walletData.features[feature].value = 'no';
          changes++;
        }
      });
      
      // Additional step: search for any "unknown" values in all features and nested properties
      // This is useful for debugging but doesn't modify anything
      Object.entries(walletData.features).forEach(([key, value]) => {
        // Check direct string values
        if (typeof value === 'string' && value === 'unknown' && !FEATURES_TO_UPDATE.includes(key)) {
          console.log(`  * Found additional "unknown" string value in ${walletName}.${key} (not converting)`);
        }
        // Check objects with value property
        else if (
          typeof value === 'object' && 
          value !== null && 
          'value' in value && 
          value.value === 'unknown' &&
          !FEATURES_TO_UPDATE.includes(key)
        ) {
          console.log(`  * Found additional "unknown" value in ${walletName}.${key}.value (not converting)`);
        }
      });
      
      // If changes were made, save the updated file
      if (changes > 0) {
        fs.writeFileSync(filePath, JSON.stringify(walletData, null, 2), 'utf8');
        console.log(`  ✓ Updated ${walletName} with ${changes} changes`);
      } else {
        console.log(`  ✓ No changes needed for ${walletName}`);
      }
    } else {
      console.log(`  ! No features object found in ${walletName}`);
    }
    
    return changes;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return 0;
  }
}

// Run the script
processWalletFiles();