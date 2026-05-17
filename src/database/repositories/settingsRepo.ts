// ========================================
// Repository — Settings
// ========================================

import { db } from '../connection';
import { type AppSettings, DEFAULT_SETTINGS } from '../../types/settings';

export const settingsRepo = {
  async getAllSettings(): Promise<AppSettings> {
    const settings: Partial<AppSettings> = {};
    for (const key of Object.keys(DEFAULT_SETTINGS)) {
      const val = await db.getSetting(key);
      if (val !== null) {
        try {
          settings[key as keyof AppSettings] = JSON.parse(val);
        } catch {
          // Fallback if not JSON
          (settings as any)[key] = val;
        }
      } else {
        // Use default if not set
        settings[key as keyof AppSettings] = DEFAULT_SETTINGS[key as keyof AppSettings] as any;
      }
    }
    return settings as AppSettings;
  },

  async get<K extends keyof AppSettings>(key: K): Promise<AppSettings[K]> {
    const val = await db.getSetting(key);
    if (val !== null) {
      try {
        return JSON.parse(val) as AppSettings[K];
      } catch {
        return val as any as AppSettings[K];
      }
    }
    return DEFAULT_SETTINGS[key];
  },

  async set<K extends keyof AppSettings>(key: K, value: AppSettings[K]): Promise<void> {
    const strVal = typeof value === 'string' ? value : JSON.stringify(value);
    await db.setSetting(key, strVal);
  },

  async setMultiple(settings: Partial<AppSettings>): Promise<void> {
    for (const [key, value] of Object.entries(settings)) {
      await this.set(key as keyof AppSettings, value as any);
    }
  }
};
