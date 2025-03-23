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

  // Initialize data from JSON files
  private async initializeSampleData() {
    // For now, we'll still include a fallback to sample data if no files are found
    
    // Try to load from JSON files first
    const {
      getWalletFiles,
      getFeatureFiles,
      loadWalletFromFile,
      loadFeaturesFromFile,
      walletFileToInsertWallet,
      featureFileToInsertFeature,
      createWalletFeature
    } = await import('./data-loader');
    
    // Load features from files
    const featureFiles = getFeatureFiles();
    const featureDefinitions = new Map<string, { feature: Feature, stringId: string }>();
    
    if (featureFiles.length > 0) {
      for (const filePath of featureFiles) {
        const featureList = loadFeaturesFromFile(filePath);
        for (const featureDef of featureList) {
          const insertFeature = featureFileToInsertFeature(featureDef);
          const feature = await this.createFeature(insertFeature);
          featureDefinitions.set(featureDef.id, { feature, stringId: featureDef.id });
        }
      }
    } else {
      // Fallback to sample features if no files found
      await this.loadSampleFeatures(featureDefinitions);
    }
    
    // Load wallets from files
    const walletFiles = getWalletFiles();
    const walletMap = new Map<string, Wallet>();
    
    if (walletFiles.length > 0) {
      for (const filePath of walletFiles) {
        const walletData = loadWalletFromFile(filePath);
        if (walletData) {
          const insertWallet = walletFileToInsertWallet(walletData);
          const wallet = await this.createWallet(insertWallet);
          walletMap.set(wallet.name, wallet);
          
          // Create wallet feature relationships
          for (const [featureId, featureValue] of Object.entries(walletData.features)) {
            const featureDef = featureDefinitions.get(featureId);
            if (featureDef) {
              const walletFeature = createWalletFeature(wallet.id, featureDef.feature.id, featureValue);
              await this.setWalletFeature(walletFeature);
            }
          }
        }
      }
    } else {
      // Fallback to sample wallets if no files found
      await this.loadSampleWallets(featureDefinitions);
    }
  }
  
  // Load sample features if no JSON files are found
  private async loadSampleFeatures(featureMap: Map<string, { feature: Feature, stringId: string }>) {
    // Add Lightning features
    const onChain = await this.createFeature({
      name: "On-Chain",
      description: "The ability to send and receive on-chain Bitcoin transactions.",
      type: "lightning",
      order: 1
    });
    featureMap.set("onChain", { feature: onChain, stringId: "onChain" });
    
    const receiveOnChain = await this.createFeature({
      name: "Receive On-Chain",
      description: "The ability to generate addresses and receive on-chain Bitcoin.",
      type: "lightning",
      order: 2
    });
    featureMap.set("receiveOnChain", { feature: receiveOnChain, stringId: "receiveOnChain" });
    
    const sendOnChain = await this.createFeature({
      name: "Send On-Chain",
      description: "The ability to send Bitcoin through on-chain transactions.",
      type: "lightning",
      order: 3
    });
    featureMap.set("sendOnChain", { feature: sendOnChain, stringId: "sendOnChain" });
    
    const invoice = await this.createFeature({
      name: "Invoice",
      description: "Create and manage Lightning Network invoices for receiving payments.",
      type: "lightning",
      order: 4
    });
    featureMap.set("invoice", { feature: invoice, stringId: "invoice" });
    
    const lnurl = await this.createFeature({
      name: "LNURL(s)",
      description: "Support for different LNURL protocols like LNURL-pay, LNURL-withdraw, etc.",
      type: "lightning",
      order: 5
    });
    featureMap.set("lnurl", { feature: lnurl, stringId: "lnurl" });
    
    const lightningAddress = await this.createFeature({
      name: "Lightning Address",
      description: "Support for Lightning Addresses in the format user@domain.com.",
      type: "lightning",
      order: 6
    });
    featureMap.set("lightningAddress", { feature: lightningAddress, stringId: "lightningAddress" });
    
    const bolt11 = await this.createFeature({
      name: "BoltII",
      description: "Implementation of the BOLT 11 specification for Lightning payments.",
      type: "lightning",
      order: 7
    });
    featureMap.set("bolt11", { feature: bolt11, stringId: "bolt11" });
    
    const dnsSeeds = await this.createFeature({
      name: "DNS (Seeds)",
      description: "Use of DNS seeds for finding Lightning Network nodes.",
      type: "lightning",
      order: 8
    });
    featureMap.set("dnsSeeds", { feature: dnsSeeds, stringId: "dnsSeeds" });
    
    const paymentRouting = await this.createFeature({
      name: "Payment Routing",
      description: "Ability to route payments through the Lightning Network.",
      type: "lightning",
      order: 9
    });
    featureMap.set("paymentRouting", { feature: paymentRouting, stringId: "paymentRouting" });
    
    const mpp = await this.createFeature({
      name: "MPP",
      description: "Multi-Path Payments: splitting payments across multiple Lightning channels.",
      type: "lightning",
      order: 10
    });
    featureMap.set("mpp", { feature: mpp, stringId: "mpp" });
    
    const manageOwnChannels = await this.createFeature({
      name: "Manage Own Channels",
      description: "Ability for users to create and manage their own Lightning channels.",
      type: "lightning",
      order: 11
    });
    featureMap.set("manageOwnChannels", { feature: manageOwnChannels, stringId: "manageOwnChannels" });
    
    const lowIncomingLiquidity = await this.createFeature({
      name: "Low Incoming Liquidity",
      description: "Ways to address incoming liquidity challenges for receiving payments.",
      type: "lightning",
      order: 12
    });
    featureMap.set("lowIncomingLiquidity", { feature: lowIncomingLiquidity, stringId: "lowIncomingLiquidity" });
  }
  
  // Load sample wallets if no JSON files are found
  private async loadSampleWallets(featureMap: Map<string, { feature: Feature, stringId: string }>) {
    // Add sample Lightning wallets
    const phoenix = await this.createWallet({
      name: "Phoenix",
      website: "https://phoenix.acinq.co/",
      description: "A self-custodial Lightning Network wallet by ACINQ with simplified channel management.",
      type: "lightning",
      logo: "phoenix",
      order: 1
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
    
    // Adding additional wallets
    const blink = await this.createWallet({
      name: "Blink",
      website: "https://blink.sv/",
      description: "A Lightning wallet focused on simplicity and ease of use.",
      type: "lightning",
      logo: "blink",
      order: 6
    });
    
    const electrum = await this.createWallet({
      name: "Electrum",
      website: "https://electrum.org/",
      description: "A popular lightweight Bitcoin wallet with Lightning support.",
      type: "lightning",
      logo: "electrum",
      order: 7
    });
    
    const zbd = await this.createWallet({
      name: "ZBD",
      website: "https://zbd.gg/",
      description: "A Lightning wallet with gaming and developer features.",
      type: "lightning",
      logo: "zbd",
      order: 8
    });
    
    const cashApp = await this.createWallet({
      name: "Cash App",
      website: "https://cash.app/",
      description: "A popular payment app with Bitcoin and Lightning support.",
      type: "lightning",
      logo: "cashapp",
      order: 9
    });
    
    const strike = await this.createWallet({
      name: "Strike",
      website: "https://strike.me/",
      description: "A payment app with Bitcoin and Lightning integration.",
      type: "lightning",
      logo: "strike",
      order: 10
    });
    
    const river = await this.createWallet({
      name: "River",
      website: "https://river.com/",
      description: "A Bitcoin exchange and wallet with Lightning support.",
      type: "lightning",
      logo: "river",
      order: 11
    });
    
    const exodus = await this.createWallet({
      name: "Exodus",
      website: "https://www.exodus.com/",
      description: "A multi-cryptocurrency wallet with Bitcoin Lightning integration.",
      type: "lightning",
      logo: "exodus",
      order: 12
    });
    
    const aqua = await this.createWallet({
      name: "Aqua",
      website: "https://aquawallet.io/",
      description: "A Liquid Network and Lightning wallet.",
      type: "lightning",
      logo: "aqua",
      order: 13
    });
    
    const bitkit = await this.createWallet({
      name: "Bitkit",
      website: "https://bitkit.to/",
      description: "A self-custodial Bitcoin and Lightning wallet.",
      type: "lightning",
      logo: "bitkit",
      order: 14
    });
    
    const coinos = await this.createWallet({
      name: "Coinos",
      website: "https://coinos.io/",
      description: "A web-based Lightning wallet with multiple network support.",
      type: "lightning",
      logo: "coinos",
      order: 15
    });
    
    const speed = await this.createWallet({
      name: "Speed",
      website: "https://speed.techlooper.io/",
      description: "A Lightning wallet with fast and simple payments.",
      type: "lightning",
      logo: "speed",
      order: 16
    });
    
    const sati = await this.createWallet({
      name: "Sati",
      website: "https://sati.io/",
      description: "A Lightning wallet with a focus on privacy and speed.",
      type: "lightning",
      logo: "sati",
      order: 17
    });
    
    const lifpay = await this.createWallet({
      name: "Lifpay",
      website: "https://www.lifpay.io/",
      description: "A Lightning wallet for everyday payments.",
      type: "lightning",
      logo: "lifpay",
      order: 18
    });
    
    const green = await this.createWallet({
      name: "Green",
      website: "https://blockstream.com/green/",
      description: "A Bitcoin wallet by Blockstream with Lightning integration.",
      type: "lightning",
      logo: "green",
      order: 19
    });
    
    const blixt = await this.createWallet({
      name: "Blixt",
      website: "https://blixtwallet.github.io/",
      description: "An open-source Lightning Network wallet.",
      type: "lightning",
      logo: "blixt",
      order: 20
    });
    
    const rtl = await this.createWallet({
      name: "RTL",
      website: "https://github.com/Ride-The-Lightning/RTL",
      description: "Ride The Lightning - A web interface for Lightning Network node management.",
      type: "lightning",
      logo: "rtl",
      order: 21
    });
    
    const lawallet = await this.createWallet({
      name: "Lawallet",
      website: "https://lawallet.io/",
      description: "A Lightning wallet focused on simplicity and usability.",
      type: "lightning",
      logo: "lawallet",
      order: 22
    });
    
    const alby = await this.createWallet({
      name: "Alby",
      website: "https://getalby.com/",
      description: "A Lightning browser extension and wallet.",
      type: "lightning",
      logo: "alby",
      order: 23
    });
    
    const btcpayServer = await this.createWallet({
      name: "BTCPay Server",
      website: "https://btcpayserver.org/",
      description: "A self-hosted, open-source cryptocurrency payment processor.",
      type: "lightning",
      logo: "btcpayserver",
      order: 24
    });
    
    const blitz = await this.createWallet({
      name: "Blitz",
      website: "https://blitz.cash/",
      description: "A Lightning wallet focused on simplicity and speed.",
      type: "lightning",
      logo: "blitz",
      order: 25
    });
    
    const primal = await this.createWallet({
      name: "Primal",
      website: "https://primal.net/",
      description: "A social network and wallet with Lightning integration.",
      type: "lightning",
      logo: "primal",
      order: 26
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
    
    // Blink features
    await this.setWalletFeature({ walletId: blink.id, featureId: onChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: blink.id, featureId: receiveOnChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: blink.id, featureId: sendOnChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: blink.id, featureId: invoice.id, value: "yes" });
    await this.setWalletFeature({ walletId: blink.id, featureId: lnurl.id, value: "yes" });
    await this.setWalletFeature({ walletId: blink.id, featureId: lightningAddress.id, value: "yes" });
    await this.setWalletFeature({ walletId: blink.id, featureId: bolt11.id, value: "yes" });
    await this.setWalletFeature({ walletId: blink.id, featureId: dnsSeeds.id, value: "no" });
    await this.setWalletFeature({ walletId: blink.id, featureId: paymentRouting.id, value: "yes" });
    await this.setWalletFeature({ walletId: blink.id, featureId: mpp.id, value: "partial" });
    await this.setWalletFeature({ walletId: blink.id, featureId: manageOwnChannels.id, value: "no" });
    await this.setWalletFeature({ walletId: blink.id, featureId: lowIncomingLiquidity.id, value: "partial" });
    
    // Electrum features
    await this.setWalletFeature({ walletId: electrum.id, featureId: onChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: electrum.id, featureId: receiveOnChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: electrum.id, featureId: sendOnChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: electrum.id, featureId: invoice.id, value: "yes" });
    await this.setWalletFeature({ walletId: electrum.id, featureId: lnurl.id, value: "partial" });
    await this.setWalletFeature({ walletId: electrum.id, featureId: lightningAddress.id, value: "no" });
    await this.setWalletFeature({ walletId: electrum.id, featureId: bolt11.id, value: "yes" });
    await this.setWalletFeature({ walletId: electrum.id, featureId: dnsSeeds.id, value: "yes" });
    await this.setWalletFeature({ walletId: electrum.id, featureId: paymentRouting.id, value: "yes" });
    await this.setWalletFeature({ walletId: electrum.id, featureId: mpp.id, value: "partial" });
    await this.setWalletFeature({ walletId: electrum.id, featureId: manageOwnChannels.id, value: "yes" });
    await this.setWalletFeature({ walletId: electrum.id, featureId: lowIncomingLiquidity.id, value: "custom", customText: "Manual" });
    
    // ZBD features
    await this.setWalletFeature({ walletId: zbd.id, featureId: onChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: zbd.id, featureId: receiveOnChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: zbd.id, featureId: sendOnChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: zbd.id, featureId: invoice.id, value: "yes" });
    await this.setWalletFeature({ walletId: zbd.id, featureId: lnurl.id, value: "yes" });
    await this.setWalletFeature({ walletId: zbd.id, featureId: lightningAddress.id, value: "yes" });
    await this.setWalletFeature({ walletId: zbd.id, featureId: bolt11.id, value: "yes" });
    await this.setWalletFeature({ walletId: zbd.id, featureId: dnsSeeds.id, value: "custom", customText: "Custodial" });
    await this.setWalletFeature({ walletId: zbd.id, featureId: paymentRouting.id, value: "custom", customText: "Custodial" });
    await this.setWalletFeature({ walletId: zbd.id, featureId: mpp.id, value: "custom", customText: "Custodial" });
    await this.setWalletFeature({ walletId: zbd.id, featureId: manageOwnChannels.id, value: "no" });
    await this.setWalletFeature({ walletId: zbd.id, featureId: lowIncomingLiquidity.id, value: "custom", customText: "Custodial" });
    
    // Cash App features
    await this.setWalletFeature({ walletId: cashApp.id, featureId: onChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: cashApp.id, featureId: receiveOnChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: cashApp.id, featureId: sendOnChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: cashApp.id, featureId: invoice.id, value: "yes" });
    await this.setWalletFeature({ walletId: cashApp.id, featureId: lnurl.id, value: "partial" });
    await this.setWalletFeature({ walletId: cashApp.id, featureId: lightningAddress.id, value: "no" });
    await this.setWalletFeature({ walletId: cashApp.id, featureId: bolt11.id, value: "yes" });
    await this.setWalletFeature({ walletId: cashApp.id, featureId: dnsSeeds.id, value: "custom", customText: "Custodial" });
    await this.setWalletFeature({ walletId: cashApp.id, featureId: paymentRouting.id, value: "custom", customText: "Custodial" });
    await this.setWalletFeature({ walletId: cashApp.id, featureId: mpp.id, value: "custom", customText: "Custodial" });
    await this.setWalletFeature({ walletId: cashApp.id, featureId: manageOwnChannels.id, value: "no" });
    await this.setWalletFeature({ walletId: cashApp.id, featureId: lowIncomingLiquidity.id, value: "custom", customText: "Custodial" });
    
    // Strike features
    await this.setWalletFeature({ walletId: strike.id, featureId: onChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: strike.id, featureId: receiveOnChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: strike.id, featureId: sendOnChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: strike.id, featureId: invoice.id, value: "yes" });
    await this.setWalletFeature({ walletId: strike.id, featureId: lnurl.id, value: "yes" });
    await this.setWalletFeature({ walletId: strike.id, featureId: lightningAddress.id, value: "yes" });
    await this.setWalletFeature({ walletId: strike.id, featureId: bolt11.id, value: "yes" });
    await this.setWalletFeature({ walletId: strike.id, featureId: dnsSeeds.id, value: "custom", customText: "Custodial" });
    await this.setWalletFeature({ walletId: strike.id, featureId: paymentRouting.id, value: "custom", customText: "Custodial" });
    await this.setWalletFeature({ walletId: strike.id, featureId: mpp.id, value: "custom", customText: "Custodial" });
    await this.setWalletFeature({ walletId: strike.id, featureId: manageOwnChannels.id, value: "no" });
    await this.setWalletFeature({ walletId: strike.id, featureId: lowIncomingLiquidity.id, value: "custom", customText: "Custodial" });
    
    // River features
    await this.setWalletFeature({ walletId: river.id, featureId: onChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: river.id, featureId: receiveOnChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: river.id, featureId: sendOnChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: river.id, featureId: invoice.id, value: "yes" });
    await this.setWalletFeature({ walletId: river.id, featureId: lnurl.id, value: "yes" });
    await this.setWalletFeature({ walletId: river.id, featureId: lightningAddress.id, value: "yes" });
    await this.setWalletFeature({ walletId: river.id, featureId: bolt11.id, value: "yes" });
    await this.setWalletFeature({ walletId: river.id, featureId: dnsSeeds.id, value: "custom", customText: "Custodial" });
    await this.setWalletFeature({ walletId: river.id, featureId: paymentRouting.id, value: "custom", customText: "Custodial" });
    await this.setWalletFeature({ walletId: river.id, featureId: mpp.id, value: "custom", customText: "Custodial" });
    await this.setWalletFeature({ walletId: river.id, featureId: manageOwnChannels.id, value: "no" });
    await this.setWalletFeature({ walletId: river.id, featureId: lowIncomingLiquidity.id, value: "custom", customText: "Custodial" });
    
    // Exodus features
    await this.setWalletFeature({ walletId: exodus.id, featureId: onChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: exodus.id, featureId: receiveOnChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: exodus.id, featureId: sendOnChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: exodus.id, featureId: invoice.id, value: "yes" });
    await this.setWalletFeature({ walletId: exodus.id, featureId: lnurl.id, value: "partial" });
    await this.setWalletFeature({ walletId: exodus.id, featureId: lightningAddress.id, value: "no" });
    await this.setWalletFeature({ walletId: exodus.id, featureId: bolt11.id, value: "yes" });
    await this.setWalletFeature({ walletId: exodus.id, featureId: dnsSeeds.id, value: "no" });
    await this.setWalletFeature({ walletId: exodus.id, featureId: paymentRouting.id, value: "partial" });
    await this.setWalletFeature({ walletId: exodus.id, featureId: mpp.id, value: "partial" });
    await this.setWalletFeature({ walletId: exodus.id, featureId: manageOwnChannels.id, value: "no" });
    await this.setWalletFeature({ walletId: exodus.id, featureId: lowIncomingLiquidity.id, value: "partial" });
    
    // Aqua features
    await this.setWalletFeature({ walletId: aqua.id, featureId: onChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: aqua.id, featureId: receiveOnChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: aqua.id, featureId: sendOnChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: aqua.id, featureId: invoice.id, value: "yes" });
    await this.setWalletFeature({ walletId: aqua.id, featureId: lnurl.id, value: "yes" });
    await this.setWalletFeature({ walletId: aqua.id, featureId: lightningAddress.id, value: "yes" });
    await this.setWalletFeature({ walletId: aqua.id, featureId: bolt11.id, value: "yes" });
    await this.setWalletFeature({ walletId: aqua.id, featureId: dnsSeeds.id, value: "yes" });
    await this.setWalletFeature({ walletId: aqua.id, featureId: paymentRouting.id, value: "yes" });
    await this.setWalletFeature({ walletId: aqua.id, featureId: mpp.id, value: "yes" });
    await this.setWalletFeature({ walletId: aqua.id, featureId: manageOwnChannels.id, value: "custom", customText: "Limited" });
    await this.setWalletFeature({ walletId: aqua.id, featureId: lowIncomingLiquidity.id, value: "custom", customText: "LSP" });
    
    // Bitkit features
    await this.setWalletFeature({ walletId: bitkit.id, featureId: onChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: bitkit.id, featureId: receiveOnChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: bitkit.id, featureId: sendOnChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: bitkit.id, featureId: invoice.id, value: "yes" });
    await this.setWalletFeature({ walletId: bitkit.id, featureId: lnurl.id, value: "yes" });
    await this.setWalletFeature({ walletId: bitkit.id, featureId: lightningAddress.id, value: "yes" });
    await this.setWalletFeature({ walletId: bitkit.id, featureId: bolt11.id, value: "yes" });
    await this.setWalletFeature({ walletId: bitkit.id, featureId: dnsSeeds.id, value: "yes" });
    await this.setWalletFeature({ walletId: bitkit.id, featureId: paymentRouting.id, value: "yes" });
    await this.setWalletFeature({ walletId: bitkit.id, featureId: mpp.id, value: "yes" });
    await this.setWalletFeature({ walletId: bitkit.id, featureId: manageOwnChannels.id, value: "custom", customText: "Limited" });
    await this.setWalletFeature({ walletId: bitkit.id, featureId: lowIncomingLiquidity.id, value: "custom", customText: "LSP" });
    
    // Coinos features
    await this.setWalletFeature({ walletId: coinos.id, featureId: onChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: coinos.id, featureId: receiveOnChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: coinos.id, featureId: sendOnChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: coinos.id, featureId: invoice.id, value: "yes" });
    await this.setWalletFeature({ walletId: coinos.id, featureId: lnurl.id, value: "yes" });
    await this.setWalletFeature({ walletId: coinos.id, featureId: lightningAddress.id, value: "yes" });
    await this.setWalletFeature({ walletId: coinos.id, featureId: bolt11.id, value: "yes" });
    await this.setWalletFeature({ walletId: coinos.id, featureId: dnsSeeds.id, value: "yes" });
    await this.setWalletFeature({ walletId: coinos.id, featureId: paymentRouting.id, value: "yes" });
    await this.setWalletFeature({ walletId: coinos.id, featureId: mpp.id, value: "yes" });
    await this.setWalletFeature({ walletId: coinos.id, featureId: manageOwnChannels.id, value: "yes" });
    await this.setWalletFeature({ walletId: coinos.id, featureId: lowIncomingLiquidity.id, value: "yes" });
    
    // Speed features
    await this.setWalletFeature({ walletId: speed.id, featureId: onChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: speed.id, featureId: receiveOnChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: speed.id, featureId: sendOnChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: speed.id, featureId: invoice.id, value: "yes" });
    await this.setWalletFeature({ walletId: speed.id, featureId: lnurl.id, value: "yes" });
    await this.setWalletFeature({ walletId: speed.id, featureId: lightningAddress.id, value: "yes" });
    await this.setWalletFeature({ walletId: speed.id, featureId: bolt11.id, value: "yes" });
    await this.setWalletFeature({ walletId: speed.id, featureId: dnsSeeds.id, value: "no" });
    await this.setWalletFeature({ walletId: speed.id, featureId: paymentRouting.id, value: "yes" });
    await this.setWalletFeature({ walletId: speed.id, featureId: mpp.id, value: "partial" });
    await this.setWalletFeature({ walletId: speed.id, featureId: manageOwnChannels.id, value: "no" });
    await this.setWalletFeature({ walletId: speed.id, featureId: lowIncomingLiquidity.id, value: "partial" });
    
    // Sati features
    await this.setWalletFeature({ walletId: sati.id, featureId: onChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: sati.id, featureId: receiveOnChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: sati.id, featureId: sendOnChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: sati.id, featureId: invoice.id, value: "yes" });
    await this.setWalletFeature({ walletId: sati.id, featureId: lnurl.id, value: "yes" });
    await this.setWalletFeature({ walletId: sati.id, featureId: lightningAddress.id, value: "yes" });
    await this.setWalletFeature({ walletId: sati.id, featureId: bolt11.id, value: "yes" });
    await this.setWalletFeature({ walletId: sati.id, featureId: dnsSeeds.id, value: "no" });
    await this.setWalletFeature({ walletId: sati.id, featureId: paymentRouting.id, value: "partial" });
    await this.setWalletFeature({ walletId: sati.id, featureId: mpp.id, value: "partial" });
    await this.setWalletFeature({ walletId: sati.id, featureId: manageOwnChannels.id, value: "no" });
    await this.setWalletFeature({ walletId: sati.id, featureId: lowIncomingLiquidity.id, value: "partial" });
    
    // Lifpay features
    await this.setWalletFeature({ walletId: lifpay.id, featureId: onChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: lifpay.id, featureId: receiveOnChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: lifpay.id, featureId: sendOnChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: lifpay.id, featureId: invoice.id, value: "yes" });
    await this.setWalletFeature({ walletId: lifpay.id, featureId: lnurl.id, value: "yes" });
    await this.setWalletFeature({ walletId: lifpay.id, featureId: lightningAddress.id, value: "yes" });
    await this.setWalletFeature({ walletId: lifpay.id, featureId: bolt11.id, value: "yes" });
    await this.setWalletFeature({ walletId: lifpay.id, featureId: dnsSeeds.id, value: "custom", customText: "Custodial" });
    await this.setWalletFeature({ walletId: lifpay.id, featureId: paymentRouting.id, value: "custom", customText: "Custodial" });
    await this.setWalletFeature({ walletId: lifpay.id, featureId: mpp.id, value: "custom", customText: "Custodial" });
    await this.setWalletFeature({ walletId: lifpay.id, featureId: manageOwnChannels.id, value: "no" });
    await this.setWalletFeature({ walletId: lifpay.id, featureId: lowIncomingLiquidity.id, value: "custom", customText: "Custodial" });
    
    // Green features
    await this.setWalletFeature({ walletId: green.id, featureId: onChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: green.id, featureId: receiveOnChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: green.id, featureId: sendOnChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: green.id, featureId: invoice.id, value: "yes" });
    await this.setWalletFeature({ walletId: green.id, featureId: lnurl.id, value: "partial" });
    await this.setWalletFeature({ walletId: green.id, featureId: lightningAddress.id, value: "no" });
    await this.setWalletFeature({ walletId: green.id, featureId: bolt11.id, value: "yes" });
    await this.setWalletFeature({ walletId: green.id, featureId: dnsSeeds.id, value: "yes" });
    await this.setWalletFeature({ walletId: green.id, featureId: paymentRouting.id, value: "partial" });
    await this.setWalletFeature({ walletId: green.id, featureId: mpp.id, value: "partial" });
    await this.setWalletFeature({ walletId: green.id, featureId: manageOwnChannels.id, value: "custom", customText: "Limited" });
    await this.setWalletFeature({ walletId: green.id, featureId: lowIncomingLiquidity.id, value: "partial" });
    
    // Blixt features
    await this.setWalletFeature({ walletId: blixt.id, featureId: onChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: blixt.id, featureId: receiveOnChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: blixt.id, featureId: sendOnChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: blixt.id, featureId: invoice.id, value: "yes" });
    await this.setWalletFeature({ walletId: blixt.id, featureId: lnurl.id, value: "yes" });
    await this.setWalletFeature({ walletId: blixt.id, featureId: lightningAddress.id, value: "yes" });
    await this.setWalletFeature({ walletId: blixt.id, featureId: bolt11.id, value: "yes" });
    await this.setWalletFeature({ walletId: blixt.id, featureId: dnsSeeds.id, value: "yes" });
    await this.setWalletFeature({ walletId: blixt.id, featureId: paymentRouting.id, value: "yes" });
    await this.setWalletFeature({ walletId: blixt.id, featureId: mpp.id, value: "yes" });
    await this.setWalletFeature({ walletId: blixt.id, featureId: manageOwnChannels.id, value: "yes" });
    await this.setWalletFeature({ walletId: blixt.id, featureId: lowIncomingLiquidity.id, value: "yes" });
    
    // RTL features
    await this.setWalletFeature({ walletId: rtl.id, featureId: onChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: rtl.id, featureId: receiveOnChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: rtl.id, featureId: sendOnChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: rtl.id, featureId: invoice.id, value: "yes" });
    await this.setWalletFeature({ walletId: rtl.id, featureId: lnurl.id, value: "custom", customText: "Node dependent" });
    await this.setWalletFeature({ walletId: rtl.id, featureId: lightningAddress.id, value: "custom", customText: "Node dependent" });
    await this.setWalletFeature({ walletId: rtl.id, featureId: bolt11.id, value: "yes" });
    await this.setWalletFeature({ walletId: rtl.id, featureId: dnsSeeds.id, value: "custom", customText: "Node dependent" });
    await this.setWalletFeature({ walletId: rtl.id, featureId: paymentRouting.id, value: "custom", customText: "Node" });
    await this.setWalletFeature({ walletId: rtl.id, featureId: mpp.id, value: "custom", customText: "Node dependent" });
    await this.setWalletFeature({ walletId: rtl.id, featureId: manageOwnChannels.id, value: "yes" });
    await this.setWalletFeature({ walletId: rtl.id, featureId: lowIncomingLiquidity.id, value: "custom", customText: "Node dependent" });
    
    // Lawallet features
    await this.setWalletFeature({ walletId: lawallet.id, featureId: onChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: lawallet.id, featureId: receiveOnChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: lawallet.id, featureId: sendOnChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: lawallet.id, featureId: invoice.id, value: "yes" });
    await this.setWalletFeature({ walletId: lawallet.id, featureId: lnurl.id, value: "yes" });
    await this.setWalletFeature({ walletId: lawallet.id, featureId: lightningAddress.id, value: "yes" });
    await this.setWalletFeature({ walletId: lawallet.id, featureId: bolt11.id, value: "yes" });
    await this.setWalletFeature({ walletId: lawallet.id, featureId: dnsSeeds.id, value: "custom", customText: "Custodial" });
    await this.setWalletFeature({ walletId: lawallet.id, featureId: paymentRouting.id, value: "custom", customText: "Custodial" });
    await this.setWalletFeature({ walletId: lawallet.id, featureId: mpp.id, value: "custom", customText: "Custodial" });
    await this.setWalletFeature({ walletId: lawallet.id, featureId: manageOwnChannels.id, value: "no" });
    await this.setWalletFeature({ walletId: lawallet.id, featureId: lowIncomingLiquidity.id, value: "custom", customText: "Custodial" });
    
    // Alby features
    await this.setWalletFeature({ walletId: alby.id, featureId: onChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: alby.id, featureId: receiveOnChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: alby.id, featureId: sendOnChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: alby.id, featureId: invoice.id, value: "yes" });
    await this.setWalletFeature({ walletId: alby.id, featureId: lnurl.id, value: "yes" });
    await this.setWalletFeature({ walletId: alby.id, featureId: lightningAddress.id, value: "yes" });
    await this.setWalletFeature({ walletId: alby.id, featureId: bolt11.id, value: "yes" });
    await this.setWalletFeature({ walletId: alby.id, featureId: dnsSeeds.id, value: "custom", customText: "Depends on account" });
    await this.setWalletFeature({ walletId: alby.id, featureId: paymentRouting.id, value: "custom", customText: "Depends on account" });
    await this.setWalletFeature({ walletId: alby.id, featureId: mpp.id, value: "custom", customText: "Depends on account" });
    await this.setWalletFeature({ walletId: alby.id, featureId: manageOwnChannels.id, value: "custom", customText: "Limited" });
    await this.setWalletFeature({ walletId: alby.id, featureId: lowIncomingLiquidity.id, value: "custom", customText: "Depends on account" });
    
    // BTCPay Server features
    await this.setWalletFeature({ walletId: btcpayServer.id, featureId: onChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: btcpayServer.id, featureId: receiveOnChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: btcpayServer.id, featureId: sendOnChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: btcpayServer.id, featureId: invoice.id, value: "yes" });
    await this.setWalletFeature({ walletId: btcpayServer.id, featureId: lnurl.id, value: "yes" });
    await this.setWalletFeature({ walletId: btcpayServer.id, featureId: lightningAddress.id, value: "yes" });
    await this.setWalletFeature({ walletId: btcpayServer.id, featureId: bolt11.id, value: "yes" });
    await this.setWalletFeature({ walletId: btcpayServer.id, featureId: dnsSeeds.id, value: "custom", customText: "Node dependent" });
    await this.setWalletFeature({ walletId: btcpayServer.id, featureId: paymentRouting.id, value: "custom", customText: "Node dependent" });
    await this.setWalletFeature({ walletId: btcpayServer.id, featureId: mpp.id, value: "custom", customText: "Node dependent" });
    await this.setWalletFeature({ walletId: btcpayServer.id, featureId: manageOwnChannels.id, value: "yes" });
    await this.setWalletFeature({ walletId: btcpayServer.id, featureId: lowIncomingLiquidity.id, value: "custom", customText: "Node dependent" });
    
    // Blitz features
    await this.setWalletFeature({ walletId: blitz.id, featureId: onChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: blitz.id, featureId: receiveOnChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: blitz.id, featureId: sendOnChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: blitz.id, featureId: invoice.id, value: "yes" });
    await this.setWalletFeature({ walletId: blitz.id, featureId: lnurl.id, value: "yes" });
    await this.setWalletFeature({ walletId: blitz.id, featureId: lightningAddress.id, value: "yes" });
    await this.setWalletFeature({ walletId: blitz.id, featureId: bolt11.id, value: "yes" });
    await this.setWalletFeature({ walletId: blitz.id, featureId: dnsSeeds.id, value: "yes" });
    await this.setWalletFeature({ walletId: blitz.id, featureId: paymentRouting.id, value: "yes" });
    await this.setWalletFeature({ walletId: blitz.id, featureId: mpp.id, value: "yes" });
    await this.setWalletFeature({ walletId: blitz.id, featureId: manageOwnChannels.id, value: "custom", customText: "Limited" });
    await this.setWalletFeature({ walletId: blitz.id, featureId: lowIncomingLiquidity.id, value: "custom", customText: "LSP" });
    
    // Primal features
    await this.setWalletFeature({ walletId: primal.id, featureId: onChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: primal.id, featureId: receiveOnChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: primal.id, featureId: sendOnChain.id, value: "yes" });
    await this.setWalletFeature({ walletId: primal.id, featureId: invoice.id, value: "yes" });
    await this.setWalletFeature({ walletId: primal.id, featureId: lnurl.id, value: "yes" });
    await this.setWalletFeature({ walletId: primal.id, featureId: lightningAddress.id, value: "yes" });
    await this.setWalletFeature({ walletId: primal.id, featureId: bolt11.id, value: "yes" });
    await this.setWalletFeature({ walletId: primal.id, featureId: dnsSeeds.id, value: "custom", customText: "Custodial" });
    await this.setWalletFeature({ walletId: primal.id, featureId: paymentRouting.id, value: "custom", customText: "Custodial" });
    await this.setWalletFeature({ walletId: primal.id, featureId: mpp.id, value: "custom", customText: "Custodial" });
    await this.setWalletFeature({ walletId: primal.id, featureId: manageOwnChannels.id, value: "no" });
    await this.setWalletFeature({ walletId: primal.id, featureId: lowIncomingLiquidity.id, value: "custom", customText: "Custodial" });
  }
}

export const storage = new MemStorage();
