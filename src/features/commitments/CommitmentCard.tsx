import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCommitmentStore } from '../../store/useCommitmentStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { paymentRepo } from '../../database/repositories/paymentRepo';
import { formatCurrency } from '../../utils/currency';
import { STATUS_COLORS, STATUS_LABELS } from '../../utils/constants';
import { getRemainingText, getRemainingDays } from '../../utils/date';
import type { CommitmentWithCategory } from '../../types/commitment';
import { ChevronDown, CheckCircle, Clock, Trash2 } from 'lucide-react';
import CategoryIcon from '../../components/ui/CategoryIcon';

interface CommitmentCardProps {
  commitment: CommitmentWithCategory;
  isPaid?: boolean;
}

export default function CommitmentCard({ commitment, isPaid = false }: CommitmentCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { settings } = useSettingsStore();
  const { payments, markPaymentAsPaid, markPaymentAsPending, deleteCommitment } = useCommitmentStore();
  const [installmentTotalPaid, setInstallmentTotalPaid] = useState<number>(0);

  const payment = payments.find(p => p.commitment_id === commitment.id);

  const handleMarkAsPaid = async (e: React.MouseEvent) => {
     e.stopPropagation();
     if (payment) {
        await markPaymentAsPaid(payment.id);
     }
  };

  const handleMarkAsPending = async (e: React.MouseEvent) => {
     e.stopPropagation();
     if (payment) {
        await markPaymentAsPending(payment.id);
     }
  };

  const handleDelete = async (e: React.MouseEvent) => {
     e.stopPropagation();
     if (window.confirm('هل أنت متأكد من حذف هذا الالتزام نهائياً؟ سيتم حذف جميع الفواتير المتعلقة به.')) {
        await deleteCommitment(commitment.id);
     }
  };

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
            <CategoryIcon iconName={commitment.category_icon} size={24} className="opacity-90" />
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

                <div className="flex justify-between items-center pt-2">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse ltr:space-x text-xs text-text-muted">
                    <Clock size={14} />
                    <span>الاستحقاق: {commitment.due_day} من كل شهر</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    {/* Delete button */}
                    <button 
                      onClick={handleDelete}
                      className="flex items-center justify-center p-2 rounded-lg bg-accent-danger/10 text-accent-danger border border-accent-danger/20 hover:bg-accent-danger/20 transition-colors"
                      title="حذف الالتزام"
                    >
                      <Trash2 size={16} />
                    </button>

                    {/* Pay / Unpay button */}
                    {isPaid ? (
                      <button 
                        onClick={handleMarkAsPending}
                        className="flex items-center space-x-1 rtl:space-x-reverse text-text-muted font-medium text-xs bg-bg-tertiary px-3 py-1.5 rounded-lg border border-border-secondary hover:bg-border-secondary transition-colors"
                      >
                        <span>تراجع عن الدفع</span>
                      </button>
                    ) : (
                      <button 
                        onClick={handleMarkAsPaid}
                        className="flex items-center space-x-1 rtl:space-x-reverse text-accent-primary font-medium text-xs bg-accent-primary/10 px-3 py-1.5 rounded-lg border border-accent-primary/20 hover:bg-accent-primary/20 transition-colors"
                      >
                        <CheckCircle size={14} />
                        <span>تسجيل كمدفوع</span>
                      </button>
                    )}
                  </div>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
