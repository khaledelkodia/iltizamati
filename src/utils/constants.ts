// ========================================
// Constants
// ========================================

export const APP_NAME = 'التزاماتي الشهرية';
export const APP_ID = 'com.iltizamati.app';
export const DB_NAME = 'iltizamati_db';
export const DB_VERSION = 1;

export const RECURRING_TYPES = [
  { value: 'monthly', label: 'شهري' },
  { value: 'weekly', label: 'أسبوعي' },
  { value: 'yearly', label: 'سنوي' },
  { value: 'custom', label: 'مخصص' },
] as const;

export const STATUS_COLORS = {
  paid: { bg: 'rgba(16, 185, 129, 0.12)', text: '#10B981', border: 'rgba(16, 185, 129, 0.25)' },
  upcoming: { bg: 'rgba(59, 130, 246, 0.12)', text: '#3B82F6', border: 'rgba(59, 130, 246, 0.25)' },
  overdue: { bg: 'rgba(239, 68, 68, 0.12)', text: '#EF4444', border: 'rgba(239, 68, 68, 0.25)' },
  due_today: { bg: 'rgba(245, 158, 11, 0.12)', text: '#F59E0B', border: 'rgba(245, 158, 11, 0.25)' },
} as const;

export const STATUS_LABELS = {
  paid: 'مدفوع',
  upcoming: 'قادم',
  overdue: 'متأخر',
  due_today: 'مستحق اليوم',
  pending: 'قيد الانتظار',
} as const;

export const CATEGORY_ICONS: Record<string, string> = {
  receipt: '🧾',
  'credit-card': '💳',
  home: '🏠',
  tv: '📺',
  users: '👥',
  shield: '🛡️',
  wifi: '📶',
  zap: '⚡',
  droplets: '💧',
  'more-horizontal': '📋',
};
