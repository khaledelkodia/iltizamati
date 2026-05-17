import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCommitmentStore } from '../../store/useCommitmentStore';
import { ArrowRight, Save } from 'lucide-react';
import type { CommitmentFormData, RecurringType } from '../../types/commitment';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '../notifications/useNotifications';

export default function AddCommitmentScreen() {
  const navigate = useNavigate();
  const { addCommitment, categories } = useCommitmentStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();
  const { scheduleReminder } = useNotifications();

  const [formData, setFormData] = useState<CommitmentFormData>({
    name: '',
    amount: 0,
    total_amount: null,
    commitment_type: 'recurring',
    due_day: 1,
    category_id: categories[0]?.id || 1,
    recurring_type: 'monthly',
    reminder_enabled: true,
    reminder_days_before: 1,
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    let parsedValue: any = value;
    if (type === 'number') parsedValue = Number(value);
    if (type === 'checkbox') parsedValue = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({ ...prev, [name]: parsedValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      const newCommitment = await addCommitment(formData);
      
      // Schedule Native Notification if enabled
      if (formData.reminder_enabled) {
         scheduleReminder(
            newCommitment.id, 
            `تذكير بدفع: ${formData.name}`, 
            `متبقي يوم واحد على موعد استحقاق ${formData.name}. لا تنس الدفع!`, 
            formData.due_day
         );
      }

      navigate(-1); // Go back on success
    } catch (error) {
      console.error('Error saving commitment', error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col z-50 fixed inset-0">
      {/* Header */}
      <div className="safe-area-top bg-bg-secondary border-b border-border-primary px-4 py-4 flex items-center justify-between">
         <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-bg-tertiary text-text-muted">
            <ArrowRight size={24} />
         </button>
         <h1 className="text-xl font-bold">إضافة التزام جديد</h1>
         <div className="w-10"></div> {/* Spacer */}
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24">
         <form id="add-commitment-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Name */}
            <div className="space-y-2">
               <label className="text-sm font-medium text-text-secondary">{t('add_commitment.name_label')}</label>
               <input 
                  required
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={t('add_commitment.name_placeholder')}
                  className="w-full bg-bg-secondary border border-border-primary rounded-xl p-4 text-text-primary focus:border-accent-primary transition-colors outline-none"
               />
            </div>

            {/* Type */}
            <div className="space-y-2">
               <label className="text-sm font-medium text-text-secondary">نوع الالتزام</label>
               <div className="flex bg-bg-secondary p-1 rounded-xl border border-border-primary">
                  <button
                     type="button"
                     onClick={() => setFormData(prev => ({ ...prev, commitment_type: 'recurring', total_amount: null }))}
                     className={`flex-1 py-3 text-sm font-bold rounded-lg transition-colors ${formData.commitment_type === 'recurring' ? 'bg-bg-tertiary text-white shadow-sm' : 'text-text-muted'}`}
                  >
                     مستمر (فواتير/اشتراكات)
                  </button>
                  <button
                     type="button"
                     onClick={() => setFormData(prev => ({ ...prev, commitment_type: 'installment', total_amount: '' as any }))}
                     className={`flex-1 py-3 text-sm font-bold rounded-lg transition-colors ${formData.commitment_type === 'installment' ? 'bg-bg-tertiary text-white shadow-sm' : 'text-text-muted'}`}
                  >
                     مقسط (أقساط/جمعية/ديون)
                  </button>
               </div>
            </div>

            {/* Total Amount (Only for installment) */}
            {formData.commitment_type === 'installment' && (
               <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">المبلغ الإجمالي</label>
                  <input 
                     required
                     type="number" 
                     name="total_amount"
                     min="0"
                     step="0.01"
                     value={formData.total_amount || ''}
                     onChange={handleChange}
                     placeholder="المبلغ الإجمالي للدين أو القسط..."
                     className="w-full bg-bg-secondary border border-border-primary rounded-xl p-4 text-text-primary focus:border-accent-primary transition-colors outline-none text-2xl font-bold"
                  />
               </div>
            )}

            {/* Amount */}
            <div className="space-y-2">
               <label className="text-sm font-medium text-text-secondary">القسط الشهري</label>
               <input 
                  required
                  type="number" 
                  name="amount"
                  min="0"
                  step="0.01"
                  value={formData.amount || ''}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full bg-bg-secondary border border-border-primary rounded-xl p-4 text-text-primary focus:border-accent-primary transition-colors outline-none text-2xl font-bold text-accent-primary"
               />
               {formData.commitment_type === 'installment' && formData.total_amount && formData.amount > 0 && (
                  <p className="text-xs text-text-muted mt-2 text-center">
                     سيتم الانتهاء من السداد بعد حوالي <strong className="text-text-primary">{Math.ceil(formData.total_amount / formData.amount)}</strong> شهر.
                  </p>
               )}
            </div>

            {/* Category & Due Day Grid */}
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">{t('add_commitment.category_label')}</label>
                  <select 
                     name="category_id" 
                     value={formData.category_id} 
                     onChange={handleChange}
                     className="w-full bg-bg-secondary border border-border-primary rounded-xl p-4 text-text-primary focus:border-accent-primary transition-colors outline-none appearance-none"
                  >
                     {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name_ar}</option>
                     ))}
                  </select>
               </div>
               
               <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">{t('add_commitment.due_day_label')}</label>
                  <input 
                     required
                     type="number" 
                     name="due_day"
                     min="1"
                     max="31"
                     value={formData.due_day || ''}
                     onChange={handleChange}
                     className="w-full bg-bg-secondary border border-border-primary rounded-xl p-4 text-text-primary focus:border-accent-primary transition-colors outline-none text-center font-bold"
                  />
               </div>
            </div>

            {/* Recurring Type */}
            <div className="space-y-2">
               <label className="text-sm font-medium text-text-secondary">{t('add_commitment.recurring_label')}</label>
               <div className="flex bg-bg-secondary p-1 rounded-xl border border-border-primary">
                  {['monthly', 'yearly'].map((type) => (
                     <button
                        key={type}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, recurring_type: type as RecurringType }))}
                        className={`flex-1 py-3 text-sm font-bold rounded-lg transition-colors ${formData.recurring_type === type ? 'bg-bg-tertiary text-white shadow-sm' : 'text-text-muted'}`}
                     >
                        {type === 'monthly' ? t('add_commitment.recurring_monthly') : t('add_commitment.recurring_yearly')}
                     </button>
                  ))}
               </div>
            </div>

            {/* Reminders */}
            <div className="bg-bg-secondary border border-border-primary rounded-xl p-4 flex items-center justify-between">
               <div>
                  <h4 className="font-medium">تفعيل الإشعارات</h4>
                  <p className="text-xs text-text-muted mt-1">تذكير قبل موعد الاستحقاق</p>
               </div>
               <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                     type="checkbox" 
                     name="reminder_enabled"
                     checked={formData.reminder_enabled}
                     onChange={handleChange}
                     className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-bg-tertiary rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-primary"></div>
               </label>
            </div>

         </form>
      </div>

      {/* Footer / Submit */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-bg-primary/80 backdrop-blur-md border-t border-border-primary z-10">
         <motion.button
            whileTap={{ scale: 0.95 }}
            type="submit"
            form="add-commitment-form"
            disabled={isSubmitting}
            className="w-full bg-gradient-primary text-white py-4 rounded-xl font-bold shadow-glow-green flex items-center justify-center space-x-2 space-x-reverse disabled:opacity-50"
         >
            <Save size={20} />
            <span>{isSubmitting ? 'جاري الحفظ...' : 'حفظ الالتزام'}</span>
         </motion.button>
      </div>
    </div>
  );
}
