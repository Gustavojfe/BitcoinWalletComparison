/**
 * This script updates both English and Spanish translation files to add translations
 * related to the implementation feature.
 * 
 * Run with: node scripts/add-implementation-translations.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the paths to translation files
const enTranslationPath = path.join(__dirname, '../client/src/translations/en.json');
const esTranslationPath = path.join(__dirname, '../client/src/translations/es.json');

// Load the current translation files
const enTranslation = JSON.parse(fs.readFileSync(enTranslationPath, 'utf8'));
const esTranslation = JSON.parse(fs.readFileSync(esTranslationPath, 'utf8'));

// Update English translations

// 1. Make sure the feature style is defined
if (enTranslation.featureStatus && enTranslation.featureStatus.styles) {
  enTranslation.featureStatus.styles.implementation = "bg-blue-100 text-blue-600";
}

// 2. Add implementation feature values for LND, CLN, and "does_not_apply"
if (enTranslation.featureStatus && enTranslation.featureStatus.values) {
  // LND implementation
  enTranslation.featureStatus.values.lnd = {
    label: "LND",
    title: "Uses LND implementation"
  };
  
  // CLN (Core Lightning) implementation
  enTranslation.featureStatus.values.cln = {
    label: "CLN",
    title: "Uses Core Lightning (CLN) implementation"
  };
  
  // Does not apply for implementation
  enTranslation.featureStatus.values.does_not_apply_implementation = {
    label: "N/A",
    title: "Implementation does not apply to this wallet"
  };
}

// 3. Add implementation feature description if missing
if (enTranslation.featureDescriptions) {
  enTranslation.featureDescriptions.implementation = "Lightning Network implementation used by the wallet.";
}

// Update Spanish translations

// 1. Make sure the feature style is defined
if (esTranslation.featureStatus && esTranslation.featureStatus.styles) {
  esTranslation.featureStatus.styles.implementation = "bg-blue-100 text-blue-600";
}

// 2. Add implementation feature values for LND, CLN, and "does_not_apply"
if (esTranslation.featureStatus && esTranslation.featureStatus.values) {
  // LND implementation
  esTranslation.featureStatus.values.lnd = {
    label: "LND",
    title: "Usa implementación LND"
  };
  
  // CLN (Core Lightning) implementation
  esTranslation.featureStatus.values.cln = {
    label: "CLN",
    title: "Usa implementación Core Lightning (CLN)"
  };
  
  // Does not apply for implementation
  esTranslation.featureStatus.values.does_not_apply_implementation = {
    label: "N/A",
    title: "La implementación no aplica a esta cartera"
  };
}

// 3. Add implementation feature description if missing
if (esTranslation.featureDescriptions) {
  esTranslation.featureDescriptions.implementation = "Implementación de Lightning Network utilizada por la cartera.";
}

// Write the updated translations back to files
fs.writeFileSync(enTranslationPath, JSON.stringify(enTranslation, null, 2), 'utf8');
fs.writeFileSync(esTranslationPath, JSON.stringify(esTranslation, null, 2), 'utf8');

console.log('Implementation translations added to both English and Spanish files.');