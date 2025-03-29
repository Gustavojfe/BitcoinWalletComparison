import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define wallet types
export const walletTypes = ["lightning", "onchain", "hardware"] as const;
export type WalletType = typeof walletTypes[number];

// Define feature value types - expanded based on CSV data
export const featureValues = [
  // Basic yes/no values
  "yes", "no", "partial", 
  // Custom values with text explanations
  "custom", 
  // Direction-specific capabilities
  "send_only", "receive_only", 
  // Option types
  "mandatory", "optional", "not_possible", 
  // Platform values
  "ios", "android", "desktop", "web", "chrome_extension", "whatsapp",
  // Wallet architecture types
  "custodial", "non_custodial", "ln_node", "hybrid", "on_chain",
  // Swap types
  "liquid_swap", "on_chain_swap", "boltz_swap", "muun_provided", "phoenix_provided",
  // Node connection types
  "remote_node", "full_node", "light_client", "neutrino", "electrum", "bitcoin_core",
  // Implementation types
  "lnd", "ldk", "core_lightning", "eclair", "electrum_impl", "greenlight",
  // Taproot support levels
  "full", "send", "receive", 
  // Management approaches
  "user_managed", "lsp_managed", "automatic", "automatic_cloud",
  // Network types
  "liquid", "ecash",
  // Other specialized values that might be needed
  "detailed", "restricted", "unrestricted", "not_applicable", "none"
] as const;

export type FeatureValue = typeof featureValues[number];

// Define feature categories from CSV
export const featureCategories = [
  "basics", 
  "recover", 
  "ln_formats", 
  "invoice_customization",
  "on_chain_and_other_layers",
  "lightning_specific",
  "privacy",
  "dev_tools"
] as const;

export type FeatureCategory = typeof featureCategories[number];

// Users table (kept from original schema)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Wallets table - updated with fields from CSV
export const wallets = pgTable("wallets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  website: text("website").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull().$type<WalletType>(),
  logo: text("logo"),
  availability: text("availability"), // From CSV: Restricted in USA, etc.
  category: text("category"), // From CSV: Custodial, On-Chain Wallet, etc.
  order: integer("order").notNull().default(0),
});

// Features table - updated with categories from CSV
export const features = pgTable("features", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull().$type<WalletType>(),
  category: text("category").$type<FeatureCategory>(), // New field for feature categorization
  order: integer("order").notNull().default(0),
  infoLink: text("info_link"), // For linking to additional info about this feature
});

// WalletFeatures table - updated with link and reference fields
export const walletFeatures = pgTable("wallet_features", {
  id: serial("id").primaryKey(),
  walletId: integer("wallet_id").notNull().references(() => wallets.id),
  featureId: integer("feature_id").notNull().references(() => features.id),
  value: text("value").notNull().$type<FeatureValue>(),
  customText: text("custom_text"),
  referenceLink: text("reference_link"), // Link to documentation or evidence for this data point
  notes: text("notes"), // Additional context notes for this wallet/feature combination
});

// Define insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertWalletSchema = createInsertSchema(wallets).omit({
  id: true,
});

export const insertFeatureSchema = createInsertSchema(features).omit({
  id: true,
});

export const insertWalletFeatureSchema = createInsertSchema(walletFeatures).omit({
  id: true,
});

// Define types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertWallet = z.infer<typeof insertWalletSchema>;
export type Wallet = typeof wallets.$inferSelect;

export type InsertFeature = z.infer<typeof insertFeatureSchema>;
export type Feature = typeof features.$inferSelect;

export type InsertWalletFeature = z.infer<typeof insertWalletFeatureSchema>;
export type WalletFeature = typeof walletFeatures.$inferSelect;

// Extended wallet type with features
export type WalletWithFeatures = Wallet & {
  features: {
    featureId: number;
    featureName: string;
    featureDescription: string;
    category: FeatureCategory;
    value: FeatureValue;
    customText?: string;
    referenceLink?: string;
    notes?: string;
  }[];
};
