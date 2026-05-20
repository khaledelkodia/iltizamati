import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, TrendingDown, DollarSign, ArrowUpRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useCommitmentStore } from '../../store/useCommitmentStore';
import { formatCurrency } from '../../utils/currency';
import { useReportsData } from './useReportsData';
import Card from '../../components/ui/Card';
import CategoryIcon from '../../components/ui/CategoryIcon';

export default function ReportsScreen() {
  const { t } = useTranslation();
  const { settings } = useSettingsStore();
  const { currentMonthStats, categories } = useCommitmentStore();
  const { totalOutstandingDebt, monthlyBurden, categoryBreakdown, isLoading } = useReportsData();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center pt-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary"></div>
      </div>
    );
  }

  return (
    <div className="pb-36 px-4 safe-area-top min-h-screen flex flex-col">
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
         {/* Monthly Remaining to Pay */}
         <Card 
            variant="glass" 
            className="p-5 flex justify-between items-center border-l-4 border-accent-primary relative overflow-hidden"
            style={{ 
               background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0.02) 100%)',
               boxShadow: '0 8px 32px 0 rgba(16, 185, 129, 0.05)',
               borderColor: 'rgba(16, 185, 129, 0.15)'
            }}
         >
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
               <div className="w-12 h-12 rounded-2xl bg-accent-primary/20 flex items-center justify-center border border-accent-primary/30 shadow-[0_0_15px_rgba(16,185,129,0.25)]">
                  <DollarSign className="text-accent-primary" size={24} />
               </div>
               <div>
                  <p className="text-text-muted text-xs font-semibold">المتبقي للدفع هذا الشهر</p>
                  <p className="font-extrabold text-accent-primary text-2xl mt-1 tracking-tight">
                     {formatCurrency(currentMonthStats.remaining, settings.currency)}
                  </p>
               </div>
            </div>
         </Card>

         {/* Total Debt Card */}
         <Card 
            className="p-6 relative overflow-hidden border-none"
            style={{ 
               background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%)',
               boxShadow: '0 12px 30px rgba(67, 56, 202, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
               borderRadius: '24px'
            }}
         >
            {/* Ambient gold glow in top right */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center justify-between mb-4 relative z-10">
               <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 shadow-glow-blue">
                     <TrendingDown className="text-accent-secondary-light" size={22} />
                  </div>
                  <div>
                     <p className="text-white/80 font-bold text-sm">إجمالي الديون المتبقية</p>
                     <p className="text-white/50 text-[10px] mt-0.5">كافة الأقساط والديون الآجلة</p>
                  </div>
               </div>
               {/* Chip/Logo graphic for premium feel */}
               <div className="w-8 h-6 bg-amber-400/20 rounded-md border border-amber-400/30 flex items-center justify-center opacity-85">
                  <div className="w-5 h-3 bg-amber-400/30 rounded-sm" />
               </div>
            </div>
            
            <div className="relative z-10">
               <h2 className="text-3xl font-black text-white tracking-tight leading-none">
                  {formatCurrency(totalOutstandingDebt, settings.currency)}
               </h2>
               <div className="mt-4 flex justify-between items-center text-white/60 text-xs">
                  <span>تمت مزامنته محلياً</span>
                  <span className="font-mono text-[9px] tracking-widest text-white/40">ILTIZAMATI GOLD</span>
               </div>
            </div>
         </Card>

         {/* Monthly Burden */}
         <Card 
            variant="glass" 
            className="p-5 flex justify-between items-center border-l-4 border-accent-warning relative overflow-hidden"
            style={{ 
               background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(245, 158, 11, 0.02) 100%)',
               boxShadow: '0 8px 32px 0 rgba(245, 158, 11, 0.05)',
               borderColor: 'rgba(245, 158, 11, 0.15)'
            }}
         >
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
               <div className="w-12 h-12 rounded-2xl bg-accent-warning/20 flex items-center justify-center border border-accent-warning/30 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
                  <DollarSign className="text-accent-warning" size={24} />
               </div>
               <div>
                  <p className="text-text-muted text-xs font-semibold">العبء الشهري الثابت</p>
                  <p className="font-extrabold text-accent-warning text-xl mt-1 tracking-tight">
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
               <div className="space-y-4 bg-bg-secondary p-5 rounded-2xl border border-border-primary shadow-sm">
                  {categoryBreakdown.map((item, index) => {
                     const cat = categories.find(c => c.id === item.category_id);
                     const iconName = cat ? cat.icon : '';
                     return (
                        <div key={item.category_id} className="space-y-2">
                           <div className="flex justify-between items-center">
                              <div className="flex items-center" style={{ gap: '10px' }}>
                                 <div 
                                   className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
                                   style={{ backgroundColor: `${item.color}15`, color: item.color }}
                                 >
                                    {iconName ? <CategoryIcon iconName={iconName} size={16} /> : '📌'}
                                  </div>
                                 <div>
                                    <p className="font-bold text-text-primary text-sm">{item.category_name}</p>
                                    <p className="text-[11px] text-text-muted">{formatCurrency(item.amount, settings.currency)}</p>
                                 </div>
                              </div>
                              <div className="text-left">
                                 <p className="font-extrabold text-sm" style={{ color: item.color }}>{item.percentage}%</p>
                              </div>
                           </div>
                           {/* Progress Bar */}
                           <div className="w-full bg-border-primary rounded-full h-2 overflow-hidden">
                              <motion.div 
                                 initial={{ width: 0 }}
                                 animate={{ width: `${item.percentage}%` }}
                                 transition={{ duration: 1, delay: index * 0.1 }}
                                 className="h-full rounded-full relative" 
                                 style={{ 
                                   backgroundColor: item.color,
                                   boxShadow: `0 0 8px ${item.color}80` 
                                 }}
                              />
                           </div>
                        </div>
                     );
                  })}
               </div>
            )}
         </div>
      </div>
    </div>
  );
}
