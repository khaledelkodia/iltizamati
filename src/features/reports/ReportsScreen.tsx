import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, TrendingDown, DollarSign, ArrowUpRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../../store/useSettingsStore';
import { formatCurrency } from '../../utils/currency';
import { useReportsData } from './useReportsData';
import Card from '../../components/ui/Card';

export default function ReportsScreen() {
  const { t } = useTranslation();
  const { settings } = useSettingsStore();
  const { totalOutstandingDebt, monthlyBurden, categoryBreakdown, isLoading } = useReportsData();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center pt-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary"></div>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 mb-6"
      >
        <h1 className="text-2xl font-bold text-text-primary">التقارير المالية</h1>
        <p className="text-text-muted text-sm mt-1">نظرة تحليلية شاملة لجميع التزاماتك</p>
      </motion.div>

      <div className="space-y-4">
         {/* Total Debt Card */}
         <Card variant="gradient" className="p-6">
            <div className="flex items-center space-x-3 rtl:space-x-reverse ltr:space-x mb-2">
               <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <TrendingDown className="text-white" size={20} />
               </div>
               <p className="text-white/80 font-medium text-sm">إجمالي الديون المتبقية</p>
            </div>
            <h2 className="text-4xl font-extrabold text-white mt-2">
               {formatCurrency(totalOutstandingDebt, settings.currency)}
            </h2>
            <p className="text-white/60 text-xs mt-2">مجموع كافة الأقساط والديون غير المسددة</p>
         </Card>

         {/* Monthly Burden */}
         <Card variant="glass" className="p-5 flex justify-between items-center">
            <div className="flex items-center space-x-3 rtl:space-x-reverse ltr:space-x">
               <div className="w-10 h-10 rounded-full bg-accent-warning/10 flex items-center justify-center">
                  <DollarSign className="text-accent-warning" size={20} />
               </div>
               <div>
                  <p className="text-text-muted text-xs">العبء الشهري الثابت</p>
                  <p className="font-bold text-text-primary text-lg mt-0.5">
                     {formatCurrency(monthlyBurden, settings.currency)}
                  </p>
               </div>
            </div>
         </Card>

         {/* Category Breakdown */}
         <div className="mt-8">
            <h3 className="font-bold text-lg mb-4 flex items-center space-x-2 rtl:space-x-reverse ltr:space-x">
               <PieChart size={20} className="text-accent-primary" />
               <span>توزيع المصروفات الشهرية</span>
            </h3>

            {categoryBreakdown.length === 0 ? (
               <div className="text-center py-8 bg-bg-secondary rounded-xl border border-border-primary">
                  <p className="text-text-muted text-sm">لا توجد بيانات كافية لعرض التوزيع</p>
               </div>
            ) : (
               <div className="space-y-4 bg-bg-secondary p-5 rounded-2xl border border-border-primary">
                  {categoryBreakdown.map((item, index) => (
                     <div key={item.category_id}>
                        <div className="flex justify-between items-end mb-2">
                           <div>
                              <p className="font-bold text-text-primary text-sm">{item.category_name}</p>
                              <p className="text-xs text-text-muted mt-0.5">{formatCurrency(item.amount, settings.currency)}</p>
                           </div>
                           <p className="font-bold text-sm" style={{ color: item.color }}>{item.percentage}%</p>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full bg-border-primary rounded-full h-2.5 overflow-hidden">
                           <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${item.percentage}%` }}
                              transition={{ duration: 1, delay: index * 0.1 }}
                              className="h-full rounded-full" 
                              style={{ backgroundColor: item.color }}
                           />
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </div>
      </div>
    </div>
  );
}
