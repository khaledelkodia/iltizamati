import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

interface CardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'gradient';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export default function Card({ 
  children, 
  className = '', 
  variant = 'default',
  padding = 'md',
  ...props 
}: CardProps) {
  
  const baseStyle = "relative overflow-hidden rounded-[20px]";
  
  const variants = {
    default: "bg-bg-secondary shadow-card border border-border-primary",
    glass: "bg-bg-glass backdrop-blur-md shadow-card border border-border-secondary",
    gradient: "bg-gradient-card shadow-card border border-border-primary",
  };

  const paddings = {
    none: "",
    sm: "p-3",
    md: "p-5",
    lg: "p-6",
  };

  return (
    <motion.div 
      className={`${baseStyle} ${variants[variant]} ${paddings[padding]} ${className}`}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {/* Subtle shine effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none z-20" />
      
      {children}
    </motion.div>
  );
}
