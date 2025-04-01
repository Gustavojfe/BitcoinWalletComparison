/**
 * This script updates wallet JSON files with new wallet descriptions.
 * It uses the exact descriptions provided in the English and Spanish mapping below.
 * 
 * Run with: node scripts/update-wallet-descriptions.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Exact English descriptions as provided
const englishDescriptions = {
  "Alby Hub": "A self-custodial Lightning wallet that connects to Alby Extension for web interactions, Alby Go for real-world payments, and hundreds of apps via Nostr Wallet Connect (NWC).",
  "AQUA": "A global Bitcoin wallet focused on financial inclusion, designed for Latin America. Uses Boltz swaps for Lightning payments.",
  "Bitkit": "A simple, powerful self-custodial wallet for instant payments anywhere. Manage your own channels or use Blocktank LSP.",
  "Blink": "A custodial Bitcoin wallet for everyday use. Simple, secure, and requires a phone number to sign up.",
  "Blitz Wallet": "A self-custodial Bitcoin and Lightning wallet using Breez SDK. Starts with Liquid swaps (Boltz) and evolves into an embedded node with LSP-managed channels.",
  "Blixt Wallet": "An open-source, non-custodial Lightning wallet for Android and iOS, packed with features for Bitcoiners exploring the Lightning Network.",
  "Breez": "A non-custodial Lightning wallet with an embedded node, POS, podcast player, and marketplace—delivering a top-tier Bitcoin experience.",
  "Coinos": "A free, easy-to-use web wallet and payment page supporting Lightning (BOLT11/BOLT12), Liquid, Ecash, and on-chain payments. Self-hosting available.",
  "Electrum": "A fast, secure Bitcoin wallet for desktop and Android, trusted since 2011 for a wide range of users.",
  "Muun": "A self-custodial Bitcoin and Lightning wallet using submarine swaps. Easy to use, though on-chain fees can increase costs.",
  "Phoenix": "A Lightning-native wallet with seamless payments—fast, cheap, and LSP-managed for simplicity.",
  "Primal": "A Nostr client with a built-in Bitcoin wallet, offering smooth feeds and easy onboarding for Nostr beginners.",
  "Ride The Lightning": "A powerful, self-hosted web tool for managing Lightning nodes, ideal for advanced and business users.",
  "Sati": "A WhatsApp bot for fast, secure Bitcoin and stablecoin payments—no extra app needed, with super-easy onboarding.",
  "Speed": "A custodial wallet for instant, secure, low-fee Bitcoin and USDT payments, available as a mobile app or browser extension.",
  "Wallet of Satoshi": "A zero-configuration custodial Lightning wallet for iOS and Android, prioritizing simplicity—world's most popular Lightning wallet.",
  "ZBD": "A mobile app to earn Bitcoin through games, surveys, polls, and app discovery—fun and rewarding.",
  "ZEUS": "A powerful, open-source, self-custodial Bitcoin wallet for managing remote nodes or its embedded node, feature-rich for advanced users."
};

// Name mapping to match wallet names with filenames (lowercase with underscores)
const fileMapping = {
  "Alby Hub": "alby",
  "AQUA": "aqua", 
  "Bitkit": "bitkit",
  "Blink": "blink",
  "Blitz Wallet": "blitz",
  "Blixt Wallet": "blixt",
  "Breez": "breez",
  "Coinos": "coinos",
  "Electrum": "electrum",
  "Muun": "muun",
  "Phoenix": "phoenix",
  "Primal": "primal",
  "Ride The Lightning": "rtl",
  "Sati": "sati",
  "Speed": "speed",
  "Wallet of Satoshi": "walletofsatoshi",
  "ZBD": "zbd",
  "ZEUS": "zeus"
};

// This function processes all wallet files
function processWalletFiles() {
  console.log('Updating wallet descriptions...');
  
  Object.entries(englishDescriptions).forEach(([walletName, description]) => {
    const fileName = fileMapping[walletName];
    if (!fileName) {
      console.error(`No file mapping found for wallet: ${walletName}`);
      return;
    }
    
    const filePath = path.join(__dirname, '..', 'data', 'wallets', `${fileName}.json`);
    processWalletFile(filePath, description);
  });
  
  console.log('Wallet descriptions update completed!');
}

// This function updates the description in a single wallet file
function processWalletFile(filePath, newDescription) {
  try {
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return;
    }
    
    const wallet = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const oldDescription = wallet.description;
    
    // Update the description with the exact text provided
    wallet.description = newDescription;
    
    fs.writeFileSync(filePath, JSON.stringify(wallet, null, 2), 'utf8');
    console.log(`Updated ${path.basename(filePath)}: "${oldDescription}" -> "${newDescription}"`);
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
  }
}

// Execute the update function
processWalletFiles();