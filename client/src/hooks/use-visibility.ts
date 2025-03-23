import { useState, useEffect } from 'react';
import { WalletType } from '@/lib/types';

// Keys for localStorage
const HIDDEN_WALLETS_KEY = 'hiddenWallets';
const HIDDEN_FEATURES_KEY = 'hiddenFeatures';

interface VisibilityState {
  hiddenWallets: Record<WalletType, number[]>;
  hiddenFeatures: Record<WalletType, number[]>;
}

export const useVisibility = (walletType: WalletType) => {
  // Initialize state with empty arrays
  const [state, setState] = useState<VisibilityState>({
    hiddenWallets: {
      lightning: [],
      onchain: [],
      hardware: [],
    },
    hiddenFeatures: {
      lightning: [],
      onchain: [],
      hardware: [],
    },
  });

  // Load saved state from localStorage on initial mount
  useEffect(() => {
    try {
      const savedWallets = localStorage.getItem(HIDDEN_WALLETS_KEY);
      const savedFeatures = localStorage.getItem(HIDDEN_FEATURES_KEY);
      
      if (savedWallets) {
        setState(prev => ({
          ...prev,
          hiddenWallets: JSON.parse(savedWallets)
        }));
      }
      
      if (savedFeatures) {
        setState(prev => ({
          ...prev,
          hiddenFeatures: JSON.parse(savedFeatures)
        }));
      }
    } catch (error) {
      console.error('Failed to load visibility settings:', error);
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(HIDDEN_WALLETS_KEY, JSON.stringify(state.hiddenWallets));
      localStorage.setItem(HIDDEN_FEATURES_KEY, JSON.stringify(state.hiddenFeatures));
    } catch (error) {
      console.error('Failed to save visibility settings:', error);
    }
  }, [state]);

  // Check if a wallet is hidden
  const isWalletHidden = (walletId: number): boolean => {
    return state.hiddenWallets[walletType].includes(walletId);
  };

  // Check if a feature is hidden
  const isFeatureHidden = (featureId: number): boolean => {
    return state.hiddenFeatures[walletType].includes(featureId);
  };

  // Toggle wallet visibility
  const toggleWalletVisibility = (walletId: number) => {
    setState(prev => {
      const current = [...prev.hiddenWallets[walletType]];
      const index = current.indexOf(walletId);
      
      if (index === -1) {
        // Add wallet to hidden list
        return {
          ...prev,
          hiddenWallets: {
            ...prev.hiddenWallets,
            [walletType]: [...current, walletId]
          }
        };
      } else {
        // Remove wallet from hidden list
        current.splice(index, 1);
        return {
          ...prev,
          hiddenWallets: {
            ...prev.hiddenWallets,
            [walletType]: current
          }
        };
      }
    });
  };

  // Toggle feature visibility
  const toggleFeatureVisibility = (featureId: number) => {
    setState(prev => {
      const current = [...prev.hiddenFeatures[walletType]];
      const index = current.indexOf(featureId);
      
      if (index === -1) {
        // Add feature to hidden list
        return {
          ...prev,
          hiddenFeatures: {
            ...prev.hiddenFeatures,
            [walletType]: [...current, featureId]
          }
        };
      } else {
        // Remove feature from hidden list
        current.splice(index, 1);
        return {
          ...prev,
          hiddenFeatures: {
            ...prev.hiddenFeatures,
            [walletType]: current
          }
        };
      }
    });
  };

  // Get all hidden wallets for current type
  const getHiddenWallets = (): number[] => {
    return state.hiddenWallets[walletType];
  };

  // Get all hidden features for current type
  const getHiddenFeatures = (): number[] => {
    return state.hiddenFeatures[walletType];
  };

  return {
    isWalletHidden,
    isFeatureHidden,
    toggleWalletVisibility,
    toggleFeatureVisibility,
    getHiddenWallets,
    getHiddenFeatures
  };
};