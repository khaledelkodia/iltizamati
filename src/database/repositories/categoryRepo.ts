// ========================================
// Repository — Categories
// ========================================

import { db } from '../connection';
import type { Category } from '../../types/category';

export const categoryRepo = {
  async getAll(): Promise<Category[]> {
    const categories = await db.getAll<Category>('categories');
    return categories.sort((a, b) => a.sort_order - b.sort_order);
  },

  async getById(id: number): Promise<Category | null> {
    return db.getById<Category>('categories', id);
  },

  async create(data: Omit<Category, 'id' | 'created_at'>): Promise<number> {
    return db.insert('categories', data);
  },

  async update(id: number, data: Partial<Omit<Category, 'id' | 'created_at'>>): Promise<void> {
    await db.update('categories', id, data);
  },

  async delete(id: number): Promise<void> {
    // Check if category is used
    const inUse = await db.count('commitments', (r) => r.category_id === id);
    if (inUse > 0) {
      throw new Error('لا يمكن حذف القسم، يوجد التزامات مرتبطة به.');
    }
    await db.delete('categories', id);
  },
};
