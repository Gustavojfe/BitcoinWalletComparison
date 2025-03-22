import { 
  users, type User, type InsertUser,
  wallets, type Wallet, type InsertWallet,
  features, type Feature, type InsertFeature,
  walletFeatures, type WalletFeature, type InsertWalletFeature,
  type WalletType, type WalletWithFeatures
} from "@shared/schema";

// Storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Wallet operations
  getAllWallets(type?: WalletType): Promise<Wallet[]>;
  getWalletById(id: number): Promise<Wallet | undefined>;
  createWallet(wallet: InsertWallet): Promise<Wallet>;
  updateWallet(id: number, wallet: Partial<InsertWallet>): Promise<Wallet | undefined>;
  deleteWallet(id: number): Promise<boolean>;
  getWalletsWithFeatures(type?: WalletType): Promise<WalletWithFeatures[]>;

  // Feature operations
  getAllFeatures(type?: WalletType): Promise<Feature[]>;
  getFeatureById(id: number): Promise<Feature | undefined>;
  createFeature(feature: InsertFeature): Promise<Feature>;
  updateFeature(id: number, feature: Partial<InsertFeature>): Promise<Feature | undefined>;
  deleteFeature(id: number): Promise<boolean>;

  // WalletFeature operations
  getWalletFeature(walletId: number, featureId: number): Promise<WalletFeature | undefined>;
  setWalletFeature(walletFeature: InsertWalletFeature): Promise<WalletFeature>;
  updateWalletFeature(id: number, walletFeature: Partial<InsertWalletFeature>): Promise<WalletFeature | undefined>;
  deleteWalletFeature(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private wallets: Map<number, Wallet>;
  private features: Map<number, Feature>;
  private walletFeatures: Map<number, WalletFeature>;
  
  private userId: number;
  private walletId: number;
  private featureId: number;
  private walletFeatureId: number;

  constructor() {
    this.users = new Map();
    this.wallets = new Map();
    this.features = new Map();
    this.walletFeatures = new Map();
    
    this.userId = 1;
    this.walletId = 1;
    this.featureId = 1;
    this.walletFeatureId = 1;

    // Initialize with sample data
    this.initializeSampleData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Wallet operations
  async getAllWallets(type?: WalletType): Promise<Wallet[]> {
    const wallets = Array.from(this.wallets.values());
    if (type) {
      return wallets.filter(wallet => wallet.type === type);
    }
    return wallets;
  }

  async getWalletById(id: number): Promise<Wallet | undefined> {
    return this.wallets.get(id);
  }

  async createWallet(wallet: InsertWallet): Promise<Wallet> {
    const id = this.walletId++;
    const newWallet: Wallet = { ...wallet, id };
    this.wallets.set(id, newWallet);
    return newWallet;
  }

  async updateWallet(id: number, wallet: Partial<InsertWallet>): Promise<Wallet | undefined> {
    const existingWallet = this.wallets.get(id);
    if (!existingWallet) return undefined;
    
    const updatedWallet = { ...existingWallet, ...wallet };
    this.wallets.set(id, updatedWallet);
    return updatedWallet;
  }

  async deleteWallet(id: number): Promise<boolean> {
    return this.wallets.delete(id);
  }

  async getWalletsWithFeatures(type?: WalletType): Promise<WalletWithFeatures[]> {
    const wallets = await this.getAllWallets(type);
    
    return Promise.all(wallets.map(async wallet => {
      const walletFeatures = Array.from(this.walletFeatures.values())
        .filter(wf => wf.walletId === wallet.id)
        .map(wf => {
          const feature = this.features.get(wf.featureId);
          return {
            featureId: wf.featureId,
            featureName: feature?.name || 'Unknown Feature',
            featureDescription: feature?.description || '',
            value: wf.value,
            customText: wf.customText,
          };
        });
      
      return {
        ...wallet,
        features: walletFeatures,
      };
    }));
  }

  // Feature operations
  async getAllFeatures(type?: WalletType): Promise<Feature[]> {
    const features = Array.from(this.features.values());
    if (type) {
      return features.filter(feature => feature.type === type);
    }
    return features;
  }

  async getFeatureById(id: number): Promise<Feature | undefined> {
    return this.features.get(id);
  }

  async createFeature(feature: InsertFeature): Promise<Feature> {
    const id = this.featureId++;
    const newFeature: Feature = { ...feature, id };
    this.features.set(id, newFeature);
    return newFeature;
  }

  async updateFeature(id: number, feature: Partial<InsertFeature>): Promise<Feature | undefined> {
    const existingFeature = this.features.get(id);
    if (!existingFeature) return undefined;
    
    const updatedFeature = { ...existingFeature, ...feature };
    this.features.set(id, updatedFeature);
    return updatedFeature;
  }

  async deleteFeature(id: number): Promise<boolean> {
    return this.features.delete(id);
  }

  // WalletFeature operations
  async getWalletFeature(walletId: number, featureId: number): Promise<WalletFeature | undefined> {
    return Array.from(this.walletFeatures.values()).find(
      wf => wf.walletId === walletId && wf.featureId === featureId,
    );
  }

  async setWalletFeature(walletFeature: InsertWalletFeature): Promise<WalletFeature> {
    // Check if entry already exists
    const existing = await this.getWalletFeature(walletFeature.walletId, walletFeature.featureId);
    if (existing) {
      return this.updateWalletFeature(existing.id, walletFeature) as Promise<WalletFeature>;
    }
    
    // Otherwise create new
    const id = this.walletFeatureId++;
    const newWalletFeature: WalletFeature = { ...walletFeature, id };
    this.walletFeatures.set(id, newWalletFeature);
    return newWalletFeature;
  }

  async updateWalletFeature(id: number, walletFeature: Partial<InsertWalletFeature>): Promise<WalletFeature | undefined> {
    const existingWalletFeature = this.walletFeatures.get(id);
    if (!existingWalletFeature) return undefined;
    
    const updatedWalletFeature = { ...existingWalletFeature, ...walletFeature };
    this.walletFeatures.set(id, updatedWalletFeature);
    return updatedWalletFeature;
  }

  async deleteWalletFeature(id: number): Promise<boolean> {
    return this.walletFeatures.delete(id);
  }

  // Initialize sample data
  private async initializeSampleData() {
    // Add sample Lightning wallets
    const phoenix = await this.createWallet({
      name: "Phoenix",
      website: "https://phoenix.acinq.co/",
      description: "A self-custodial Lightning Network wallet by ACINQ with simplified channel management.",
      type: "lightning",
      logo: "phoenix",
      order: 1
    });
    
    const muun = await this.createWallet({
      name: "Muun",
      website: "https://muun.com/",
      description: "A non-custodial bitcoin wallet with integrated Lightning functionality.",
      type: "lightning",
      logo: "muun",
      order: 2
    });
    
    const breez = await this.createWallet({
      name: "Breez",
      website: "https://breez.technology/",
      description: "A non-custodial Lightning wallet with integrated podcast player and point-of-sale features.",
      type: "lightning",
      logo: "breez",
      order: 3
    });
    
    const walletOfSatoshi = await this.createWallet({
      name: "Wallet of Satoshi",
      website: "https://www.walletofsatoshi.com/",
      description: "A custodial Lightning wallet focused on simplicity and ease of use.",
      type: "lightning",
      logo: "walletofsatoshi",
      order: 4
    });
    
    const zeus = await this.createWallet({
      name: "Zeus",
      website: "https://zeusln.app/",
      description: "A mobile Lightning wallet that can connect to your own node.",
      type: "lightning",
      logo: "zeus",
      order: 5
    });

    // Add Lightning features
    const onChain = await this.createFeature({
      name: "On-Chain",
      description: "The ability to send and receive on-chain Bitcoin transactions.",
      type: "lightning",
      order: 1
    });
    
    const receiveOnChain = await this.createFeature({
      name: "Receive On-Chain",
      description: "The ability to generate addresses and receive on-chain Bitcoin.",
      type: "lightning",
      order: 2
    });
    
    const sendOnChain = await this.createFeature({
      name: "Send On-Chain",
      description: "The ability to send Bitcoin through on-chain transactions.",
      type: "lightning",
      order: 3
    });
    
    const invoice = await this.createFeature({
      name: "Invoice",
      description: "Create and manage Lightning Network invoices for receiving payments.",
      type: "lightning",
      order: 4
    });
    
    const lnurl = await this.createFeature({
      name: "LNURL(s)",
      description: "Support for different LNURL protocols like LNURL-pay, LNURL-withdraw, etc.",
      type: "lightning",
      order: 5
    });
    
    const lightningAddress = await this.createFeature({
      name: "Lightning Address",
      description: "Support for Lightning Addresses in the format user@domain.com.",
      type: "lightning",
      order: 6
    });
    
    const bolt11 = await this.createFeature({
      name: "BoltII",
      description: "Implementation of the BOLT 11 specification for Lightning payments.",
      type: "lightning",
      order: 7
    });
    
    const dnsSeeds = await this.createFeature({
      name: "DNS (Seeds)",
      description: "Use of DNS seeds for finding Lightning Network nodes.",
      type: "lightning",
      order: 8
    });
    
    const paymentRouting = await this.createFeature({
      name: "Payment Routing",
      description: "Ability to route payments through the Lightning Network.",
      type: "lightning",
      order: 9
    });
    
    const mpp = await this.createFeature({
      name: "MPP",
      description: "Multi-Path Payments: splitting payments across multiple Lightning channels.",
      type: "lightning",
      order: 10
    });
    
    const manageOwnChannels = await this.createFeature({
      name: "Manage Own Channels",
      description: "Ability for users to create and manage their own Lightning channels.",
      type: "lightning",
      order: 11
    });
    
    const lowIncomingLiquidity = await this.createFeature({
      name: "Low Incoming Liquidity",
      description: "Ways to address incoming liquidity challenges for receiving payments.",
      type: "lightning",
      order: 12
    });

    // Add wallet feature relationships
    
    // Phoenix features
    await this.setWalletFeature({ walletId: phoenix.id, featureId: onChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: phoenix.id, featureId: receiveOnChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: phoenix.id, featureId: sendOnChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: phoenix.id, featureId: invoice.id, value: "yes" });
    await this.setWalletFeature({ walletId: phoenix.id, featureId: lnurl.id, value: "partial" });
    await this.setWalletFeature({ walletId: phoenix.id, featureId: lightningAddress.id, value: "no" });
    await this.setWalletFeature({ walletId: phoenix.id, featureId: bolt11.id, value: "yes" });
    await this.setWalletFeature({ walletId: phoenix.id, featureId: dnsSeeds.id, value: "yes" });
    await this.setWalletFeature({ walletId: phoenix.id, featureId: paymentRouting.id, value: "yes" });
    await this.setWalletFeature({ walletId: phoenix.id, featureId: mpp.id, value: "yes" });
    await this.setWalletFeature({ walletId: phoenix.id, featureId: manageOwnChannels.id, value: "custom", customText: "Built-in" });
    await this.setWalletFeature({ walletId: phoenix.id, featureId: lowIncomingLiquidity.id, value: "custom", customText: "Auto" });
    
    // Muun features
    await this.setWalletFeature({ walletId: muun.id, featureId: onChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: muun.id, featureId: receiveOnChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: muun.id, featureId: sendOnChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: muun.id, featureId: invoice.id, value: "custom", customText: "Receive Only" });
    await this.setWalletFeature({ walletId: muun.id, featureId: lnurl.id, value: "no" });
    await this.setWalletFeature({ walletId: muun.id, featureId: lightningAddress.id, value: "no" });
    await this.setWalletFeature({ walletId: muun.id, featureId: bolt11.id, value: "yes" });
    await this.setWalletFeature({ walletId: muun.id, featureId: dnsSeeds.id, value: "no" });
    await this.setWalletFeature({ walletId: muun.id, featureId: paymentRouting.id, value: "partial" });
    await this.setWalletFeature({ walletId: muun.id, featureId: mpp.id, value: "partial" });
    await this.setWalletFeature({ walletId: muun.id, featureId: manageOwnChannels.id, value: "no" });
    await this.setWalletFeature({ walletId: muun.id, featureId: lowIncomingLiquidity.id, value: "yes" });
    
    // Breez features
    await this.setWalletFeature({ walletId: breez.id, featureId: onChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: breez.id, featureId: receiveOnChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: breez.id, featureId: sendOnChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: breez.id, featureId: invoice.id, value: "yes" });
    await this.setWalletFeature({ walletId: breez.id, featureId: lnurl.id, value: "yes" });
    await this.setWalletFeature({ walletId: breez.id, featureId: lightningAddress.id, value: "yes" });
    await this.setWalletFeature({ walletId: breez.id, featureId: bolt11.id, value: "yes" });
    await this.setWalletFeature({ walletId: breez.id, featureId: dnsSeeds.id, value: "yes" });
    await this.setWalletFeature({ walletId: breez.id, featureId: paymentRouting.id, value: "custom", customText: "LSP" });
    await this.setWalletFeature({ walletId: breez.id, featureId: mpp.id, value: "yes" });
    await this.setWalletFeature({ walletId: breez.id, featureId: manageOwnChannels.id, value: "custom", customText: "Limited" });
    await this.setWalletFeature({ walletId: breez.id, featureId: lowIncomingLiquidity.id, value: "custom", customText: "LSP" });
    
    // Wallet of Satoshi features
    await this.setWalletFeature({ walletId: walletOfSatoshi.id, featureId: onChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: walletOfSatoshi.id, featureId: receiveOnChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: walletOfSatoshi.id, featureId: sendOnChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: walletOfSatoshi.id, featureId: invoice.id, value: "yes" });
    await this.setWalletFeature({ walletId: walletOfSatoshi.id, featureId: lnurl.id, value: "yes" });
    await this.setWalletFeature({ walletId: walletOfSatoshi.id, featureId: lightningAddress.id, value: "yes" });
    await this.setWalletFeature({ walletId: walletOfSatoshi.id, featureId: bolt11.id, value: "yes" });
    await this.setWalletFeature({ walletId: walletOfSatoshi.id, featureId: dnsSeeds.id, value: "no" });
    await this.setWalletFeature({ walletId: walletOfSatoshi.id, featureId: paymentRouting.id, value: "custom", customText: "Custodial" });
    await this.setWalletFeature({ walletId: walletOfSatoshi.id, featureId: mpp.id, value: "custom", customText: "Custodial" });
    await this.setWalletFeature({ walletId: walletOfSatoshi.id, featureId: manageOwnChannels.id, value: "no" });
    await this.setWalletFeature({ walletId: walletOfSatoshi.id, featureId: lowIncomingLiquidity.id, value: "custom", customText: "Custodial" });
    
    // Zeus features
    await this.setWalletFeature({ walletId: zeus.id, featureId: onChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: zeus.id, featureId: receiveOnChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: zeus.id, featureId: sendOnChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: zeus.id, featureId: invoice.id, value: "yes" });
    await this.setWalletFeature({ walletId: zeus.id, featureId: lnurl.id, value: "yes" });
    await this.setWalletFeature({ walletId: zeus.id, featureId: lightningAddress.id, value: "yes" });
    await this.setWalletFeature({ walletId: zeus.id, featureId: bolt11.id, value: "yes" });
    await this.setWalletFeature({ walletId: zeus.id, featureId: dnsSeeds.id, value: "custom", customText: "Node" });
    await this.setWalletFeature({ walletId: zeus.id, featureId: paymentRouting.id, value: "custom", customText: "Node" });
    await this.setWalletFeature({ walletId: zeus.id, featureId: mpp.id, value: "custom", customText: "Node" });
    await this.setWalletFeature({ walletId: zeus.id, featureId: manageOwnChannels.id, value: "yes" });
    await this.setWalletFeature({ walletId: zeus.id, featureId: lowIncomingLiquidity.id, value: "custom", customText: "Node" });
  }
}

export const storage = new MemStorage();
