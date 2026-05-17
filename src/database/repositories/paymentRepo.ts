// ========================================
// Repository — Payments
// ========================================

import { db } from '../connection';
import type { Payment, PaymentWithCommitment } from '../../types/payment';
import type { Commitment } from '../../types/commitment';
import type { Category } from '../../types/category';
import { getDueDateISO, getCurrentMonthYear, startOfMonth, endOfMonth, format } from '../../utils/date';

export const paymentRepo = {
  async getAll(): Promise<PaymentWithCommitment[]> {
    const payments = await db.getAll<Payment>('payments');
    const commitments = await db.getAll<Commitment>('commitments');
    const categories = await db.getAll<Category>('categories');

    return payments.map(p => {
      const commitment = commitments.find(c => c.id === p.commitment_id);
      const cat = categories.find(c => c.id === commitment?.category_id);
      return {
        ...p,
        commitment_name: commitment?.name || 'مجهول',
        commitment_amount: commitment?.amount || 0,
        category_name_ar: cat?.name_ar || 'غير محدد',
        category_icon: cat?.icon || 'more-horizontal',
        category_color: cat?.color || '#64748B',
      };
    }).sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
  },

  async getPaymentsForMonth(year: number, month: number): Promise<PaymentWithCommitment[]> {
    const all = await this.getAll();
    const start = format(startOfMonth(new Date(year, month)), 'yyyy-MM-dd');
    const end = format(endOfMonth(new Date(year, month)), 'yyyy-MM-dd');
    return all.filter(p => p.due_date >= start && p.due_date <= end);
  },

  async getByCommitmentId(commitmentId: number): Promise<Payment[]> {
    const all = await db.getAll<Payment>('payments');
    return all.filter(p => p.commitment_id === commitmentId).sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
  },

  async markAsPaid(id: number, amountPaid?: number): Promise<void> {
    const payment = await db.getById<Payment>('payments', id);
    if (!payment) return;
    
    // If amountPaid is not provided, fetch the commitment amount
    let paidAmt = amountPaid;
    if (paidAmt === undefined) {
       const commitment = await db.getById<Commitment>('commitments', payment.commitment_id);
       paidAmt = commitment?.amount || 0;
    }

    await db.update('payments', id, {
      status: 'paid',
      paid_date: new Date().toISOString(),
      amount_paid: paidAmt,
    });
  },

  async markAsPending(id: number): Promise<void> {
    await db.update('payments', id, {
      status: 'pending',
      paid_date: null,
      amount_paid: 0,
    });
  },

  // Generates payment records for the current month based on active commitments
  async generateMonthlyPayments(year: number, month: number): Promise<void> {
    const commitments = await db.getAll<Commitment>('commitments');
    const activeCommitments = commitments.filter(c => c.is_active);
    
    // Get existing payments for this month to avoid duplicates
    const start = format(startOfMonth(new Date(year, month)), 'yyyy-MM-dd');
    const end = format(endOfMonth(new Date(year, month)), 'yyyy-MM-dd');
    
    const allPayments = await db.getAll<Payment>('payments');
    const existingPaymentsThisMonth = allPayments.filter(p => p.due_date >= start && p.due_date <= end);

    for (const c of activeCommitments) {
       // Only generate if it doesn't exist
       const exists = existingPaymentsThisMonth.some(p => p.commitment_id === c.id);
       if (!exists) {
         // If installment is fully paid, skip generating new payment
         if (c.commitment_type === 'installment' && c.total_amount) {
            const totalPaid = await this.getTotalPaidForCommitment(c.id);
            if (totalPaid >= c.total_amount) {
               continue;
            }
         }

         const dueDateISO = getDueDateISO(c.due_day, year, month);
         await db.insert('payments', {
           commitment_id: c.id,
           amount_paid: 0, // Will be set when paid
           due_date: dueDateISO,
           paid_date: null,
           status: 'pending',
         });
       }
    }
  },

  async getMonthStats(year: number, month: number): Promise<{ totalDue: number, totalPaid: number, remaining: number }> {
    const payments = await this.getPaymentsForMonth(year, month);
    let totalDue = 0;
    let totalPaid = 0;

    payments.forEach(p => {
      totalDue += p.commitment_amount;
      if (p.status === 'paid') {
        totalPaid += (p.amount_paid || p.commitment_amount);
      }
    });

    return { totalDue, totalPaid, remaining: totalDue - totalPaid };
  },

  async getTotalPaidForCommitment(commitmentId: number): Promise<number> {
    const payments = await db.getAll<Payment>('payments');
    let total = 0;
    payments.forEach(p => {
      if (p.commitment_id === commitmentId && p.status === 'paid') {
        total += (p.amount_paid || 0);
      }
    });
    return total;
  }
};
