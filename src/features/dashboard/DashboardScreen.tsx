import React from 'react';
import { useCommitmentStore } from '../../store/useCommitmentStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { formatCurrency } from '../../utils/currency';
import Card from '../../components/ui/Card';
import ProgressCircle from '../../components/ui/ProgressCircle';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, TrendingDown, AlertCircle, ArrowUpRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useReportsData } from '../reports/useReportsData';

export default function DashboardScreen() {
  const { currentMonthStats, payments } = useCommitmentStore();
  const { settings } = useSettingsStore();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { totalOutstandingDebt } = useReportsData();

  const progress = currentMonthStats.totalDue > 0 
    ? Math.round((currentMonthStats.totalPaid / currentMonthStats.totalDue) * 100) 
    : 0;

  const overdueCount = payments.filter(p => p.status === 'overdue').length;
  const upcomingCount = payments.filter(p => p.status === 'pending').length;

  return (
    <div className="p-4 safe-area-top space-y-6">
      
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

      {/* Empty State for Upcoming */}
      {upcomingCount === 0 ? (
        <div className="text-center py-8 bg-bg-secondary rounded-xl border border-border-primary">
           <p className="text-text-muted text-sm">{t('dashboard.no_upcoming')}</p>
        </div>
      ) : (
         <div className="space-y-3">
            {/* List upcoming here */}
            <p className="text-text-muted text-sm text-center">{t('dashboard.upcoming_count', { count: upcomingCount })}</p>
         </div>
      )}

    </div>
  );
}
