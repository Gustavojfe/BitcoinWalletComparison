export type WalletType = "lightning" | "onchain" | "hardware";

export type FeatureValue = "yes" | "no" | "partial" | "custom";

export interface Wallet {
  id: number;
  name: string;
  website: string;
  description: string;
  type: WalletType;
  logo?: string;
  order: number;
}

export interface Feature {
  id: number;
  name: string;
  description: string;
  type: WalletType;
  order: number;
}

export interface WalletFeature {
  id: number;
  walletId: number;
  featureId: number;
  value: FeatureValue;
  customText?: string;
}

export interface WalletWithFeatures extends Wallet {
  features: {
    featureId: number;
    featureName: string;
    featureDescription: string;
    value: FeatureValue;
    customText?: string;
  }[];
}
