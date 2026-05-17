// ========================================
// Database — Migrations
// ========================================

export interface Migration {
  version: number;
  tables: string[];
}

export const MIGRATIONS: Migration[] = [
  {
    version: 1,
    tables: ['categories', 'commitments', 'payments', 'reminders', 'settings'],
  },
];
