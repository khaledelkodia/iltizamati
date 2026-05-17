import React from 'react';
import { motion } from 'framer-motion';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useCommitmentStore } from '../../store/useCommitmentStore';
import { formatCurrency } from '../../utils/currency';
import { format } from '../../utils/date';
import type { PaymentWithCommitment } from '../../types/payment';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

interface DaySheetProps {
  payments: PaymentWithCommitment[];
  onClose: () => void;
}

export default function DaySheet({ payments, onClose }: DaySheetProps) {
  const { settings } = useSettingsStore();
  const { markPaymentAsPaid } = useCommitmentStore();
  const date = payments.length > 0 ? new Date(payments[0].due_date) : new Date();

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[998]"
      />

      {/* Sheet */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed bottom-0 left-0 right-0 max-h-[85vh] bg-bg-primary rounded-t-[32px] z-[999] flex flex-col shadow-xl border-t border-border-primary"
      >
        {/* Handle */}
        <div className="w-full flex justify-center py-3">
          <div className="w-12 h-1.5 bg-border-secondary rounded-full" />
        </div>

        {/* Header */}
        <div className="px-6 pb-4 flex justify-between items-center border-b border-border-primary">
          <div>
            <h2 className="text-xl font-bold">التزامات يوم {date.getDate()}</h2>
            <p className="text-text-muted text-sm">{format(date, 'MMMM yyyy')}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-bg-secondary text-text-muted">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 pb-24 safe-area-bottom">
          {payments.map(payment => (
            <div key={payment.id} className="bg-bg-secondary border border-border-primary rounded-2xl p-4">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: `${payment.category_color}20`, color: payment.category_color }}>
                    {payment.category_icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-base">{payment.commitment_name}</h3>
                    <p className="text-text-muted text-sm">{payment.category_name_ar}</p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="font-bold text-lg">{formatCurrency(payment.commitment_amount, settings.currency)}</p>
                </div>
              </div>

              {/* Action Area */}
              <div className="pt-4 border-t border-border-primary flex justify-between items-center">
                {payment.status === 'paid' ? (
                  <div className="flex items-center text-accent-primary font-medium text-sm">
                    <CheckCircle size={18} className="ml-1.5" />
                    تم الدفع
                  </div>
                ) : (
                  <>
                    <div className="flex items-center text-accent-warning font-medium text-sm">
                      <AlertCircle size={18} className="ml-1.5" />
                      بانتظار الدفع
                    </div>
                    <button 
                      onClick={() => markPaymentAsPaid(payment.id)}
                      className="bg-accent-primary text-white px-4 py-2 rounded-xl text-sm font-bold shadow-glow-green"
                    >
                      دفع الآن
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </>
  );
}
