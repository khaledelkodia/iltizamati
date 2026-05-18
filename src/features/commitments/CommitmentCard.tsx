import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCommitmentStore } from '../../store/useCommitmentStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { paymentRepo } from '../../database/repositories/paymentRepo';
import { formatCurrency } from '../../utils/currency';
import { STATUS_COLORS, STATUS_LABELS } from '../../utils/constants';
import { getRemainingText, getRemainingDays, getCurrentMonthYear } from '../../utils/date';
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
  const [history, setHistory] = useState<any[]>([]);

  const payment = payments.find(p => p.commitment_id === commitment.id);

  const handleMarkAsPaid = async (e: React.MouseEvent) => {
     e.stopPropagation();
     if (payment) {
        await markPaymentAsPaid(payment.id);
     } else {
        const { year, month } = getCurrentMonthYear();
        await useCommitmentStore.getState().fetchPaymentsForMonth(year, month);
        const updatedPayment = useCommitmentStore.getState().payments.find(p => p.commitment_id === commitment.id);
        if (updatedPayment) {
           await markPaymentAsPaid(updatedPayment.id);
        } else {
           alert('تعذر العثور على فاتورة هذا الشهر للالتزام.');
        }
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
    if (commitment.commitment_type === 'installment') {
      if (commitment.total_amount) {
        paymentRepo.getTotalPaidForCommitment(commitment.id).then(setInstallmentTotalPaid);
      }
      paymentRepo.getByCommitmentId(commitment.id).then(setHistory);
    }
  }, [commitment.id, commitment.commitment_type, commitment.total_amount, isPaid, expanded]);

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
               {/* Installment Progress & Gorgeous Report Details */}
               {commitment.commitment_type === 'installment' && commitment.total_amount && commitment.amount && (() => {
                  const totalInstallments = Math.ceil(commitment.total_amount / commitment.amount);
                  const scheduleItems: Array<{
                    number: number;
                    amount: number;
                    dueDate: Date;
                    paidDate: Date | null;
                    status: 'pending' | 'paid' | 'overdue';
                    isForecast: boolean;
                  }> = [];
                  
                  // 1. Add database history items
                  history.forEach((p, index) => {
                    scheduleItems.push({
                      number: index + 1,
                      amount: p.amount_paid || commitment.amount,
                      dueDate: new Date(p.due_date),
                      paidDate: p.paid_date ? new Date(p.paid_date) : null,
                      status: p.status,
                      isForecast: false,
                    });
                  });

                  // 2. Add forecasted future items if they are not yet in database
                  let currentPaidTotal = history.reduce((sum, p) => sum + (p.status === 'paid' ? (p.amount_paid || commitment.amount) : 0), 0);
                  let remainingTotal = commitment.total_amount - currentPaidTotal;
                  
                  let lastDate = new Date();
                  if (history.length > 0) {
                    lastDate = new Date(history[history.length - 1].due_date);
                  } else {
                    lastDate.setDate(commitment.due_day);
                  }

                  const generatedCount = history.length;
                  const remainingInstallmentsCount = Math.max(0, totalInstallments - generatedCount);

                  for (let i = 0; i < remainingInstallmentsCount; i++) {
                    const nextDate = new Date(lastDate);
                    nextDate.setMonth(lastDate.getMonth() + i + 1);
                    
                    const installmentAmt = Math.min(commitment.amount, remainingTotal - (i * commitment.amount));
                    if (installmentAmt <= 0) break;

                    scheduleItems.push({
                      number: generatedCount + i + 1,
                      amount: installmentAmt,
                      dueDate: nextDate,
                      paidDate: null,
                      status: 'pending',
                      isForecast: true,
                    });
                  }

                  return (
                    <div className="bg-bg-secondary p-4 rounded-2xl border border-border-secondary space-y-4 shadow-inner">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[10px] text-text-muted font-bold font-secondary">المبلغ الإجمالي المتبقي</p>
                          <p className="font-extrabold text-text-primary mt-1 text-base leading-none">
                            {formatCurrency(commitment.total_amount - installmentTotalPaid, settings.currency)}
                          </p>
                        </div>
                        <div className="text-left ltr:text-right">
                          <p className="text-xs font-bold text-accent-primary">سُدد {Math.min(100, Math.round((installmentTotalPaid / commitment.total_amount) * 100))}%</p>
                          <p className="text-[9px] text-text-muted mt-0.5">من أصل {formatCurrency(commitment.total_amount, settings.currency)}</p>
                        </div>
                      </div>
                      
                      <div className="w-full bg-border-primary rounded-full h-2.5 overflow-hidden">
                        <div 
                          className="bg-gradient-primary h-full transition-all duration-500 rounded-full" 
                          style={{ width: `${Math.min(100, (installmentTotalPaid / commitment.total_amount) * 100)}%` }}
                        />
                      </div>

                      {/* Installment Movements List */}
                      <div className="pt-3 border-t border-border-primary space-y-2">
                         <p className="text-xs font-extrabold text-text-primary flex items-center gap-1.5 mb-2">
                            <span>📊</span>
                            <span>جدول سداد الأقساط</span>
                         </p>
                         
                         <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
                            {scheduleItems.map((item) => {
                               const isItemPaid = item.status === 'paid';
                               return (
                                  <div 
                                     key={item.number} 
                                     className={`flex justify-between items-center py-2 px-3 rounded-xl border transition-all ${
                                        isItemPaid 
                                          ? 'bg-bg-tertiary/20 border-border-primary/50 opacity-40' 
                                          : 'bg-bg-primary/50 border-border-secondary/60 hover:border-accent-primary/30'
                                     }`}
                                  >
                                     <div className="flex items-center" style={{ gap: '10px' }}>
                                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                                           isItemPaid ? 'bg-bg-tertiary text-text-muted' : 'bg-accent-primary/10 text-accent-primary'
                                        }`}>
                                           {item.number}
                                        </span>
                                        <div>
                                           <p className={`text-xs font-bold ${isItemPaid ? 'text-text-muted line-through' : 'text-text-primary'}`}>
                                              {formatCurrency(item.amount, settings.currency)}
                                           </p>
                                           <p className="text-[9px] text-text-muted mt-0.5">
                                              {isItemPaid 
                                                 ? `دُفع في ${item.paidDate ? item.paidDate.getDate() : ''}/${item.paidDate ? item.paidDate.getMonth() + 1 : ''}/${item.paidDate ? item.paidDate.getFullYear() : ''}`
                                                 : `يستحق في ${item.dueDate.getDate()}/${item.dueDate.getMonth() + 1}/${item.dueDate.getFullYear()}`
                                              }
                                           </p>
                                        </div>
                                     </div>
                                     
                                     <div className="flex-shrink-0">
                                        {isItemPaid ? (
                                           <span className="text-[9px] font-bold text-accent-primary bg-accent-primary/10 px-2 py-0.5 rounded-full border border-accent-primary/20">
                                              مكتمل ✓
                                           </span>
                                        ) : item.status === 'overdue' ? (
                                           <span className="text-[9px] font-bold text-accent-danger bg-accent-danger/10 px-2 py-0.5 rounded-full border border-accent-danger/20 animate-pulse">
                                              متأخر ⚠
                                           </span>
                                        ) : (
                                           <span className="text-[9px] font-bold text-accent-warning bg-accent-warning/10 px-2 py-0.5 rounded-full border border-accent-warning/20">
                                              {item.isForecast ? 'مستقبلي 🗓️' : 'مستحق ⏳'}
                                           </span>
                                        )}
                                     </div>
                                  </div>
                               );
                            })}
                         </div>
                      </div>
                    </div>
                  );
               })()}

                <div className="flex justify-between items-center pt-2">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse ltr:space-x text-xs text-text-muted">
                    <Clock size={14} />
                    <span>الاستحقاق: {commitment.due_day} من كل شهر</span>
                  </div>
                  
                  <div className="flex items-center" style={{ gap: '12px', flex: 1, justifyContent: 'flex-end' }}>
                    {/* Delete button */}
                    <button 
                      onClick={handleDelete}
                      className="flex items-center justify-center p-2.5 rounded-xl bg-accent-danger/10 text-accent-danger border border-accent-danger/20 hover:bg-accent-danger/20 transition-colors flex-shrink-0"
                      title="حذف الالتزام"
                    >
                      <Trash2 size={18} />
                    </button>

                    {/* Pay / Unpay button */}
                    {isPaid ? (
                      <button 
                        onClick={handleMarkAsPending}
                        className="flex items-center justify-center text-text-muted font-bold text-xs bg-bg-secondary px-4 py-2.5 rounded-xl border border-border-secondary hover:bg-border-secondary transition-colors"
                        style={{ gap: '6px' }}
                      >
                        <CheckCircle size={15} className="text-text-muted" />
                        <span>تراجع عن الدفع</span>
                      </button>
                    ) : (
                      <button 
                        onClick={handleMarkAsPaid}
                        className="flex items-center justify-center text-white font-extrabold text-xs bg-gradient-primary px-4 py-2.5 rounded-xl border-none shadow-glow-green hover:opacity-95 transition-all flex-shrink-0"
                        style={{ gap: '6px' }}
                      >
                        <CheckCircle size={15} />
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
