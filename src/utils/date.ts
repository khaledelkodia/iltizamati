// ========================================
// Utility — Date helpers
// ========================================

import { format, isToday, isTomorrow, isPast, addDays, differenceInDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';

const AR_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

const AR_DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export function getArabicMonth(month: number): string {
  return AR_MONTHS[month];
}

export function getArabicDay(day: number): string {
  return AR_DAYS[day];
}

export function formatDateArabic(date: Date): string {
  return `${date.getDate()} ${AR_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function getDueDateForMonth(dueDay: number, year?: number, month?: number): Date {
  const now = new Date();
  const y = year ?? now.getFullYear();
  const m = month ?? now.getMonth();
  const lastDay = new Date(y, m + 1, 0).getDate();
  const day = Math.min(dueDay, lastDay);
  return new Date(y, m, day);
}

export function getDueDateISO(dueDay: number, year?: number, month?: number): string {
  return getDueDateForMonth(dueDay, year, month).toISOString().split('T')[0];
}

export function getRemainingDays(dueDate: Date | string): number {
  const date = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
  return differenceInDays(date, new Date());
}

export function getRemainingText(dueDate: Date | string): string {
  const date = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
  
  if (isToday(date)) return 'اليوم';
  if (isTomorrow(date)) return 'غداً';
  
  const days = differenceInDays(date, new Date());
  
  if (days < 0) {
    const absDays = Math.abs(days);
    if (absDays === 1) return 'متأخر يوم';
    if (absDays === 2) return 'متأخر يومين';
    if (absDays <= 10) return `متأخر ${absDays} أيام`;
    return `متأخر ${absDays} يوم`;
  }
  
  if (days === 1) return 'بعد يوم';
  if (days === 2) return 'بعد يومين';
  if (days <= 10) return `بعد ${days} أيام`;
  return `بعد ${days} يوم`;
}

export function getPaymentStatus(dueDate: Date | string, isPaid: boolean): 'paid' | 'overdue' | 'due_today' | 'upcoming' {
  if (isPaid) return 'paid';
  const date = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
  if (isToday(date)) return 'due_today';
  if (isPast(date)) return 'overdue';
  return 'upcoming';
}

export function getMonthDays(year: number, month: number): Date[] {
  const start = startOfMonth(new Date(year, month));
  const end = endOfMonth(new Date(year, month));
  return eachDayOfInterval({ start, end });
}

export function isSameDayCheck(date1: Date, date2: Date): boolean {
  return isSameDay(date1, date2);
}

export function getCurrentMonthYear(): { month: number; year: number } {
  const now = new Date();
  return { month: now.getMonth(), year: now.getFullYear() };
}

export function toArabicNumerals(num: number | string): string {
  const arabicNums = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(num).replace(/[0-9]/g, (d) => arabicNums[parseInt(d)]);
}

export { format, isToday, isTomorrow, isPast, addDays, differenceInDays, parseISO, startOfMonth, endOfMonth };
