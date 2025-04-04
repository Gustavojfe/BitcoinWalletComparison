/**
 * This script updates the Alby wallet JSON file to:
 * 1. Add the maxRoutingFee feature with value "no" if it doesn't exist
 * 2. Add the blindRouting feature with value "no" if it doesn't exist
 * 3. Add the scidAlias feature with value "no" if it doesn't exist
 * 
 * Run with: node scripts/update-alby-features.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Wallet to update
const walletName = 'alby';

// Features to update
const featuresToUpdate = [
  'maxRoutingFee',
  'blindRouting',
  'scidAlias'
];

async function processWalletFile() {
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
    
    // Track changes
    let changesCount = 0;
    
    // Process each feature
    for (const featureName of featuresToUpdate) {
      // Check if the feature exists
      if (walletData.features[featureName] === undefined) {
        // Add the feature with value "no"
        walletData.features[featureName] = "no";
        console.log(`Added ${featureName} feature with value "no" to ${walletName}`);
        changesCount++;
      } 
      // If it exists but has "unknown" value, change it to "no"
      else if (walletData.features[featureName] === 'unknown') {
        walletData.features[featureName] = "no";
        console.log(`Updated ${walletName}'s ${featureName} from "unknown" to "no"`);
        changesCount++;
      }
      // If it's an object with "unknown" value, change it to "no"
      else if (typeof walletData.features[featureName] === 'object' && 
               walletData.features[featureName].value === 'unknown') {
        walletData.features[featureName].value = "no";
        console.log(`Updated ${walletName}'s ${featureName} object value from "unknown" to "no"`);
        changesCount++;
      }
      else {
        console.log(`No change needed: ${walletName}'s ${featureName} is already set to "${
          typeof walletData.features[featureName] === 'object' 
            ? walletData.features[featureName].value 
            : walletData.features[featureName]
        }"`);
      }
    }
    
    // Write the updated data back to the file if changes were made
    if (changesCount > 0) {
      fs.writeFileSync(filePath, JSON.stringify(walletData, null, 2));
      console.log(`Success: Updated ${changesCount} features in ${walletName}.json`);
    } else {
      console.log(`No changes made to ${walletName}.json`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}: ${error.message}`);
  }
}

// Execute the script
processWalletFile().catch(error => {
  console.error('Error executing script:', error);
});