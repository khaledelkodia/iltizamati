// ========================================
// Types — Settings
// ========================================

export type ThemeMode = 'dark' | 'light';
export type CurrencyCode = 'EGP' | 'SAR' | 'AED' | 'KWD' | 'USD';

export interface AppSettings {
  theme: ThemeMode;
  language: 'ar' | 'en';
  currency: CurrencyCode;
  pin_enabled: boolean;
  pin_code: string | null;
  notifications_enabled: boolean;
  reminder_default_days: number;
  onboarding_completed: boolean;
  first_launch: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  language: 'ar',
  currency: 'EGP',
  pin_enabled: false,
  pin_code: null,
  notifications_enabled: true,
  reminder_default_days: 1,
  onboarding_completed: false,
  first_launch: true,
};

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  EGP: 'ج.م',
  SAR: 'ر.س',
  AED: 'د.إ',
  KWD: 'د.ك',
  USD: '$',
};

export const CURRENCY_NAMES: Record<CurrencyCode, string> = {
  EGP: 'جنيه مصري',
  SAR: 'ريال سعودي',
  AED: 'درهم إماراتي',
  KWD: 'دينار كويتي',
  USD: 'دولار أمريكي',
};
