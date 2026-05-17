import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, List, CalendarDays, PieChart, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function BottomNav() {
  const location = useLocation();
  const { t } = useTranslation();

  const navItems = [
    { path: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { path: '/commitments', label: t('nav.commitments'), icon: List },
    { path: '/calendar', label: t('nav.calendar'), icon: CalendarDays },
    { path: '/reports', label: 'التقارير', icon: PieChart },
    { path: '/settings', label: t('nav.settings'), icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 safe-area-bottom pb-2">
      <div className="mx-4 mb-2 h-[72px] bg-bg-glass backdrop-blur-xl border border-border-secondary rounded-[24px] shadow-lg flex items-center justify-around px-2 relative overflow-hidden">
        
        {/* Subtle top glow line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-border-active to-transparent opacity-50" />

        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center justify-center w-full h-full text-text-muted transition-colors duration-300"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-active"
                  className="absolute inset-0 bg-white/5 rounded-2xl m-2"
                  initial={false}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              
              <div className="relative z-10 flex flex-col items-center">
                <Icon 
                  size={24} 
                  strokeWidth={isActive ? 2.5 : 2}
                  className={`mb-1 transition-all duration-300 ${isActive ? 'text-accent-primary scale-110 drop-shadow-md' : 'scale-100'}`} 
                />
                <span className={`text-[10px] font-medium transition-all duration-300 ${isActive ? 'text-accent-primary' : ''}`}>
                  {item.label}
                </span>
                
                {/* Active indicator dot */}
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-dot"
                    className="absolute -bottom-4 w-1 h-1 rounded-full bg-accent-primary shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                    initial={false}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </div>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
