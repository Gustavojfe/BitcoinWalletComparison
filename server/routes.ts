import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { sqliteNewsletterStorage } from "./storage-sqlite";
import { 
  insertWalletSchema, insertFeatureSchema, insertWalletFeatureSchema, insertNewsletterSchema,
  type WalletType, walletTypes
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Wallets endpoints
  app.get("/api/wallets", async (req, res) => {
    const type = req.query.type as WalletType | undefined;
    
    // Validate type if provided
    if (type && !walletTypes.includes(type)) {
      return res.status(400).json({ message: "Invalid wallet type" });
    }
    
    const wallets = await storage.getAllWallets(type);
    res.json(wallets);
  });

  app.get("/api/wallets/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid wallet ID" });
    }
    
    const wallet = await storage.getWalletById(id);
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }
    
    res.json(wallet);
  });

  app.post("/api/wallets", async (req, res) => {
    try {
      const newWallet = insertWalletSchema.parse(req.body);
      const wallet = await storage.createWallet(newWallet);
      res.status(201).json(wallet);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid wallet data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create wallet" });
    }
  });

  app.patch("/api/wallets/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid wallet ID" });
    }
    
    try {
      const updatedData = insertWalletSchema.partial().parse(req.body);
      const wallet = await storage.updateWallet(id, updatedData);
      
      if (!wallet) {
        return res.status(404).json({ message: "Wallet not found" });
      }
      
      res.json(wallet);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid wallet data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update wallet" });
    }
  });

  app.delete("/api/wallets/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid wallet ID" });
    }
    
    const success = await storage.deleteWallet(id);
    if (!success) {
      return res.status(404).json({ message: "Wallet not found" });
    }
    
    res.status(204).end();
  });

  // Features endpoints
  app.get("/api/features", async (req, res) => {
    const type = req.query.type as WalletType | undefined;
    
    // Validate type if provided
    if (type && !walletTypes.includes(type)) {
      return res.status(400).json({ message: "Invalid wallet type" });
    }
    
    const features = await storage.getAllFeatures(type);
    res.json(features);
  });

  app.get("/api/features/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid feature ID" });
    }
    
    const feature = await storage.getFeatureById(id);
    if (!feature) {
      return res.status(404).json({ message: "Feature not found" });
    }
    
    res.json(feature);
  });

  app.post("/api/features", async (req, res) => {
    try {
      const newFeature = insertFeatureSchema.parse(req.body);
      const feature = await storage.createFeature(newFeature);
      res.status(201).json(feature);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid feature data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create feature" });
    }
  });

  app.patch("/api/features/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid feature ID" });
    }
    
    try {
      const updatedData = insertFeatureSchema.partial().parse(req.body);
      const feature = await storage.updateFeature(id, updatedData);
      
      if (!feature) {
        return res.status(404).json({ message: "Feature not found" });
      }
      
      res.json(feature);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid feature data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update feature" });
    }
  });

  app.delete("/api/features/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid feature ID" });
    }
    
    const success = await storage.deleteFeature(id);
    if (!success) {
      return res.status(404).json({ message: "Feature not found" });
    }
    
    res.status(204).end();
  });

  // Wallet Features endpoints
  app.get("/api/wallet-features", async (req, res) => {
    const type = req.query.type as WalletType | undefined;
    
    // Validate type if provided
    if (type && !walletTypes.includes(type)) {
      return res.status(400).json({ message: "Invalid wallet type" });
    }
    
    const walletsWithFeatures = await storage.getWalletsWithFeatures(type);
    res.json(walletsWithFeatures);
  });

  app.post("/api/wallet-features", async (req, res) => {
    try {
      const walletFeature = insertWalletFeatureSchema.parse(req.body);
      const result = await storage.setWalletFeature(walletFeature);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid wallet feature data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to set wallet feature" });
    }
  });

  // Newsletter endpoints
  app.post("/api/newsletter", async (req, res) => {
    try {
      // Validate email format
      const schema = z.object({
        email: z.string().email()
      });
      
      const { email } = schema.parse(req.body);
      const result = await sqliteNewsletterStorage.subscribeToNewsletter(email);
      res.status(201).json({ success: true, email: result.email });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid email address", 
          errors: error.errors 
        });
      }
      res.status(500).json({ 
        success: false, 
        message: "Failed to subscribe to newsletter" 
      });
    }
  });

  app.get("/api/newsletter", async (req, res) => {
    try {
      const subscribers = await sqliteNewsletterStorage.getAllNewsletterSubscribers();
      res.json(subscribers);
    } catch (error) {
      res.status(500).json({ message: "Failed to get newsletter subscribers" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
