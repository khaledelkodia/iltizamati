import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCommitmentStore } from '../../store/useCommitmentStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { formatCurrency } from '../../utils/currency';
import { getMonthDays, getCurrentMonthYear, isSameDayCheck, format } from '../../utils/date';
import { ChevronRight, ChevronLeft, Calendar as CalendarIcon, CheckCircle, AlertCircle } from 'lucide-react';
import DaySheet from './DaySheet';
import type { PaymentWithCommitment } from '../../types/payment';

export default function CalendarScreen() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayPayments, setSelectedDayPayments] = useState<PaymentWithCommitment[] | null>(null);
  const { payments } = useCommitmentStore();
  const { settings } = useSettingsStore();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const days = getMonthDays(year, month);

  // Month navigation
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));

  // Get payments for a specific day
  const getPaymentsForDay = (date: Date) => {
     return payments.filter(p => isSameDayCheck(new Date(p.due_date), date));
  };

  const dayNames = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

  return (
    <div className="p-4 safe-area-top min-h-screen flex flex-col">
       
      {/* Header */}
      <div className="flex justify-between items-center mt-4 mb-6">
        <h1 className="text-2xl font-bold text-text-primary">التقويم</h1>
        <div className="w-10 h-10 rounded-full bg-bg-tertiary flex items-center justify-center border border-border-primary">
           <CalendarIcon className="text-accent-secondary" size={20} />
        </div>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between bg-bg-secondary p-2 rounded-2xl mb-6 border border-border-primary shadow-sm">
         <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-bg-tertiary text-text-muted transition-colors">
            <ChevronRight size={20} />
         </button>
         <h2 className="text-lg font-bold">
            {format(currentDate, 'MMMM yyyy')}
         </h2>
         <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-bg-tertiary text-text-muted transition-colors">
            <ChevronLeft size={20} />
         </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-bg-secondary border border-border-primary rounded-2xl p-4 shadow-sm">
         {/* Days Header */}
         <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(day => (
               <div key={day} className="text-center text-xs font-medium text-text-muted py-2">
                  {day}
               </div>
            ))}
         </div>

         {/* Days Grid */}
         <div className="grid grid-cols-7 gap-2">
            {/* Empty slots for start of month offset */}
            {Array.from({ length: days[0].getDay() }).map((_, i) => (
               <div key={`empty-${i}`} className="h-12" />
            ))}

            {days.map(day => {
               const dayPayments = getPaymentsForDay(day);
               const hasUnpaid = dayPayments.some(p => p.status !== 'paid');
               const hasPaid = dayPayments.some(p => p.status === 'paid');
               
               let dotColor = '';
               if (hasUnpaid) dotColor = 'bg-accent-danger';
               else if (hasPaid) dotColor = 'bg-accent-primary';

               return (
                  <motion.button
                     key={day.toISOString()}
                     whileTap={{ scale: 0.9 }}
                     onClick={() => {
                        if (dayPayments.length > 0) setSelectedDayPayments(dayPayments);
                     }}
                     className={`h-12 flex flex-col items-center justify-center rounded-xl relative transition-colors ${
                        dayPayments.length > 0 ? 'bg-bg-tertiary cursor-pointer hover:bg-bg-tertiary/80' : 'opacity-50 cursor-default'
                     }`}
                  >
                     <span className="text-sm font-medium">{day.getDate()}</span>
                     {dotColor && (
                        <div className={`w-1.5 h-1.5 rounded-full absolute bottom-1.5 ${dotColor} shadow-[0_0_4px_currentColor]`} />
                     )}
                  </motion.button>
               );
            })}
         </div>
      </div>

      {/* Upcoming specific view below calendar */}
      <div className="mt-8 flex-1">
         <h3 className="font-bold text-lg mb-4">التزامات هذا الشهر ({payments.length})</h3>
         <div className="space-y-3">
            {payments.slice(0, 5).map(payment => (
               <div key={payment.id} className="bg-bg-secondary border border-border-primary rounded-xl p-3 flex justify-between items-center">
                  <div className="flex items-center space-x-3 space-x-reverse">
                     <div className="w-10 h-10 rounded-full bg-bg-tertiary flex items-center justify-center text-xl">
                        {payment.category_icon}
                     </div>
                     <div>
                        <p className="font-bold text-sm">{payment.commitment_name}</p>
                        <p className="text-xs text-text-muted mt-0.5">يوم {new Date(payment.due_date).getDate()}</p>
                     </div>
                  </div>
                  <div className="text-left">
                     <p className="font-bold text-sm">{formatCurrency(payment.commitment_amount, settings.currency)}</p>
                     {payment.status === 'paid' ? (
                        <span className="text-[10px] text-accent-primary flex items-center justify-end mt-1"><CheckCircle size={10} className="ml-1"/> مدفوع</span>
                     ) : (
                        <span className="text-[10px] text-accent-warning flex items-center justify-end mt-1"><AlertCircle size={10} className="ml-1"/> معلق</span>
                     )}
                  </div>
               </div>
            ))}
         </div>
      </div>

      {/* Day Details Bottom Sheet */}
      <AnimatePresence>
         {selectedDayPayments && (
            <DaySheet 
               payments={selectedDayPayments} 
               onClose={() => setSelectedDayPayments(null)} 
            />
         )}
      </AnimatePresence>
    </div>
  );
}
