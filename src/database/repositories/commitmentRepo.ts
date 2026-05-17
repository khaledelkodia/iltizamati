// ========================================
// Repository — Commitments
// ========================================

import { db } from '../connection';
import type { Commitment, CommitmentWithCategory, CommitmentFormData } from '../../types/commitment';
import type { Category } from '../../types/category';

export const commitmentRepo = {
  async getAll(): Promise<CommitmentWithCategory[]> {
    const commitments = await db.getAll<Commitment>('commitments');
    const categories = await db.getAll<Category>('categories');
    
    return commitments
      .filter(c => c.is_active)
      .map(c => {
        const cat = categories.find(cat => cat.id === c.category_id);
        return {
          ...c,
          category_name: cat?.name || '',
          category_name_ar: cat?.name_ar || '',
          category_icon: cat?.icon || 'more-horizontal',
          category_color: cat?.color || '#64748B',
        };
      })
      .sort((a, b) => a.due_day - b.due_day);
  },

  async getById(id: number): Promise<CommitmentWithCategory | null> {
    const commitment = await db.getById<Commitment>('commitments', id);
    if (!commitment) return null;
    const categories = await db.getAll<Category>('categories');
    const cat = categories.find(c => c.id === commitment.category_id);
    return {
      ...commitment,
      category_name: cat?.name || '',
      category_name_ar: cat?.name_ar || '',
      category_icon: cat?.icon || 'more-horizontal',
      category_color: cat?.color || '#64748B',
    };
  },

  async create(data: CommitmentFormData): Promise<number> {
    return db.insert('commitments', {
      ...data,
      is_active: true,
      reminder_enabled: data.reminder_enabled ? 1 : 0,
    });
  },

  async update(id: number, data: Partial<CommitmentFormData>): Promise<void> {
    const updateData: Record<string, unknown> = { ...data };
    if (data.reminder_enabled !== undefined) {
      updateData.reminder_enabled = data.reminder_enabled ? 1 : 0;
    }
    await db.update('commitments', id, updateData);
  },

  async delete(id: number): Promise<void> {
    await db.delete('commitments', id);
    await db.deleteWhere('payments', (r) => r.commitment_id === id);
  },

  async archive(id: number): Promise<void> {
    await db.update('commitments', id, { is_active: false });
  },

  async getByCategory(categoryId: number): Promise<CommitmentWithCategory[]> {
    const all = await this.getAll();
    return all.filter(c => c.category_id === categoryId);
  },

  async search(query: string): Promise<CommitmentWithCategory[]> {
    const all = await this.getAll();
    const lower = query.toLowerCase();
    return all.filter(c => 
      c.name.toLowerCase().includes(lower) ||
      c.category_name_ar.includes(query)
    );
  },

  async getTotalMonthlyAmount(): Promise<number> {
    const commitments = await db.getAll<Commitment>('commitments');
    return commitments
      .filter(c => c.is_active)
      .reduce((sum, c) => sum + c.amount, 0);
  },
};
