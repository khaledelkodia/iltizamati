import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSettingsStore } from '../../store/useSettingsStore';
import { ArrowLeft, Check } from 'lucide-react';

const SLIDES = [
  {
    title: 'مرحباً بك في التزاماتي',
    description: 'تطبيقك الشخصي لإدارة كافة التزاماتك المالية الشهرية بكل سهولة وأمان.',
    icon: (
      <svg className="w-32 h-32 text-accent-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    title: 'خصوصية تامة، بدون إنترنت',
    description: 'جميع بياناتك محفوظة محلياً على جهازك فقط. لا حاجة للاتصال بالإنترنت ولا توجد خوادم خارجية.',
    icon: (
      <svg className="w-32 h-32 text-accent-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    )
  },
  {
    title: 'تنبيهات ذكية',
    description: 'لا تفوت أي موعد دفع. سنقوم بتذكيرك قبل موعد الاستحقاق لتجنب أي غرامات تأخير.',
    icon: (
      <svg className="w-32 h-32 text-accent-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    )
  }
];

export default function OnboardingScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { updateSetting } = useSettingsStore();
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    await updateSetting('onboarding_completed', true);
    await updateSetting('first_launch', false);
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="fixed inset-0 bg-bg-primary flex flex-col z-50">
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
        
        {/* Decorative Background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
           <motion.div 
              key={currentSlide}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-[120vw] h-[120vw] rounded-full blur-[100px]"
              style={{
                 backgroundColor: currentSlide === 0 ? 'var(--accent-primary)' : currentSlide === 1 ? 'var(--accent-secondary)' : 'var(--accent-warning)'
              }}
           />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className="flex flex-col items-center text-center relative z-10"
          >
            <div className="mb-12">
               {SLIDES[currentSlide].icon}
            </div>
            <h2 className="text-3xl font-extrabold text-text-primary mb-4">
              {SLIDES[currentSlide].title}
            </h2>
            <p className="text-text-muted text-lg leading-relaxed max-w-sm">
              {SLIDES[currentSlide].description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Controls */}
      <div className="p-8 safe-area-bottom flex flex-col items-center space-y-8 bg-bg-primary relative z-10">
        
        {/* Pagination Dots */}
        <div className="flex space-x-2 space-x-reverse">
          {SLIDES.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'w-8 bg-accent-primary' : 'w-2 bg-bg-tertiary'
              }`}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="w-full flex items-center justify-between">
           <button 
              onClick={handleComplete}
              className={`text-text-muted font-medium px-4 py-2 transition-opacity ${currentSlide === SLIDES.length - 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
           >
              تخطي
           </button>
           
           <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleNext}
              className="w-16 h-16 rounded-full bg-gradient-primary text-white flex items-center justify-center shadow-glow-green"
           >
              {currentSlide === SLIDES.length - 1 ? (
                 <Check size={28} />
              ) : (
                 <ArrowLeft size={28} />
              )}
           </motion.button>
        </div>
      </div>
    </div>
  );
}
