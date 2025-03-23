import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define wallet types
export const walletTypes = ["lightning", "onchain", "hardware"] as const;
export type WalletType = typeof walletTypes[number];

// Define feature value types
export const featureValues = ["yes", "no", "partial", "custom", "send_only", "receive_only", "mandatory", "optional", "not_possible", "ios", "android", "desktop", "web", "custodial", "ln_node", "liquid_swap", "on_chain_swap", "remote_node", "lnd", "ldk", "core_lightning", "eclair"] as const;
export type FeatureValue = typeof featureValues[number];

// Users table (kept from original schema)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Wallets table
export const wallets = pgTable("wallets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  website: text("website").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull().$type<WalletType>(),
  logo: text("logo"),
  order: integer("order").notNull().default(0),
});

// Features table
export const features = pgTable("features", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull().$type<WalletType>(),
  order: integer("order").notNull().default(0),
});

// WalletFeatures table - junction table for many-to-many relationship
export const walletFeatures = pgTable("wallet_features", {
  id: serial("id").primaryKey(),
  walletId: integer("wallet_id").notNull().references(() => wallets.id),
  featureId: integer("feature_id").notNull().references(() => features.id),
  value: text("value").notNull().$type<FeatureValue>(),
  customText: text("custom_text"),
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
    value: FeatureValue;
    customText?: string;
  }[];
};
