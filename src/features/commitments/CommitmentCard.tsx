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
  isExpanded?: boolean;
  onToggle?: () => void;
}

export default function CommitmentCard({ commitment, isPaid = false, isExpanded, onToggle }: CommitmentCardProps) {
  const [localExpanded, setLocalExpanded] = useState(false);
  const isCardExpanded = isExpanded !== undefined ? isExpanded : localExpanded;
  
  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setLocalExpanded(!localExpanded);
    }
  };
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
  }, [commitment.id, commitment.commitment_type, commitment.total_amount, isPaid, isCardExpanded]);

  const remainingDays = getRemainingDays(new Date(new Date().getFullYear(), new Date().getMonth(), commitment.due_day));
  
  let status: keyof typeof STATUS_COLORS = 'upcoming';
  if (isPaid) status = 'paid';
  else if (remainingDays < 0) status = 'overdue';
  else if (remainingDays === 0) status = 'due_today';

  const colors = STATUS_COLORS[status];

  return (
    <motion.div
      layout
      onClick={handleToggle}
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
        {isCardExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border-primary/45 bg-bg-tertiary/10"
          >
            <div className="p-4 flex flex-col space-y-5">
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
                  
                  // 1. Filter out duplicate history items for the same month to solve double dates bug
                  const seenMonths = new Set<string>();
                  const uniqueHistory: typeof history = [];
                  history.forEach(p => {
                    if (p.due_date) {
                      const monthKey = p.due_date.substring(0, 7); // "YYYY-MM"
                      if (!seenMonths.has(monthKey)) {
                        seenMonths.add(monthKey);
                        uniqueHistory.push(p);
                      }
                    }
                  });

                  // Populate scheduleItems using uniqueHistory
                  uniqueHistory.forEach((p, index) => {
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
                  let currentPaidTotal = uniqueHistory.reduce((sum, p) => sum + (p.status === 'paid' ? (p.amount_paid || commitment.amount) : 0), 0);
                  let remainingTotal = commitment.total_amount - currentPaidTotal;
                  
                  let lastDate = new Date();
                  if (uniqueHistory.length > 0) {
                    lastDate = new Date(uniqueHistory[uniqueHistory.length - 1].due_date);
                  } else {
                    lastDate.setDate(commitment.due_day);
                  }

                  const generatedCount = uniqueHistory.length;
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
                    <div className="space-y-4">
                      {/* Premium Borderless 2-Column Summary */}
                      <div className="flex justify-between items-center py-2 px-1">
                         <div>
                            <span className="text-[10px] text-text-muted font-bold block mb-1">المبلغ المتبقي</span>
                            <span className="text-lg font-black text-accent-warning leading-none">
                               {formatCurrency(commitment.total_amount - installmentTotalPaid, settings.currency)}
                            </span>
                         </div>
                         <div className="text-left ltr:text-right">
                            <span className="text-[10px] text-text-muted font-bold block mb-1">نسبة السداد</span>
                            <span className="text-sm font-extrabold text-accent-primary leading-none">
                               {Math.min(100, Math.round((installmentTotalPaid / commitment.total_amount) * 100))}% 
                               <span className="text-[10px] text-text-muted font-normal mr-1">
                                  (سُدد {formatCurrency(installmentTotalPaid, settings.currency)} من {formatCurrency(commitment.total_amount, settings.currency)})
                               </span>
                            </span>
                         </div>
                      </div>

                      {/* Glowing Slim Progress Bar */}
                      <div className="space-y-1.5 px-1">
                         <div className="w-full bg-border-primary rounded-full h-1.5 overflow-hidden">
                           <div 
                             className="bg-gradient-primary h-full transition-all duration-500 rounded-full" 
                             style={{ width: `${Math.min(100, (installmentTotalPaid / commitment.total_amount) * 100)}%` }}
                           />
                         </div>
                      </div>

                      {/* Gorgeous Native Table with Premium Visible Row Lines */}
                      <div className="space-y-3 pt-3">
                         <p className="text-xs font-black text-text-primary flex items-center gap-1.5 px-1">
                            <span>📊</span>
                            <span>جدول الدفعات التفصيلي ({scheduleItems.length} أقساط)</span>
                         </p>
                         
                         <div className="w-full overflow-x-auto">
                            <table className="w-full text-right border-collapse bg-transparent">
                               <thead>
                                  <tr className="border-b border-white/20 bg-transparent">
                                     <th className="text-[10px] text-text-muted font-black py-3.5 px-2 text-center w-12">#</th>
                                     <th className="text-[10px] text-text-muted font-black py-3.5 px-2">قيمة القسط</th>
                                     <th className="text-[10px] text-text-muted font-black py-3.5 px-2">تاريخ الاستحقاق</th>
                                     <th className="text-[10px] text-text-muted font-black py-3.5 px-2">تاريخ السداد</th>
                                     <th className="text-[10px] text-text-muted font-black py-3.5 px-2 text-center w-28">الحالة</th>
                                  </tr>
                                </thead>
                               <tbody className="bg-transparent">
                                  {scheduleItems.map((item, index) => {
                                     const isItemPaid = item.status === 'paid';
                                     const isActive = item.status === 'pending' && !item.isForecast;

                                     return (
                                        <tr 
                                           key={item.number} 
                                           className={`border-b border-white/[0.12] transition-all duration-200 hover:bg-bg-secondary/15 bg-transparent ${isItemPaid ? 'opacity-50' : ''}`}
                                        >
                                           {/* Column 1: Row Number */}
                                           <td className="py-3 px-2 text-center font-black text-xs text-text-muted">
                                              {item.number}
                                           </td>

                                           {/* Column 2: Amount */}
                                           <td className="py-3 px-2 font-extrabold text-xs whitespace-nowrap text-text-primary">
                                              {formatCurrency(item.amount, settings.currency)}
                                           </td>

                                           {/* Column 3: Due Date */}
                                           <td className="py-3 px-2 text-[10px] text-text-muted font-bold whitespace-nowrap">
                                              {item.dueDate.getDate()}/{item.dueDate.getMonth() + 1}/{item.dueDate.getFullYear()}
                                           </td>

                                           {/* Column 4: Paid Date */}
                                           <td className="py-3 px-2 text-[10px] font-bold whitespace-nowrap">
                                              {isItemPaid && item.paidDate ? (
                                                 <span className="text-accent-primary">
                                                    {item.paidDate.getDate()}/{item.paidDate.getMonth() + 1}/{item.paidDate.getFullYear()}
                                                 </span>
                                              ) : (
                                                 <span className="text-text-muted/40 font-normal">-</span>
                                              )}
                                           </td>

                                           {/* Column 5: Clean Borderless Pill Badge */}
                                           <td className="py-3 px-2 text-center whitespace-nowrap">
                                              {isItemPaid ? (
                                                 <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded text-[9px] font-bold bg-accent-primary/10 text-accent-primary">
                                                    تم الدفع
                                                 </span>
                                              ) : item.status === 'overdue' ? (
                                                 <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded text-[9px] font-bold bg-accent-danger/10 text-accent-danger animate-pulse">
                                                    متأخر
                                                 </span>
                                              ) : isActive ? (
                                                 <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded text-[9px] font-bold bg-accent-primary/20 text-accent-primary">
                                                    مستحق
                                                 </span>
                                              ) : (
                                                 <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded text-[9px] font-bold bg-bg-secondary text-text-muted">
                                                    قادم
                                                 </span>
                                              )}
                                           </td>
                                        </tr>
                                     );
                                  })}
                               </tbody>
                            </table>
                         </div>
                      </div>
                    </div>
                  );
               })()}

                 {/* Premium Spaced Bottom Actions Row */}
                 <div className="pt-3 border-t border-border-primary/40 space-y-3">
                   {/* Due Date Indicator */}
                   <div className="flex items-center text-xs text-text-muted px-1" style={{ gap: '6px' }}>
                     <Clock size={13} className="text-text-muted" />
                     <span>تاريخ الاستحقاق الشهري: {commitment.due_day} من كل شهر</span>
                   </div>
                   
                   <div className="flex items-center w-full" style={{ gap: '12px' }}>
                     {/* Delete button */}
                     <button 
                       onClick={handleDelete}
                       className="flex items-center justify-center p-3 rounded-xl bg-accent-danger/10 text-accent-danger border border-accent-danger/25 hover:bg-accent-danger/20 transition-all active:scale-95 flex-shrink-0"
                       title="حذف الالتزام"
                     >
                       <Trash2 size={18} />
                     </button>

                     {/* Pay / Unpay button */}
                     {isPaid ? (
                       <button 
                         onClick={handleMarkAsPending}
                         className="flex-1 flex items-center justify-center text-text-muted font-bold text-xs bg-bg-secondary border border-border-secondary py-3 rounded-xl hover:bg-border-secondary transition-all active:scale-95"
                         style={{ gap: '8px' }}
                       >
                         <CheckCircle size={16} className="text-text-muted" />
                         <span>تراجع عن تسجيل الدفع</span>
                       </button>
                     ) : (
                       <button 
                         onClick={handleMarkAsPaid}
                         className="flex-1 flex items-center justify-center text-white font-extrabold text-xs bg-gradient-primary py-3 rounded-xl border-none shadow-glow-green hover:opacity-95 transition-all flex-shrink-0"
                         style={{ gap: '8px' }}
                       >
                         <CheckCircle size={16} />
                         <span>تسجيل كمدفوع this month</span>
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
