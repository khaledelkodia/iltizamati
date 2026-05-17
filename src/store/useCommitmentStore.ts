// ========================================
// Store — Commitments & Payments
// ========================================

import { create } from 'zustand';
import { commitmentRepo } from '../database/repositories/commitmentRepo';
import { paymentRepo } from '../database/repositories/paymentRepo';
import { categoryRepo } from '../database/repositories/categoryRepo';
import type { Commitment, CommitmentWithCategory, CommitmentFormData } from '../types/commitment';
import type { PaymentWithCommitment } from '../types/payment';
import type { Category } from '../types/category';
import { getCurrentMonthYear } from '../utils/date';

interface CommitmentState {
  commitments: CommitmentWithCategory[];
  categories: Category[];
  payments: PaymentWithCommitment[];
  isLoading: boolean;
  error: string | null;
  currentMonthStats: { totalDue: number; totalPaid: number; remaining: number };

  fetchInitialData: () => Promise<void>;
  fetchCommitments: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchPaymentsForMonth: (year: number, month: number) => Promise<void>;
  
  addCommitment: (data: CommitmentFormData) => Promise<Commitment>;
  updateCommitment: (id: number, data: Partial<CommitmentFormData>) => Promise<void>;
  deleteCommitment: (id: number) => Promise<void>;
  
  markPaymentAsPaid: (id: number, amount?: number) => Promise<void>;
  markPaymentAsPending: (id: number) => Promise<void>;
}

export const useCommitmentStore = create<CommitmentState>((set, get) => ({
  commitments: [],
  categories: [],
  payments: [],
  isLoading: false,
  error: null,
  currentMonthStats: { totalDue: 0, totalPaid: 0, remaining: 0 },

  fetchInitialData: async () => {
    set({ isLoading: true, error: null });
    try {
      const { year, month } = getCurrentMonthYear();
      // Ensure payments are generated for current month
      await paymentRepo.generateMonthlyPayments(year, month);
      
      const [commitments, categories, payments, stats] = await Promise.all([
        commitmentRepo.getAll(),
        categoryRepo.getAll(),
        paymentRepo.getPaymentsForMonth(year, month),
        paymentRepo.getMonthStats(year, month),
      ]);
      
      set({ commitments, categories, payments, currentMonthStats: stats, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchCommitments: async () => {
    try {
      const commitments = await commitmentRepo.getAll();
      set({ commitments });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  fetchCategories: async () => {
     try {
      const categories = await categoryRepo.getAll();
      set({ categories });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  fetchPaymentsForMonth: async (year: number, month: number) => {
    try {
      // Always generate before fetching to be safe
      await paymentRepo.generateMonthlyPayments(year, month);
      const [payments, stats] = await Promise.all([
         paymentRepo.getPaymentsForMonth(year, month),
         paymentRepo.getMonthStats(year, month)
      ]);
      set({ payments, currentMonthStats: stats });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  addCommitment: async (data: CommitmentFormData) => {
    try {
      const newId = await commitmentRepo.create(data);
      // Re-fetch to update lists
      const { year, month } = getCurrentMonthYear();
      await paymentRepo.generateMonthlyPayments(year, month); // Generate payments for new commitment
      await Promise.all([
        get().fetchCommitments(),
        get().fetchPaymentsForMonth(year, month)
      ]);
      const newCommitment = await commitmentRepo.getById(newId);
      if (!newCommitment) throw new Error('Failed to create commitment');
      return newCommitment;
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  updateCommitment: async (id: number, data: Partial<CommitmentFormData>) => {
     try {
      await commitmentRepo.update(id, data);
      const { year, month } = getCurrentMonthYear();
      await Promise.all([
        get().fetchCommitments(),
        get().fetchPaymentsForMonth(year, month) // Re-fetch to see updated amounts if changed
      ]);
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  deleteCommitment: async (id: number) => {
     try {
      await commitmentRepo.delete(id);
      const { year, month } = getCurrentMonthYear();
      await Promise.all([
        get().fetchCommitments(),
        get().fetchPaymentsForMonth(year, month)
      ]);
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  markPaymentAsPaid: async (id: number, amount?: number) => {
      try {
        await paymentRepo.markAsPaid(id, amount);
        const { year, month } = getCurrentMonthYear();
        await get().fetchPaymentsForMonth(year, month);
      } catch (err: any) {
        set({ error: err.message });
        throw err;
      }
  },

  markPaymentAsPending: async (id: number) => {
     try {
        await paymentRepo.markAsPending(id);
        const { year, month } = getCurrentMonthYear();
        await get().fetchPaymentsForMonth(year, month);
      } catch (err: any) {
        set({ error: err.message });
        throw err;
      }
  }

}));
