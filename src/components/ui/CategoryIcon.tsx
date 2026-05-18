import React from 'react';
import { 
  Receipt, 
  CreditCard, 
  Home, 
  Tv, 
  Users, 
  Shield, 
  Wifi, 
  Zap, 
  Droplet, 
  MoreHorizontal 
} from 'lucide-react';

interface CategoryIconProps {
  iconName: string;
  size?: number;
  className?: string;
}

export default function CategoryIcon({ iconName, size = 20, className = '' }: CategoryIconProps) {
  switch (iconName) {
    case 'receipt':
      return <Receipt size={size} className={className} />;
    case 'credit-card':
      return <CreditCard size={size} className={className} />;
    case 'home':
      return <Home size={size} className={className} />;
    case 'tv':
      return <Tv size={size} className={className} />;
    case 'users':
      return <Users size={size} className={className} />;
    case 'shield':
      return <Shield size={size} className={className} />;
    case 'wifi':
      return <Wifi size={size} className={className} />;
    case 'zap':
      return <Zap size={size} className={className} />;
    case 'droplets':
      return <Droplet size={size} className={className} />;
    default:
      return <MoreHorizontal size={size} className={className} />;
  }
}
