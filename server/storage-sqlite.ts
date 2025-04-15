import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { sql } from 'drizzle-orm';
import { InsertNewsletter, Newsletter, newsletters } from '../shared/schema';
import path from 'path';
import fs from 'fs';

// Ensure the data directory exists
const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Create or open SQLite database
const DB_PATH = path.join(DATA_DIR, 'newsletter.sqlite');
const sqlite = new Database(DB_PATH);
const db = drizzle(sqlite);

// Ensure the newsletter table exists
function initializeDatabase() {
  // Create the newsletters table if it doesn't exist
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS newsletters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      subscribed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  console.log(`SQLite newsletter database initialized at ${DB_PATH}`);
}

// Initialize the database
initializeDatabase();

export class SQLiteNewsletterStorage {
  /**
   * Subscribe a new email to the newsletter
   */
  async subscribeToNewsletter(email: string): Promise<Newsletter> {
    try {
      // First check if the email already exists
      const existing = await this.getNewsletterSubscriberByEmail(email);
      if (existing) {
        return existing;
      }
      
      // Prepare the statement
      const stmt = sqlite.prepare(`
        INSERT INTO newsletters (email)
        VALUES (?)
        RETURNING *
      `);
      
      // Execute the statement
      const result = stmt.get(email) as any;
      
      // Convert result to Newsletter type
      return {
        id: result.id,
        email: result.email,
        subscribedAt: new Date(result.subscribed_at)
      };
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      throw error;
    }
  }
  
  /**
   * Get a subscriber by email
   */
  async getNewsletterSubscriberByEmail(email: string): Promise<Newsletter | undefined> {
    try {
      const stmt = sqlite.prepare(`
        SELECT * FROM newsletters WHERE email = ? LIMIT 1
      `);
      
      const result = stmt.get(email.toLowerCase()) as any;
      
      if (!result) {
        return undefined;
      }
      
      return {
        id: result.id,
        email: result.email,
        subscribedAt: new Date(result.subscribed_at)
      };
    } catch (error) {
      console.error('Error getting newsletter subscriber:', error);
      return undefined;
    }
  }
  
  /**
   * Get all newsletter subscribers
   */
  async getAllNewsletterSubscribers(): Promise<Newsletter[]> {
    try {
      const stmt = sqlite.prepare(`SELECT * FROM newsletters ORDER BY id DESC`);
      const results = stmt.all() as any[];
      
      return results.map(row => ({
        id: row.id,
        email: row.email, 
        subscribedAt: new Date(row.subscribed_at)
      }));
    } catch (error) {
      console.error('Error getting all newsletter subscribers:', error);
      return [];
    }
  }
}

export const sqliteNewsletterStorage = new SQLiteNewsletterStorage();