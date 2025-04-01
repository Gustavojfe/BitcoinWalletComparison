/**
 * This script updates all wallet JSON files to:
 * 1. Rename the "kyc" feature key to "noKyc"
 * 2. Flip the values: "yes" becomes "no", "no" becomes "yes"
 * 
 * Run with: node scripts/update-kyc-to-nokyc.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directory containing wallet JSON files
const walletsDir = path.join(process.cwd(), 'data', 'wallets');

// Function to flip KYC values
function flipKycValue(value) {
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'yes') return 'no';
    if (value.toLowerCase() === 'no') return 'yes';
    return value; // Keep other values as is (e.g., "optional", "custom", etc.)
  } else if (typeof value === 'object' && value !== null) {
    // For custom objects (e.g., with customText), maintain the structure but flip the value
    const result = { ...value };
    if (result.value && typeof result.value === 'string') {
      if (result.value.toLowerCase() === 'yes') result.value = 'no';
      else if (result.value.toLowerCase() === 'no') result.value = 'yes';
    }
    return result;
  }
  return value;
}

// Function to process a single wallet file
function processWalletFile(filePath) {
  try {
    // Read and parse the wallet file
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const wallet = JSON.parse(fileContent);
    
    // Check if the wallet has a "kyc" feature
    if (wallet.features && 'kyc' in wallet.features) {
      const kycValue = wallet.features.kyc;
      
      // Create a new noKyc property with flipped value
      wallet.features.noKyc = flipKycValue(kycValue);
      
      // Delete the old kyc property
      delete wallet.features.kyc;
      
      // Write the updated wallet back to the file
      fs.writeFileSync(filePath, JSON.stringify(wallet, null, 2), 'utf-8');
      console.log(`Updated ${path.basename(filePath)}: kyc → noKyc (${JSON.stringify(kycValue)} → ${JSON.stringify(wallet.features.noKyc)})`);
    } else {
      console.log(`Skipped ${path.basename(filePath)}: No "kyc" feature found`);
    }
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
  }
}

// Get all wallet JSON files
let walletFiles;
try {
  walletFiles = fs.readdirSync(walletsDir)
    .filter(file => file.endsWith('.json'))
    .map(file => path.join(walletsDir, file));
} catch (error) {
  console.error('Error reading wallet directory:', error);
  process.exit(1);
}

console.log(`Found ${walletFiles.length} wallet files to process...`);

// Process each wallet file
walletFiles.forEach(processWalletFile);

console.log('\nUpdate complete! Please check the updated wallet files.');
console.log('\nReminder: Also update ComparisonTable.tsx and translations to reflect this change.');