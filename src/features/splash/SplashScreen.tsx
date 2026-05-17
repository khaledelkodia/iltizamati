import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  useEffect(() => {
    // Artificial delay to ensure animations finish
    const timer = setTimeout(() => {
      onComplete();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-bg-primary flex flex-col items-center justify-center z-[100] overflow-hidden">
      {/* Background Glows */}
      <motion.div 
         initial={{ opacity: 0, scale: 0.5 }}
         animate={{ opacity: 0.15, scale: 1 }}
         transition={{ duration: 2, ease: "easeOut" }}
         className="absolute w-[80vw] h-[80vw] rounded-full bg-accent-primary blur-[80px]"
      />
      <motion.div 
         initial={{ opacity: 0, scale: 0.5, y: 100 }}
         animate={{ opacity: 0.1, scale: 1, y: 0 }}
         transition={{ duration: 2, delay: 0.2, ease: "easeOut" }}
         className="absolute bottom-[-20%] w-[100vw] h-[100vw] rounded-full bg-accent-secondary blur-[100px]"
      />

      {/* Logo Container */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
           type: 'spring', 
           stiffness: 260, 
           damping: 20, 
           duration: 1 
        }}
        className="relative z-10 flex flex-col items-center"
      >
        <div className="w-24 h-24 bg-gradient-primary rounded-3xl shadow-glow-green flex items-center justify-center mb-6 relative">
           <div className="absolute inset-0 bg-white/20 rounded-3xl backdrop-blur-sm mix-blend-overlay"></div>
           {/* Abstract logo mark */}
           <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
              <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
              <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
           </svg>
        </div>

        <motion.h1 
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.5, duration: 0.8 }}
           className="text-4xl font-extrabold text-white tracking-tight"
        >
          التزاماتي
        </motion.h1>
        
        <motion.p
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 0.8, duration: 0.8 }}
           className="text-text-muted mt-2 font-medium"
        >
           إدارة مالية ذكية ومريحة
        </motion.p>
      </motion.div>

      {/* Loading indicator */}
      <motion.div 
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         transition={{ delay: 1.2 }}
         className="absolute bottom-16 left-0 right-0 flex justify-center"
      >
         <div className="flex space-x-2 space-x-reverse">
            <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity, delay: 0 }} className="w-2 h-2 rounded-full bg-accent-primary" />
            <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} className="w-2 h-2 rounded-full bg-accent-primary" />
            <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} className="w-2 h-2 rounded-full bg-accent-primary" />
         </div>
      </motion.div>
    </div>
  );
}
