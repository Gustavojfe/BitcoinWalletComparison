export type WalletType = "lightning" | "onchain" | "hardware";

export type FeatureValue = "yes" | "no" | "partial" | "custom" | "send_only" | "receive_only" | "mandatory" | "optional" | "not_possible" | "ios" | "android" | "desktop" | "web" | "custodial" | "ln_node" | "liquid_swap" | "on_chain_swap" | "remote_node" | "lnd" | "ldk" | "core_lightning" | "eclair";

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
