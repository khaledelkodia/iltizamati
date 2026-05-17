// ========================================
// Database — Seed default categories
// ========================================


interface DB {
  insert(table: string, data: Record<string, unknown>): Promise<number>;
}

const DEFAULT_CATEGORIES = [
  { name: 'Bills', name_ar: 'فواتير', icon: 'receipt', color: '#3B82F6', sort_order: 1 },
  { name: 'Installments', name_ar: 'أقساط', icon: 'credit-card', color: '#8B5CF6', sort_order: 2 },
  { name: 'Rent', name_ar: 'إيجار', icon: 'home', color: '#F59E0B', sort_order: 3 },
  { name: 'Subscriptions', name_ar: 'اشتراكات', icon: 'tv', color: '#EC4899', sort_order: 4 },
  { name: 'Association', name_ar: 'جمعية', icon: 'users', color: '#10B981', sort_order: 5 },
  { name: 'Insurance', name_ar: 'تأمين', icon: 'shield', color: '#6366F1', sort_order: 6 },
  { name: 'Internet', name_ar: 'إنترنت', icon: 'wifi', color: '#06B6D4', sort_order: 7 },
  { name: 'Electricity', name_ar: 'كهرباء', icon: 'zap', color: '#EAB308', sort_order: 8 },
  { name: 'Water', name_ar: 'مياه', icon: 'droplets', color: '#0EA5E9', sort_order: 9 },
  { name: 'Other', name_ar: 'أخرى', icon: 'more-horizontal', color: '#64748B', sort_order: 10 },
];

export async function seedCategories(db: DB): Promise<void> {
  for (const cat of DEFAULT_CATEGORIES) {
    await db.insert('categories', cat);
  }
  console.log('✅ Categories seeded');
}
