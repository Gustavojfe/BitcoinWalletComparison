import { Feature, FeatureValue, InsertFeature, InsertUser, InsertWallet, InsertWalletFeature, User, Wallet, WalletFeature, WalletType, WalletWithFeatures } from '../shared/schema';

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
    this.users = new Map<number, User>();
    this.wallets = new Map<number, Wallet>();
    this.features = new Map<number, Feature>();
    this.walletFeatures = new Map<number, WalletFeature>();

    this.userId = 1;
    this.walletId = 1;
    this.featureId = 1;
    this.walletFeatureId = 1;

    // Initialize data
    this.initializeSampleData();
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllWallets(type?: WalletType): Promise<Wallet[]> {
    let wallets = Array.from(this.wallets.values());
    if (type) {
      wallets = wallets.filter((wallet) => wallet.type === type);
    }
    return wallets.sort((a, b) => a.order - b.order);
  }

  async getWalletById(id: number): Promise<Wallet | undefined> {
    return this.wallets.get(id);
  }

  async createWallet(wallet: InsertWallet): Promise<Wallet> {
    const id = this.walletId++;
    // Ensure type is a valid WalletType
    const type = wallet.type as "lightning" | "onchain" | "hardware";
    
    // Ensure other fields have proper default values
    const newWallet: Wallet = { 
      ...wallet, 
      id, 
      type,
      logo: wallet.logo || null,
      availability: wallet.availability || null,
      category: wallet.category || null,
      order: wallet.order || 0
    };
    
    this.wallets.set(id, newWallet);
    return newWallet;
  }

  async updateWallet(id: number, wallet: Partial<InsertWallet>): Promise<Wallet | undefined> {
    const existingWallet = this.wallets.get(id);
    if (!existingWallet) {
      return undefined;
    }

    // Handle the case where type is updated
    let type = existingWallet.type;
    if (wallet.type) {
      type = wallet.type as "lightning" | "onchain" | "hardware";
    }

    const updatedWallet: Wallet = { 
      ...existingWallet, 
      ...wallet,
      type // Ensure type is valid
    };
    
    this.wallets.set(id, updatedWallet);
    return updatedWallet;
  }

  async deleteWallet(id: number): Promise<boolean> {
    return this.wallets.delete(id);
  }

  async getWalletsWithFeatures(type?: WalletType): Promise<WalletWithFeatures[]> {
    const wallets = await this.getAllWallets(type);
    return Promise.all(
      wallets.map(async (wallet) => {
        const walletFeatures: WalletFeature[] = [];
        for (const wf of this.walletFeatures.values()) {
          if (wf.walletId === wallet.id) {
            walletFeatures.push(wf);
          }
        }

        const features = walletFeatures.map((wf) => {
          const feature = this.features.get(wf.featureId);
          if (!feature) {
            return null;
          }
          return {
            featureId: feature.id,
            featureName: feature.name,
            featureDescription: feature.description,
            category: feature.category || "basics", // Default to basics if no category
            value: wf.value,
            customText: wf.customText,
            referenceLink: wf.referenceLink,
            notes: wf.notes
          };
        }).filter(Boolean) as WalletWithFeatures['features'];

        return {
          ...wallet,
          features
        };
      })
    );
  }

  async getAllFeatures(type?: WalletType): Promise<Feature[]> {
    let features = Array.from(this.features.values());
    if (type) {
      features = features.filter((feature) => feature.type === type);
    }
    return features.sort((a, b) => a.order - b.order);
  }

  async getFeatureById(id: number): Promise<Feature | undefined> {
    return this.features.get(id);
  }

  async createFeature(feature: InsertFeature): Promise<Feature> {
    const id = this.featureId++;
    
    // Ensure type is a valid WalletType
    const type = feature.type as "lightning" | "onchain" | "hardware";
    
    // Ensure category is a valid FeatureCategory or null
    let category = feature.category || null;
    if (category && !['basics', 'recover', 'ln_formats', 'invoice_customization', 
                  'on_chain_and_other_layers', 'lightning_specific', 'privacy', 'dev_tools'].includes(category)) {
      category = "basics";
    }
    
    const newFeature: Feature = { 
      ...feature, 
      id,
      type,
      category: category as Feature['category'],
      order: feature.order || 0,
      infoLink: feature.infoLink || null
    };
    
    this.features.set(id, newFeature);
    return newFeature;
  }

  async updateFeature(id: number, feature: Partial<InsertFeature>): Promise<Feature | undefined> {
    const existingFeature = this.features.get(id);
    if (!existingFeature) {
      return undefined;
    }

    const updatedFeature: Feature = { ...existingFeature, ...feature };
    this.features.set(id, updatedFeature);
    return updatedFeature;
  }

  async deleteFeature(id: number): Promise<boolean> {
    return this.features.delete(id);
  }

  async getWalletFeature(walletId: number, featureId: number): Promise<WalletFeature | undefined> {
    for (const wf of this.walletFeatures.values()) {
      if (wf.walletId === walletId && wf.featureId === featureId) {
        return wf;
      }
    }
    return undefined;
  }

  async setWalletFeature(walletFeature: InsertWalletFeature): Promise<WalletFeature> {
    // Check if this wallet-feature combination already exists
    const existing = await this.getWalletFeature(walletFeature.walletId, walletFeature.featureId);
    if (existing) {
      return this.updateWalletFeature(existing.id, walletFeature) as Promise<WalletFeature>;
    }

    // Ensure value is a valid FeatureValue
    const value = walletFeature.value as FeatureValue;

    // If not, create a new one
    const id = this.walletFeatureId++;
    const newWalletFeature: WalletFeature = { 
      ...walletFeature, 
      id,
      value,
      customText: walletFeature.customText || null,
      referenceLink: walletFeature.referenceLink || null,
      notes: walletFeature.notes || null
    };
    
    this.walletFeatures.set(id, newWalletFeature);
    return newWalletFeature;
  }

  async updateWalletFeature(id: number, walletFeature: Partial<InsertWalletFeature>): Promise<WalletFeature | undefined> {
    const existingWalletFeature = this.walletFeatures.get(id);
    if (!existingWalletFeature) {
      return undefined;
    }

    // Ensure value is a valid FeatureValue if provided
    let value = existingWalletFeature.value;
    if (walletFeature.value) {
      value = walletFeature.value as FeatureValue;
    }

    const updatedWalletFeature: WalletFeature = { 
      ...existingWalletFeature, 
      ...walletFeature,
      value
    };
    
    this.walletFeatures.set(id, updatedWalletFeature);
    return updatedWalletFeature;
  }

  async deleteWalletFeature(id: number): Promise<boolean> {
    return this.walletFeatures.delete(id);
  }

  // Initialize data from JSON files
  private async initializeSampleData() {
    try {
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
      
      // Set up feature map
      const featureDefinitions = new Map<string, { feature: Feature, stringId: string }>();
      
      // Load features from files
      const featureFiles = getFeatureFiles();
      
      if (featureFiles.length > 0) {
        console.log(`Loading ${featureFiles.length} feature files`);
        for (const filePath of featureFiles) {
          const featureList = loadFeaturesFromFile(filePath);
          for (const featureDef of featureList) {
            const insertFeature = featureFileToInsertFeature(featureDef);
            const feature = await this.createFeature(insertFeature);
            // Store both camelCase id (for new wallets) and lowercase id for compatibility
            featureDefinitions.set(featureDef.id, { feature, stringId: featureDef.id });
            // Also map feature name to snake_case for backward compatibility
            const snakeCaseId = featureDef.name.toLowerCase().replace(/\s+/g, '_');
            if (snakeCaseId !== featureDef.id) {
              featureDefinitions.set(snakeCaseId, { feature, stringId: featureDef.id });
            }
          }
        }
        console.log(`Loaded features with IDs: ${Array.from(featureDefinitions.keys()).join(', ')}`);
      } else {
        console.log("No feature files found, initializing with sample data");
        this.loadSampleData();
        return;
      }
      
      // Load wallets from files
      const walletFiles = getWalletFiles();
      
      if (walletFiles.length > 0) {
        console.log(`Loading ${walletFiles.length} wallet files`);
        for (const filePath of walletFiles) {
          const walletData = loadWalletFromFile(filePath);
          if (walletData) {
            const insertWallet = walletFileToInsertWallet(walletData);
            const wallet = await this.createWallet(insertWallet);
            
            // Create wallet feature relationships
            for (const [featureId, featureValue] of Object.entries(walletData.features)) {
              const featureDef = featureDefinitions.get(featureId);
              if (featureDef) {
                const walletFeature = createWalletFeature(wallet.id, featureDef.feature.id, featureValue);
                await this.setWalletFeature(walletFeature);
              } else {
                console.log(`Feature ${featureId} not found for wallet ${wallet.name}. Available features: ${Array.from(featureDefinitions.keys()).join(', ')}`);
              }
            }
          }
        }
      } else {
        console.log("No wallet files found, initializing with sample data");
        this.loadSampleData();
        return;
      }
    } catch (error) {
      console.error("Error loading data from files:", error);
      this.loadSampleData();
    }
  }
  
  // Load sample data with hardcoded values as a fallback
  private loadSampleData() {
    console.log("Loading sample data from hardcoded values");
    
    // This is a simplified version to add some initial data
    // Phoenix wallet
    this.createFeatureThenWallet({
      walletName: "Phoenix",
      walletWebsite: "https://phoenix.acinq.co/",
      walletDescription: "A self-custodial Lightning Network wallet by ACINQ with simplified channel management.",
      walletType: "lightning",
      walletLogo: "phoenix",
      walletOrder: 1,
      features: [
        { name: "On-Chain", description: "The ability to send and receive on-chain Bitcoin transactions.", value: "yes" },
        { name: "Invoice", description: "Create and manage Lightning Network invoices for receiving payments.", value: "yes" },
        { name: "LNURL(s)", description: "Support for different LNURL protocols like LNURL-pay, LNURL-withdraw, etc.", value: "partial" }
      ]
    });
    
    // Muun wallet 
    this.createFeatureThenWallet({
      walletName: "Muun",
      walletWebsite: "https://muun.com/",
      walletDescription: "A non-custodial bitcoin wallet with integrated Lightning functionality.",
      walletType: "lightning", 
      walletLogo: "muun",
      walletOrder: 2,
      features: [
        { name: "On-Chain", description: "The ability to send and receive on-chain Bitcoin transactions.", value: "yes" },
        { name: "Invoice", description: "Create and manage Lightning Network invoices for receiving payments.", value: "custom", customText: "Receive Only" },
        { name: "LNURL(s)", description: "Support for different LNURL protocols like LNURL-pay, LNURL-withdraw, etc.", value: "no" }
      ]
    });
    
    // Breez wallet
    this.createFeatureThenWallet({
      walletName: "Breez",
      walletWebsite: "https://breez.technology/",
      walletDescription: "A non-custodial Lightning wallet with integrated podcast player and point-of-sale features.",
      walletType: "lightning",
      walletLogo: "breez",
      walletOrder: 3,
      features: [
        { name: "On-Chain", description: "The ability to send and receive on-chain Bitcoin transactions.", value: "yes" },
        { name: "Invoice", description: "Create and manage Lightning Network invoices for receiving payments.", value: "yes" },
        { name: "LNURL(s)", description: "Support for different LNURL protocols like LNURL-pay, LNURL-withdraw, etc.", value: "yes" }
      ]
    });
  }
  
  // Helper to create features and wallet in one go (for sample data only)
  private async createFeatureThenWallet({
    walletName,
    walletWebsite,
    walletDescription,
    walletType,
    walletLogo,
    walletOrder,
    features
  }: {
    walletName: string;
    walletWebsite: string;
    walletDescription: string;
    walletType: WalletType;
    walletLogo: string;
    walletOrder: number;
    features: Array<{
      name: string;
      description: string;
      value: FeatureValue;
      customText?: string;
      referenceLink?: string;
      notes?: string;
    }>;
  }) {
    // Create wallet
    const wallet = await this.createWallet({
      name: walletName,
      website: walletWebsite,
      description: walletDescription,
      type: walletType,
      logo: walletLogo,
      order: walletOrder
    });
    
    // Create features and relate to wallet
    for (const feature of features) {
      // Check if feature exists
      let featureObj: Feature | undefined;
      for (const f of this.features.values()) {
        if (f.name === feature.name) {
          featureObj = f;
          break;
        }
      }
      
      // If not, create it
      if (!featureObj) {
        featureObj = await this.createFeature({
          name: feature.name,
          description: feature.description,
          type: walletType,
          order: this.featureId // This will be incremented when created
        });
      }
      
      // Create wallet-feature relationship
      await this.setWalletFeature({
        walletId: wallet.id,
        featureId: featureObj.id,
        value: feature.value,
        customText: feature.customText,
        referenceLink: feature.referenceLink || null,
        notes: feature.notes || null
      });
    }
  }
}

export const storage = new MemStorage();