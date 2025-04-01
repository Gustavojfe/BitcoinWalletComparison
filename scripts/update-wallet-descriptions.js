/**
 * This script updates the descriptions of all wallet JSON files with new English content.
 * 
 * Run with: node scripts/update-wallet-descriptions.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name for the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// The descriptions are exactly as provided in the user's file
const walletDescriptions = {
  "alby_hub": "A self-custodial Lightning wallet that connects to Alby Extension for web interactions, Alby Go for real-world payments, and hundreds of apps via Nostr Wallet Connect (NWC).",
  "aqua": "A global Bitcoin wallet focused on financial inclusion, designed for Latin America. Uses Boltz swaps for Lightning payments.",
  "bitkit": "A simple, powerful self-custodial wallet for instant payments anywhere. Manage your own channels or use Blocktank LSP.",
  "blink": "A custodial Bitcoin wallet for everyday use. Simple, secure, and requires a phone number to sign up.",
  "blitz_wallet": "A self-custodial Bitcoin and Lightning wallet using Breez SDK. Starts with Liquid swaps (Boltz) and evolves into an embedded node with LSP-managed channels.",
  "blixt_wallet": "An open-source, non-custodial Lightning wallet for Android and iOS, packed with features for Bitcoiners exploring the Lightning Network.",
  "breez": "A non-custodial Lightning wallet with an embedded node, POS, podcast player, and marketplace—delivering a top-tier Bitcoin experience.",
  "coinos": "A free, easy-to-use web wallet and payment page supporting Lightning (BOLT11/BOLT12), Liquid, Ecash, and on-chain payments. Self-hosting available.",
  "electrum": "A fast, secure Bitcoin wallet for desktop and Android, trusted since 2011 for a wide range of users.",
  "muun": "A self-custodial Bitcoin and Lightning wallet using submarine swaps. Easy to use, though on-chain fees can increase costs.",
  "phoenix": "A Lightning-native wallet with seamless payments—fast, cheap, and LSP-managed for simplicity.",
  "primal": "A Nostr client with a built-in Bitcoin wallet, offering smooth feeds and easy onboarding for Nostr beginners.",
  "ride_the_lightning": "A powerful, self-hosted web tool for managing Lightning nodes, ideal for advanced and business users.",
  "sati": "A WhatsApp bot for fast, secure Bitcoin and stablecoin payments—no extra app needed, with super-easy onboarding.",
  "speed": "A custodial wallet for instant, secure, low-fee Bitcoin and USDT payments, available as a mobile app or browser extension.",
  "wallet_of_satoshi": "A zero-configuration custodial Lightning wallet for iOS and Android, prioritizing simplicity—world's most popular Lightning wallet.",
  "zbd": "A mobile app to earn Bitcoin through games, surveys, polls, and app discovery—fun and rewarding.",
  "zeus": "A powerful, open-source, self-custodial Bitcoin wallet for managing remote nodes or its embedded node, feature-rich for advanced users."
};

// Map file names to keys in our descriptions object (if needed)
const fileNameToKey = {
  "alby-hub": "alby_hub",
  "alby": "alby_hub", // In case the file is named this way
  "aqua": "aqua",
  "bitkit": "bitkit",
  "blink": "blink",
  "blitz-wallet": "blitz_wallet",
  "blitz": "blitz_wallet", // Alternative naming
  "blixt-wallet": "blixt_wallet",
  "blixt": "blixt_wallet", // Alternative naming
  "breez": "breez",
  "coinos": "coinos",
  "electrum": "electrum",
  "muun": "muun",
  "phoenix": "phoenix",
  "primal": "primal",
  "ride-the-lightning": "ride_the_lightning",
  "rtl": "ride_the_lightning", // Alternative naming
  "sati": "sati",
  "speed": "speed",
  "wallet-of-satoshi": "wallet_of_satoshi",
  "walletofsatoshi": "wallet_of_satoshi", // The actual file name
  "wos": "wallet_of_satoshi", // Alternative naming
  "zbd": "zbd",
  "zeus": "zeus"
};

function processWalletFiles() {
  const walletsDir = path.join(__dirname, '..', 'data', 'wallets');
  const files = fs.readdirSync(walletsDir);
  
  console.log(`Processing ${files.length} wallet files...`);
  
  let updatedCount = 0;
  let errorCount = 0;
  
  files.forEach(file => {
    if (file.endsWith('.json')) {
      try {
        const filePath = path.join(walletsDir, file);
        const result = processWalletFile(filePath);
        if (result) updatedCount++;
      } catch (error) {
        console.error(`Error processing ${file}:`, error);
        errorCount++;
      }
    }
  });
  
  console.log(`Updated ${updatedCount} wallet files successfully.`);
  if (errorCount > 0) {
    console.error(`Encountered errors in ${errorCount} files.`);
  }
}

function processWalletFile(filePath) {
  // Read the wallet file
  const walletData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  // Get filename without extension to match with our keys
  const fileName = path.basename(filePath, '.json');
  const key = fileNameToKey[fileName] || fileName.replace(/-/g, '_');
  
  if (!walletDescriptions[key]) {
    console.warn(`No description found for ${fileName} (key: ${key})`);
    return false;
  }
  
  // Update the description
  const newDescription = walletDescriptions[key];
  
  if (walletData.description === newDescription) {
    console.log(`${fileName} description already up to date.`);
    return false;
  }
  
  walletData.description = newDescription;
  
  // Write the updated wallet file
  fs.writeFileSync(filePath, JSON.stringify(walletData, null, 2), 'utf8');
  console.log(`Updated description for ${fileName}`);
  return true;
}

// Run the script
processWalletFiles();