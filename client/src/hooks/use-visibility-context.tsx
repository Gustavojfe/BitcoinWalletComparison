import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WalletType } from '@/lib/types';
import { queryClient } from '@/lib/queryClient';

// Keys for localStorage
const HIDDEN_WALLETS_KEY = 'hiddenWallets';
const HIDDEN_FEATURES_KEY = 'hiddenFeatures';

interface VisibilityState {
  hiddenWallets: Record<WalletType, number[]>;
  hiddenFeatures: Record<WalletType, number[]>;
}

interface VisibilityContextType {
  isWalletHidden: (walletType: WalletType, walletId: number) => boolean;
  isFeatureHidden: (walletType: WalletType, featureId: number) => boolean;
  toggleWalletVisibility: (walletType: WalletType, walletId: number) => void;
  toggleFeatureVisibility: (walletType: WalletType, featureId: number) => void;
  getHiddenWallets: (walletType: WalletType) => number[];
  getHiddenFeatures: (walletType: WalletType) => number[];
}

const VisibilityContext = createContext<VisibilityContextType | undefined>(undefined);

export const VisibilityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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
  const isWalletHidden = (walletType: WalletType, walletId: number): boolean => {
    return state.hiddenWallets[walletType].includes(walletId);
  };

  // Check if a feature is hidden
  const isFeatureHidden = (walletType: WalletType, featureId: number): boolean => {
    return state.hiddenFeatures[walletType].includes(featureId);
  };

  // Toggle wallet visibility
  const toggleWalletVisibility = (walletType: WalletType, walletId: number) => {
    setState(prev => {
      const current = [...prev.hiddenWallets[walletType]];
      const index = current.indexOf(walletId);
      
      let newState;
      if (index === -1) {
        // Add wallet to hidden list
        newState = {
          ...prev,
          hiddenWallets: {
            ...prev.hiddenWallets,
            [walletType]: [...current, walletId]
          }
        };
      } else {
        // Remove wallet from hidden list
        current.splice(index, 1);
        newState = {
          ...prev,
          hiddenWallets: {
            ...prev.hiddenWallets,
            [walletType]: current
          }
        };
      }
      
      // Force refresh related queries
      queryClient.invalidateQueries({ queryKey: ['/api/wallets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/wallet-features'] });
      
      return newState;
    });
  };

  // Toggle feature visibility
  const toggleFeatureVisibility = (walletType: WalletType, featureId: number) => {
    setState(prev => {
      const current = [...prev.hiddenFeatures[walletType]];
      const index = current.indexOf(featureId);
      
      let newState;
      if (index === -1) {
        // Add feature to hidden list
        newState = {
          ...prev,
          hiddenFeatures: {
            ...prev.hiddenFeatures,
            [walletType]: [...current, featureId]
          }
        };
      } else {
        // Remove feature from hidden list
        current.splice(index, 1);
        newState = {
          ...prev,
          hiddenFeatures: {
            ...prev.hiddenFeatures,
            [walletType]: current
          }
        };
      }
      
      // Force refresh related queries
      queryClient.invalidateQueries({ queryKey: ['/api/features'] });
      queryClient.invalidateQueries({ queryKey: ['/api/wallet-features'] });
      
      return newState;
    });
  };

  // Get all hidden wallets for a type
  const getHiddenWallets = (walletType: WalletType): number[] => {
    return state.hiddenWallets[walletType];
  };

  // Get all hidden features for a type
  const getHiddenFeatures = (walletType: WalletType): number[] => {
    return state.hiddenFeatures[walletType];
  };

  return (
    <VisibilityContext.Provider
      value={{
        isWalletHidden,
        isFeatureHidden,
        toggleWalletVisibility,
        toggleFeatureVisibility,
        getHiddenWallets,
        getHiddenFeatures
      }}
    >
      {children}
    </VisibilityContext.Provider>
  );
};

export const useVisibilityContext = () => {
  const context = useContext(VisibilityContext);
  if (context === undefined) {
    throw new Error('useVisibilityContext must be used within a VisibilityProvider');
  }
  return context;
};

// Convenience hook to work with a specific wallet type
export const useVisibility = (walletType: WalletType) => {
  const {
    isWalletHidden: isWalletHiddenContext,
    isFeatureHidden: isFeatureHiddenContext,
    toggleWalletVisibility: toggleWalletVisibilityContext,
    toggleFeatureVisibility: toggleFeatureVisibilityContext,
    getHiddenWallets: getHiddenWalletsContext,
    getHiddenFeatures: getHiddenFeaturesContext
  } = useVisibilityContext();

  // Create wallet-type specific versions
  const isWalletHidden = (walletId: number) => isWalletHiddenContext(walletType, walletId);
  const isFeatureHidden = (featureId: number) => isFeatureHiddenContext(walletType, featureId);
  const toggleWalletVisibility = (walletId: number) => toggleWalletVisibilityContext(walletType, walletId);
  const toggleFeatureVisibility = (featureId: number) => toggleFeatureVisibilityContext(walletType, featureId);
  const getHiddenWallets = () => getHiddenWalletsContext(walletType);
  const getHiddenFeatures = () => getHiddenFeaturesContext(walletType);

  return {
    isWalletHidden,
    isFeatureHidden,
    toggleWalletVisibility,
    toggleFeatureVisibility,
    getHiddenWallets,
    getHiddenFeatures
  };
};