/**
 * This script updates wallet JSON files to standardize representation of specific values:
 * 1. For features like implementation and nodeType, convert direct string values "LND", "CLN", "API" to 
 *    the custom format with value="custom" and customText=<original value> to ensure consistent rendering
 * 2. This fixes inconsistency in the UI where some wallets had color backgrounds for these values and 
 *    others didn't, due to different data formats in the wallet files
 * 
 * Run with: node scripts/update-value-representations.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Values that should be displayed as plain text without styling
const noStyleValues = ['lnd', 'cln', 'core lightning', 'api', 'send only'];

// Features to check for no-style values
const featuresWithSpecialValues = ['implementation', 'nodeType', 'lightningAddressSupport'];

function processWalletFiles() {
  // Get all wallet json files from the data/wallets directory
  const walletsDir = path.join(__dirname, '../data/wallets');
  
  try {
    const files = fs.readdirSync(walletsDir);
    
    let updatedCount = 0;
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(walletsDir, file);
        const hasChanges = processWalletFile(filePath);
        if (hasChanges) {
          updatedCount++;
        }
      }
    }
    
    console.log(`Updated ${updatedCount} wallet files to standardize the representation of LND, CLN, API and similar values`);
  } catch (err) {
    console.error(`Error processing wallet files: ${err.message}`);
  }
}

function processWalletFile(filePath) {
  try {
    // Read the wallet file
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const wallet = JSON.parse(fileContent);
    
    let hasChanges = false;
    
    // Process the wallet's features
    if (wallet.features) {
      featuresWithSpecialValues.forEach(featureName => {
        const feature = wallet.features[featureName];
        if (feature && typeof feature === 'string') {
          // Check if this is a value that should be displayed without styling
          const lowerValue = feature.toLowerCase();
          if (noStyleValues.some(val => lowerValue === val || lowerValue.startsWith(val + ' ') || lowerValue.includes(' ' + val))) {
            // Convert to custom format
            wallet.features[featureName] = {
              value: 'custom',
              customText: feature
            };
            hasChanges = true;
            console.log(`Updated ${filePath} - converted ${featureName}: "${feature}" to custom format`);
          }
        }
      });
    }
    
    // Only write the file if changes were made
    if (hasChanges) {
      fs.writeFileSync(filePath, JSON.stringify(wallet, null, 2));
    }
    
    return hasChanges;
  } catch (err) {
    console.error(`Error processing ${filePath}: ${err.message}`);
    return false;
  }
}

// Start processing wallet files
processWalletFiles();