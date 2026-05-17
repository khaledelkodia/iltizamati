import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCommitmentStore } from '../../store/useCommitmentStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { paymentRepo } from '../../database/repositories/paymentRepo';
import { formatCurrency } from '../../utils/currency';
import { STATUS_COLORS, STATUS_LABELS } from '../../utils/constants';
import { getRemainingText, getRemainingDays } from '../../utils/date';
import type { CommitmentWithCategory } from '../../types/commitment';
import { ChevronDown, CheckCircle, Clock } from 'lucide-react';

interface CommitmentCardProps {
  commitment: CommitmentWithCategory;
  isPaid?: boolean;
}

export default function CommitmentCard({ commitment, isPaid = false }: CommitmentCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { settings } = useSettingsStore();
  const [installmentTotalPaid, setInstallmentTotalPaid] = useState<number>(0);

  useEffect(() => {
    if (commitment.commitment_type === 'installment' && commitment.total_amount) {
      paymentRepo.getTotalPaidForCommitment(commitment.id).then(setInstallmentTotalPaid);
    }
  }, [commitment.id, commitment.commitment_type, commitment.total_amount, isPaid]);

  const remainingDays = getRemainingDays(new Date(new Date().getFullYear(), new Date().getMonth(), commitment.due_day));
  
  let status: keyof typeof STATUS_COLORS = 'upcoming';
  if (isPaid) status = 'paid';
  else if (remainingDays < 0) status = 'overdue';
  else if (remainingDays === 0) status = 'due_today';

  const colors = STATUS_COLORS[status];

  return (
    <motion.div
      layout
      onClick={() => setExpanded(!expanded)}
      className="bg-bg-secondary border border-border-primary rounded-2xl overflow-hidden shadow-sm"
      whileTap={{ scale: 0.98 }}
    >
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3 space-x-reverse">
          {/* Icon */}
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{ backgroundColor: `${commitment.category_color}20`, color: commitment.category_color }}
          >
            <span className="opacity-90">{commitment.category_icon}</span>
          </div>

          {/* Info */}
          <div>
            <h3 className="font-bold text-text-primary text-base">{commitment.name}</h3>
            <p className="text-text-muted text-xs mt-1">{commitment.category_name_ar}</p>
          </div>
        </div>

        {/* Amount & Status */}
        <div className="text-left">
          <p className="font-bold text-lg text-text-primary">
            {formatCurrency(commitment.amount, settings.currency)}
          </p>
          <div 
            className="inline-flex items-center space-x-1 space-x-reverse px-2 py-0.5 rounded-full mt-1 border"
            style={{ backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }}
          >
            <span className="text-[10px] font-bold">{STATUS_LABELS[status]}</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border-primary bg-bg-tertiary/50"
          >
            <div className="p-4 flex flex-col space-y-4">
               {/* Installment Progress */}
               {commitment.commitment_type === 'installment' && commitment.total_amount && (
                 <div className="bg-bg-secondary p-3 rounded-xl border border-border-secondary">
                   <div className="flex justify-between items-end mb-2">
                     <div>
                       <p className="text-xs text-text-muted">المبلغ الإجمالي المتبقي</p>
                       <p className="font-bold text-text-primary mt-1 text-sm">
                         {formatCurrency(commitment.total_amount - installmentTotalPaid, settings.currency)}
                       </p>
                     </div>
                     <div className="text-left">
                       <p className="text-[10px] text-accent-primary">سُدد {Math.min(100, Math.round((installmentTotalPaid / commitment.total_amount) * 100))}%</p>
                     </div>
                   </div>
                   <div className="w-full bg-border-primary rounded-full h-2 overflow-hidden">
                     <div 
                       className="bg-accent-primary h-full transition-all duration-500 rounded-full" 
                       style={{ width: `${Math.min(100, (installmentTotalPaid / commitment.total_amount) * 100)}%` }}
                     />
                   </div>
                 </div>
               )}

               <div className="flex justify-between items-center">
                 <div className="flex items-center space-x-2 rtl:space-x-reverse ltr:space-x text-sm text-text-muted">
                   <Clock size={16} />
                   <span>تاريخ الاستحقاق: {commitment.due_day} من كل شهر</span>
                 </div>
                 
                 {!isPaid && (
                    <button className="flex items-center space-x-1 rtl:space-x-reverse ltr:space-x text-accent-primary font-medium text-sm bg-accent-primary/10 px-3 py-1.5 rounded-lg border border-accent-primary/20">
                       <CheckCircle size={16} />
                       <span>تسجيل كمدفوع</span>
                    </button>
                 )}
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
