// ========================================
// Database — Connection Manager
// Web-only implementation using localStorage
// (Capacitor SQLite used on native devices)
// ========================================

import { DB_NAME } from '../utils/constants';
import { MIGRATIONS } from './migrations';
import { seedCategories } from './seed';

export interface DBRow {
  [key: string]: unknown;
}

/**
 * Lightweight in-browser SQL-like database using localStorage.
 * On native Android, this would be replaced by @capacitor-community/sqlite.
 * For the web preview, we simulate tables with JSON arrays in localStorage.
 */
class Database {
  private tables: Map<string, DBRow[]> = new Map();
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Load existing data from localStorage
    const stored = localStorage.getItem(DB_NAME);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        Object.entries(data).forEach(([table, rows]) => {
          this.tables.set(table, rows as DBRow[]);
        });
      } catch {
        console.warn('Failed to parse stored DB, reinitializing...');
      }
    }

    // Run migrations
    await this.runMigrations();

    // Seed data if needed
    const categories = this.tables.get('categories') || [];
    if (categories.length === 0) {
      await seedCategories(this);
    }

    this.initialized = true;
    console.log('✅ Database initialized');
  }

  private async runMigrations(): Promise<void> {
    for (const migration of MIGRATIONS) {
      for (const table of migration.tables) {
        if (!this.tables.has(table)) {
          this.tables.set(table, []);
        }
      }
    }
    this.persist();
  }

  async getAll<T = DBRow>(table: string): Promise<T[]> {
    return (this.tables.get(table) || []) as T[];
  }

  async getById<T = DBRow>(table: string, id: number): Promise<T | null> {
    const rows = this.tables.get(table) || [];
    if (table === 'commitments') {
      let commitments = rows;
      if (commitments.length > 0 && !('commitment_type' in commitments[0])) {
         commitments = commitments.map(c => ({
            ...c,
            commitment_type: 'recurring',
            total_amount: null
         }));
         this.tables.set('commitments', commitments);
         this.persist();
      }
    }
    return (rows.find((r) => r.id === id) as T) || null;
  }

  async query<T = DBRow>(table: string, predicate: (row: DBRow) => boolean): Promise<T[]> {
    const rows = this.tables.get(table) || [];
    return rows.filter(predicate) as T[];
  }

  async insert(table: string, data: Omit<DBRow, 'id'>): Promise<number> {
    const rows = this.tables.get(table) || [];
    const maxId = rows.reduce((max, r) => Math.max(max, (r.id as number) || 0), 0);
    const id = maxId + 1;
    const now = new Date().toISOString();
    const row = { ...data, id, created_at: now, updated_at: now };
    rows.push(row);
    this.tables.set(table, rows);
    this.persist();
    return id;
  }

  async update(table: string, id: number, data: Partial<DBRow>): Promise<void> {
    const rows = this.tables.get(table) || [];
    const index = rows.findIndex((r) => r.id === id);
    if (index >= 0) {
      rows[index] = { ...rows[index], ...data, updated_at: new Date().toISOString() };
      this.tables.set(table, rows);
      this.persist();
    }
  }

  async delete(table: string, id: number): Promise<void> {
    const rows = this.tables.get(table) || [];
    this.tables.set(table, rows.filter((r) => r.id !== id));
    this.persist();
  }

  async deleteWhere(table: string, predicate: (row: DBRow) => boolean): Promise<void> {
    const rows = this.tables.get(table) || [];
    this.tables.set(table, rows.filter((r) => !predicate(r)));
    this.persist();
  }

  async count(table: string, predicate?: (row: DBRow) => boolean): Promise<number> {
    const rows = this.tables.get(table) || [];
    if (predicate) return rows.filter(predicate).length;
    return rows.length;
  }

  async sum(table: string, field: string, predicate?: (row: DBRow) => boolean): Promise<number> {
    let rows = this.tables.get(table) || [];
    if (predicate) rows = rows.filter(predicate);
    return rows.reduce((sum, r) => sum + (Number(r[field]) || 0), 0);
  }

  // Settings key-value store
  async getSetting(key: string): Promise<string | null> {
    const settings = this.tables.get('settings') || [];
    const row = settings.find((r) => r.key === key);
    return row ? (row.value as string) : null;
  }

  async setSetting(key: string, value: string): Promise<void> {
    const settings = this.tables.get('settings') || [];
    const index = settings.findIndex((r) => r.key === key);
    if (index >= 0) {
      settings[index].value = value;
    } else {
      settings.push({ key, value });
    }
    this.tables.set('settings', settings);
    this.persist();
  }

  // Export/Import for backup
  exportData(): string {
    const data: Record<string, DBRow[]> = {};
    this.tables.forEach((rows, table) => {
      data[table] = rows;
    });
    return JSON.stringify(data, null, 2);
  }

  async importData(jsonStr: string): Promise<void> {
    try {
      const data = JSON.parse(jsonStr);
      this.tables.clear();
      Object.entries(data).forEach(([table, rows]) => {
        this.tables.set(table, rows as DBRow[]);
      });
      this.persist();
    } catch (e) {
      throw new Error('بيانات النسخة الاحتياطية غير صالحة');
    }
  }

  private persist(): void {
    const data: Record<string, DBRow[]> = {};
    this.tables.forEach((rows, table) => {
      data[table] = rows;
    });
    localStorage.setItem(DB_NAME, JSON.stringify(data));
  }

  async clearAll(): Promise<void> {
    this.tables.clear();
    localStorage.removeItem(DB_NAME);
  }
}

// Singleton instance
export const db = new Database();
