import React from 'react';
import { motion } from 'framer-motion';
import { useSettingsStore } from '../../store/useSettingsStore';
import { db } from '../../database/connection';
import { Moon, Sun, Bell, Lock, Download, Database, FileText, ChevronLeft, ChevronRight, Globe } from 'lucide-react';
import type { CurrencyCode } from '../../types/settings';
import { CURRENCY_NAMES } from '../../types/settings';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '../notifications/useNotifications';
import { LocalNotifications } from '@capacitor/local-notifications';

export default function SettingsScreen() {
  const { settings, updateSetting } = useSettingsStore();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  const toggleTheme = () => {
    updateSetting('theme', settings.theme === 'dark' ? 'light' : 'dark');
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSetting('language', e.target.value as 'ar' | 'en');
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSetting('currency', e.target.value as CurrencyCode);
  };

  const handleExportData = async () => {
     try {
        const data = db.exportData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `iltizamati_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
     } catch (err) {
        console.error('Failed to export', err);
     }
  };

  const { requestPermissions } = useNotifications();

  const handleTestNotification = async () => {
    // Check if web browser
    const { Capacitor } = await import('@capacitor/core');
    if (!Capacitor.isNativePlatform()) {
      if (!("Notification" in window)) {
        alert("هذا المتصفح لا يدعم الإشعارات.");
        return;
      }
      
      let permission = Notification.permission;
      if (permission === 'default') {
         permission = await Notification.requestPermission();
      }
      
      if (permission === 'granted') {
         setTimeout(() => {
            new Notification("🔔 تجربة الإشعارات - التزاماتي", {
               body: "هذا إشعار تجريبي لتأكيد عمل التنبيهات بنجاح في المتصفح!",
               icon: "/favicon.ico"
            });
         }, 3000);
         alert('سيظهر إشعار المتصفح التجريبي خلال 3 ثوانٍ!');
      } else {
         alert('يرجى تفعيل صلاحية إشعارات المتصفح لتجربة الميزة.');
      }
      return;
    }

    // Native platform (Android/iOS)
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      alert('لم يتم منح صلاحية الإشعارات. يرجى تفعيلها من إعدادات الهاتف.');
      return;
    }

    await LocalNotifications.schedule({
      notifications: [
        {
          id: 9999,
          title: '🔔 تجربة الإشعارات - التزاماتي',
          body: 'هذا إشعار تجريبي لتأكيد عمل التنبيهات بنجاح! تذكيرك القادم سيكون في الوقت المحدد.',
          schedule: { at: new Date(Date.now() + 3000) },
          smallIcon: 'ic_stat_icon',
          sound: 'default',
          autoCancel: true,
        }
      ]
    });
    alert('سيظهر الإشعار التجريبي على هاتفك خلال 3 ثوانٍ!');
  };

  const SettingRow = ({ icon: Icon, title, subtitle, action }: any) => (
    <div className="flex items-center justify-between p-4 bg-bg-secondary border border-border-primary rounded-xl">
       <div className="flex items-center space-x-3 rtl:space-x-reverse ltr:space-x">
          <div className="w-10 h-10 rounded-full bg-bg-tertiary flex items-center justify-center text-text-muted">
             <Icon size={20} />
          </div>
          <div>
             <h4 className="font-medium text-text-primary text-sm">{title}</h4>
             {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
          </div>
       </div>
       <div>{action}</div>
    </div>
  );

  return (
    <div className="p-4 safe-area-top pb-24">
      <h1 className="text-2xl font-bold text-text-primary mt-4 mb-6">{t('settings.title')}</h1>

      <div className="space-y-6">
         {/* Appearance */}
         <section className="space-y-3">
            <h3 className="text-sm font-bold text-text-muted px-2">{t('settings.appearance')}</h3>
            
            <SettingRow 
               icon={Globe}
               title={t('settings.language')}
               action={
                  <select 
                     value={settings.language}
                     onChange={handleLanguageChange}
                     className="bg-bg-tertiary text-sm font-medium py-1 px-2 rounded-lg border border-border-primary outline-none"
                  >
                     <option value="ar">{t('settings.language_ar')}</option>
                     <option value="en">{t('settings.language_en')}</option>
                  </select>
               }
            />

            <SettingRow 
               icon={settings.theme === 'dark' ? Moon : Sun}
               title={t('settings.dark_mode')}
               subtitle={settings.theme === 'dark' ? t('settings.enabled') : t('settings.disabled')}
               action={
                  <label className="relative inline-flex items-center cursor-pointer">
                     <input type="checkbox" checked={settings.theme === 'dark'} onChange={toggleTheme} className="sr-only peer" />
                     <div className="w-11 h-6 bg-bg-tertiary rounded-full peer peer-checked:after:rtl:translate-x-full peer-checked:after:ltr:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-primary
                     rtl:after:left-[2px] ltr:after:right-[2px]
                     "></div>
                  </label>
               }
            />

            <SettingRow 
               icon={Database}
               title={t('settings.currency')}
               subtitle={CURRENCY_NAMES[settings.currency]}
               action={
                  <select 
                     value={settings.currency}
                     onChange={handleCurrencyChange}
                     className="bg-bg-tertiary text-sm font-medium py-1 px-2 rounded-lg border border-border-primary outline-none"
                  >
                     {Object.entries(CURRENCY_NAMES).map(([code, name]) => (
                        <option key={code} value={code}>{code} - {name}</option>
                     ))}
                  </select>
               }
            />
         </section>

         {/* Notifications & Security */}
         <section className="space-y-3">
            <h3 className="text-sm font-bold text-text-muted px-2">{t('settings.notifications')}</h3>
            
            <SettingRow 
               icon={Bell}
               title={t('settings.reminders')}
               subtitle={t('settings.reminders_desc')}
               action={
                  <label className="relative inline-flex items-center cursor-pointer">
                     <input type="checkbox" checked={settings.notifications_enabled} onChange={(e) => updateSetting('notifications_enabled', e.target.checked)} className="sr-only peer" />
                     <div className="w-11 h-6 bg-bg-tertiary rounded-full peer peer-checked:after:rtl:translate-x-full peer-checked:after:ltr:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-primary
                     rtl:after:left-[2px] ltr:after:right-[2px]
                     "></div>
                  </label>
               }
            />

            <motion.button 
               whileTap={{ scale: 0.98 }} 
               onClick={handleTestNotification} 
               className="w-full text-right"
            >
               <SettingRow 
                  icon={Bell}
                  title="إرسال إشعار تجريبي"
                  subtitle="اختبر ظهور التنبيهات الفورية على هاتفك الآن"
                  action={isRTL ? <ChevronLeft size={20} className="text-accent-primary animate-pulse" /> : <ChevronRight size={20} className="text-accent-primary animate-pulse" />}
               />
            </motion.button>

            <motion.button whileTap={{ scale: 0.98 }} className="w-full text-right">
               <SettingRow 
                  icon={Lock}
                  title={t('settings.pin')}
                  subtitle={t('settings.pin_desc')}
                  action={isRTL ? <ChevronLeft size={20} className="text-text-muted" /> : <ChevronRight size={20} className="text-text-muted" />}
               />
            </motion.button>
         </section>

         {/* Data Management */}
         <section className="space-y-3">
            <h3 className="text-sm font-bold text-text-muted px-2">{t('settings.data')}</h3>
            
            <motion.button whileTap={{ scale: 0.98 }} onClick={handleExportData} className="w-full text-right">
               <SettingRow 
                  icon={Download}
                  title={t('settings.backup')}
                  subtitle={t('settings.backup_desc')}
                  action={isRTL ? <ChevronLeft size={20} className="text-text-muted" /> : <ChevronRight size={20} className="text-text-muted" />}
               />
            </motion.button>

            <motion.button whileTap={{ scale: 0.98 }} className="w-full text-right opacity-50 cursor-not-allowed">
               <SettingRow 
                  icon={FileText}
                  title={t('settings.pdf')}
                  subtitle={t('settings.soon')}
                  action={isRTL ? <ChevronLeft size={20} className="text-text-muted" /> : <ChevronRight size={20} className="text-text-muted" />}
               />
            </motion.button>
         </section>
      </div>
    </div>
  );
}
