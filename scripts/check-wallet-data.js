/**
 * This script fetches and displays wallet data from the API to help debug category display issues
 * 
 * Run with: node scripts/check-wallet-data.js
 */

import http from 'http';

// Function to make an HTTP request and return a promise
function fetchApi(endpoint) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:5000${endpoint}`, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Main function to fetch and display wallet data
async function checkWalletData() {
  try {
    // Fetch wallet features
    const walletFeatures = await fetchApi('/api/wallet-features');
    
    // Find Alby wallet
    const albyWallet = walletFeatures.find(wallet => wallet.name === 'Alby Hub');
    
    if (albyWallet) {
      console.log('Alby Hub Wallet Found:');
      console.log(`Name: ${albyWallet.name}`);
      console.log(`Website: ${albyWallet.website}`);
      console.log(`Description: ${albyWallet.description}`);
      console.log(`Type: ${albyWallet.type}`);
      
      // Look for Category feature
      console.log('\nFeatures:');
      const categoryFeature = albyWallet.features.find(feature => 
        feature.featureName === 'Category'
      );
      
      if (categoryFeature) {
        console.log('\nCategory Feature:');
        console.log(JSON.stringify(categoryFeature, null, 2));
      } else {
        console.log('\nNo Category feature found!');
        
        // Find custodialStatus feature as fallback
        const custodialStatusFeature = albyWallet.features.find(feature => 
          feature.featureName === 'Category' || feature.featureId === 'custodialStatus'
        );
        
        if (custodialStatusFeature) {
          console.log('\nFound CustodialStatus Feature instead:');
          console.log(JSON.stringify(custodialStatusFeature, null, 2));
        }
      }
      
      // List all feature names and IDs for reference
      console.log('\nAll Features:');
      albyWallet.features.forEach(feature => {
        console.log(`- ${feature.featureName} (ID: ${feature.featureId}): ${feature.value}`);
      });
    } else {
      console.log('Alby Hub wallet not found!');
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// Run the function
checkWalletData();