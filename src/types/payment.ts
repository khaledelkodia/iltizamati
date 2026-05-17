// ========================================
// Types — Payment
// ========================================

import { PaymentStatus } from './commitment';

export interface Payment {
  id: number;
  commitment_id: number;
  amount_paid: number;
  due_date: string;
  paid_date: string | null;
  status: PaymentStatus;
  notes?: string;
  created_at: string;
}

export interface PaymentWithCommitment extends Payment {
  commitment_name: string;
  commitment_amount: number;
  category_name_ar: string;
  category_icon: string;
  category_color: string;
}
