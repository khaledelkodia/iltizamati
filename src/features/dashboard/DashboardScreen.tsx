import React from 'react';
import { useCommitmentStore } from '../../store/useCommitmentStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { formatCurrency } from '../../utils/currency';
import Card from '../../components/ui/Card';
import ProgressCircle from '../../components/ui/ProgressCircle';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, TrendingDown, AlertCircle, ArrowUpRight, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useReportsData } from '../reports/useReportsData';
import CategoryIcon from '../../components/ui/CategoryIcon';

export default function DashboardScreen() {
  const { currentMonthStats, payments, markPaymentAsPaid } = useCommitmentStore();
  const { settings } = useSettingsStore();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { totalOutstandingDebt } = useReportsData();

  const progress = currentMonthStats.totalDue > 0 
    ? Math.round((currentMonthStats.totalPaid / currentMonthStats.totalDue) * 100) 
    : 0;

  const overdueCount = payments.filter(p => p.status === 'overdue').length;
  const pendingOrOverduePayments = payments.filter(p => p.status === 'pending' || p.status === 'overdue');

  return (
    <div className="p-4 safe-area-top space-y-6 pb-36">
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mt-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{t('app.welcome')}</h1>
          <p className="text-text-muted text-sm mt-1">{t('app.dashboard_overview')}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-bg-tertiary flex items-center justify-center border border-border-primary">
           <Wallet className="text-accent-primary" size={20} />
        </div>
      </motion.div>

      {/* Main Progress Widget */}
      <Card variant="gradient" className="flex flex-row items-center justify-between w-full p-6">
        <div className="space-y-4 flex-1 text-start">
          <div>
             <p className="text-text-muted text-sm">{t('dashboard.remaining_to_pay')}</p>
             <h2 className="text-3xl font-bold text-white mt-1 leading-none">
               {formatCurrency(currentMonthStats.remaining, settings.currency)}
             </h2>
          </div>
          <div>
             <p className="text-text-muted text-xs">{t('dashboard.total_commitments')}</p>
             <p className="text-text-primary text-sm font-bold mt-1">
               {formatCurrency(currentMonthStats.totalDue, settings.currency)}
             </p>
          </div>
        </div>
        
        <div className="px-2 flex justify-center items-center">
           <ProgressCircle progress={progress} size={110} strokeWidth={10} color="#10B981" trackColor="rgba(255,255,255,0.1)">
             <div className="flex flex-col items-center justify-center mt-1">
               <span className="text-2xl font-extrabold text-white leading-none">{progress}%</span>
               <span className="text-xs font-bold text-accent-primary mt-1">{t('dashboard.paid_percentage')}</span>
             </div>
           </ProgressCircle>
        </div>
      </Card>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card variant="glass" padding="sm" className="flex items-center space-x-3 rtl:space-x-reverse ltr:space-x">
           <div className="w-10 h-10 rounded-full bg-accent-primary/10 flex items-center justify-center">
             <TrendingUp className="text-accent-primary" size={20} />
           </div>
           <div>
             <p className="text-text-muted text-xs">{t('dashboard.paid_amount')}</p>
             <p className="font-bold text-text-primary mt-1">{formatCurrency(currentMonthStats.totalPaid, settings.currency)}</p>
           </div>
        </Card>

        <Card variant="glass" padding="sm" className="flex items-center space-x-3 rtl:space-x-reverse ltr:space-x">
           <div className="w-10 h-10 rounded-full bg-accent-danger/10 flex items-center justify-center">
             <AlertCircle className="text-accent-danger" size={20} />
           </div>
           <div>
             <p className="text-text-muted text-xs">{t('dashboard.overdue')}</p>
             <p className="font-bold text-accent-danger mt-1">{t('dashboard.commitments_count', { count: overdueCount })}</p>
           </div>
        </Card>
      </div>

      {/* Action Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/commitments/add')}
        className="w-full bg-gradient-primary text-white py-4 rounded-xl font-bold shadow-glow-green flex flex-row items-center justify-center space-x-2 rtl:space-x-reverse ltr:space-x"
      >
         <ArrowUpRight size={22} />
         <span className="text-lg">{t('dashboard.add_new')}</span>
      </motion.button>

      {/* Total Outstanding Debt Widget */}
      <div 
         onClick={() => navigate('/reports')}
         className="mt-6 bg-bg-secondary border border-border-primary rounded-xl p-4 flex items-center justify-between cursor-pointer shadow-sm hover:bg-bg-tertiary transition-colors"
      >
         <div className="flex items-center space-x-3 rtl:space-x-reverse ltr:space-x">
            <div className="w-10 h-10 rounded-full bg-accent-warning/10 flex items-center justify-center">
               <TrendingDown className="text-accent-warning" size={20} />
            </div>
            <div>
               <p className="text-text-muted text-xs font-bold">إجمالي الديون (الأقساط) المتبقية</p>
               <p className="font-extrabold text-text-primary text-lg mt-0.5">
                  {/* We need to fetch it from the hook. I will import it at the top and use it */}
                  {formatCurrency(totalOutstandingDebt, settings.currency)}
               </p>
            </div>
         </div>
      </div>

      {/* Section Title */}
      <div className="flex flex-row justify-between items-center pt-4">
         <h3 className="font-bold text-lg">{t('dashboard.upcoming_this_week')}</h3>
         <button 
           onClick={() => navigate('/commitments')}
           className="text-accent-secondary text-sm font-bold bg-accent-secondary/10 px-3 py-1.5 rounded-lg"
         >
           {t('dashboard.view_all')}
         </button>
      </div>

      {/* Empty State / List for Upcoming */}
      {pendingOrOverduePayments.length === 0 ? (
        <div className="text-center py-8 bg-bg-secondary rounded-xl border border-border-primary">
           <p className="text-text-muted text-sm">{t('dashboard.no_upcoming')}</p>
        </div>
      ) : (
         <div className="space-y-3">
             {pendingOrOverduePayments.slice(0, 5).map(payment => {
                const isOverdue = payment.status === 'overdue';
                return (
                   <motion.div 
                      key={payment.id}
                      whileTap={{ scale: 0.98 }}
                      className="bg-bg-secondary border border-border-primary rounded-2xl p-4 flex justify-between items-center shadow-sm hover:border-border-secondary transition-all"
                   >
                      <div className="flex items-center" style={{ gap: '12px' }}>
                         <div 
                           className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                           style={{ backgroundColor: `${payment.category_color}15`, color: payment.category_color }}
                         >
                            <CategoryIcon iconName={payment.category_icon} size={22} />
                         </div>
                         <div>
                            <p className="font-bold text-text-primary text-sm">{payment.commitment_name}</p>
                            <p className="text-xs text-text-muted mt-1">
                               {isOverdue ? 'متأخر منذ' : 'يستحق في'} {new Date(payment.due_date).getDate()} من الشهر
                            </p>
                         </div>
                      </div>
                      <div className="flex items-center" style={{ gap: '16px' }}>
                         <div className="flex flex-col items-end text-left ltr:text-right">
                            <p className="font-extrabold text-sm text-text-primary">
                               {formatCurrency(payment.commitment_amount, settings.currency)}
                            </p>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border mt-1 inline-block ${
                               isOverdue 
                                 ? 'bg-accent-danger/10 text-accent-danger border-accent-danger/20' 
                                 : 'bg-accent-warning/10 text-accent-warning border-accent-warning/20'
                            }`}>
                               {isOverdue ? 'متأخر' : 'معلق'}
                            </span>
                         </div>
                         <button 
                            onClick={async (e) => {
                               e.stopPropagation();
                               await markPaymentAsPaid(payment.id);
                            }}
                            className="w-9 h-9 rounded-full bg-accent-primary/10 text-accent-primary border border-accent-primary/20 flex items-center justify-center hover:bg-accent-primary hover:text-white transition-colors flex-shrink-0"
                             title="تسجيل كمدفوع"
                          >
                             <CheckCircle size={18} />
                         </button>
                      </div>
                   </motion.div>
                );
             })}
         </div>
      )}

    </div>
  );
}
