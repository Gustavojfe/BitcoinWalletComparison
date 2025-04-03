/**
 * This script updates the taprootTransactions feature in wallet JSON files:
 * 1. Change "does_not_apply" to "no" for Blink
 * 2. Change "full" to "yes" for blitz, coinos, muun, phoenix, rtl
 * 
 * Run with: node scripts/update-taproot-transactions.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Wallets to update from "does_not_apply" to "no"
const walletsToNoValue = [
  'blink'
];

// Wallets to update from "full" to "yes"
const walletsToYesValue = [
  'blitz',
  'coinos',
  'muun',
  'phoenix',
  'rtl'
];

async function processWalletFiles() {
  console.log('Updating taprootTransactions feature values...');
  
  let updatedCount = 0;
  let skippedCount = 0;
  
  // Process wallets to set to "no"
  for (const walletName of walletsToNoValue) {
    const filePath = path.join('data', 'wallets', `${walletName}.json`);
    
    if (fs.existsSync(filePath)) {
      const wasUpdated = await updateTaprootValue(filePath, "does_not_apply", "no");
      if (wasUpdated) {
        updatedCount++;
      } else {
        skippedCount++;
      }
    } else {
      console.warn(`Warning: Wallet file not found for ${walletName}`);
    }
  }
  
  // Process wallets to set to "yes"
  for (const walletName of walletsToYesValue) {
    const filePath = path.join('data', 'wallets', `${walletName}.json`);
    
    if (fs.existsSync(filePath)) {
      const wasUpdated = await updateTaprootValueFromCustomText(filePath, "Full", "yes");
      if (wasUpdated) {
        updatedCount++;
      } else {
        skippedCount++;
      }
    } else {
      console.warn(`Warning: Wallet file not found for ${walletName}`);
    }
  }
  
  console.log(`Done! Updated ${updatedCount} wallets, skipped ${skippedCount} wallets.`);
}

async function updateTaprootValue(filePath, oldValue, newValue) {
  try {
    // Read the wallet file
    const walletData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const walletName = path.basename(filePath, '.json');
    
    // Check if the wallet has features
    if (walletData.features) {
      // Check if the taprootTransactions feature exists
      if (walletData.features.taprootTransactions !== undefined) {
        // Get the current value (might be string or object)
        let currentValue = walletData.features.taprootTransactions;
        
        // Determine if we need to process a simple value or a complex object
        if (typeof currentValue === 'object' && currentValue.value !== undefined) {
          // It's an object with a value property
          if (currentValue.value === oldValue) {
            currentValue.value = newValue;
            
            // Write the updated data back to the file
            fs.writeFileSync(filePath, JSON.stringify(walletData, null, 2));
            console.log(`Updated ${walletName}: taprootTransactions from "${oldValue}" to "${newValue}" (object format)`);
            return true;
          } else {
            console.log(`Skipped ${walletName}: taprootTransactions value is not "${oldValue}" (current value: "${currentValue.value}")`);
            return false;
          }
        } else {
          // It's a simple string value
          if (currentValue === oldValue) {
            walletData.features.taprootTransactions = newValue;
            
            // Write the updated data back to the file
            fs.writeFileSync(filePath, JSON.stringify(walletData, null, 2));
            console.log(`Updated ${walletName}: taprootTransactions from "${oldValue}" to "${newValue}"`);
            return true;
          } else {
            console.log(`Skipped ${walletName}: taprootTransactions is not "${oldValue}" (current value: "${currentValue}")`);
            return false;
          }
        }
      } else {
        console.log(`Skipped ${walletName}: taprootTransactions feature not found`);
        return false;
      }
    } else {
      console.log(`Skipped ${walletName}: features object not found`);
      return false;
    }
  } catch (error) {
    console.error(`Error processing ${filePath}: ${error.message}`);
    return false;
  }
}

async function updateTaprootValueFromCustomText(filePath, customTextValue, newValue) {
  try {
    // Read the wallet file
    const walletData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const walletName = path.basename(filePath, '.json');
    
    // Check if the wallet has features
    if (walletData.features) {
      // Check if the taprootTransactions feature exists
      if (walletData.features.taprootTransactions !== undefined) {
        // Get the current value
        const currentValue = walletData.features.taprootTransactions;
        
        // Check if it's an object with value="custom" and customText="Full"
        if (typeof currentValue === 'object' && 
            currentValue.value === 'custom' && 
            currentValue.customText === customTextValue) {
          
          // Replace the object with a simple string value
          walletData.features.taprootTransactions = newValue;
          
          // Write the updated data back to the file
          fs.writeFileSync(filePath, JSON.stringify(walletData, null, 2));
          console.log(`Updated ${walletName}: taprootTransactions from custom text "${customTextValue}" to "${newValue}"`);
          return true;
        } else {
          if (typeof currentValue === 'object') {
            console.log(`Skipped ${walletName}: taprootTransactions custom text is not "${customTextValue}" (current text: "${currentValue.customText || 'not set'}")`);
          } else {
            console.log(`Skipped ${walletName}: taprootTransactions is not an object with custom text (current value: "${currentValue}")`);
          }
          return false;
        }
      } else {
        console.log(`Skipped ${walletName}: taprootTransactions feature not found`);
        return false;
      }
    } else {
      console.log(`Skipped ${walletName}: features object not found`);
      return false;
    }
  } catch (error) {
    console.error(`Error processing ${filePath}: ${error.message}`);
    return false;
  }
}

// Execute the script
processWalletFiles().catch(error => {
  console.error('Error executing script:', error);
});