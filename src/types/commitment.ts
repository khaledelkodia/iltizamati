// ========================================
// Types — Commitment
// ========================================

export type RecurringType = 'monthly' | 'yearly';
export type CommitmentType = 'recurring' | 'installment';
export type PaymentStatus = 'pending' | 'paid' | 'overdue';

export interface Commitment {
  id: number;
  name: string;
  amount: number; // Monthly payment
  total_amount: number | null; // Null if recurring, total debt if installment
  commitment_type: CommitmentType;
  due_day: number;
  category_id: number;
  recurring_type: RecurringType;
  custom_interval?: number;
  notes?: string;
  reminder_enabled: boolean;
  reminder_days_before: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommitmentWithCategory extends Commitment {
  category_name: string;
  category_name_ar: string;
  category_icon: string;
  category_color: string;
}

export interface CommitmentFormData {
  name: string;
  amount: number;
  total_amount: number | null;
  commitment_type: CommitmentType;
  due_day: number;
  category_id: number;
  recurring_type: RecurringType;
  custom_interval?: number;
  notes?: string;
  reminder_enabled: boolean;
  reminder_days_before: number;
}
