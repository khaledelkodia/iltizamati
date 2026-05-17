// ========================================
// Store — Settings
// ========================================

import { create } from 'zustand';
import { settingsRepo } from '../database/repositories/settingsRepo';
import { type AppSettings, DEFAULT_SETTINGS } from '../types/settings';
import i18n from '../i18n';

interface SettingsState {
  settings: AppSettings;
  isLoading: boolean;
  error: string | null;

  loadSettings: () => Promise<void>;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => Promise<void>;
  updateMultipleSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  isLoading: true,
  error: null,

  loadSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const settings = await settingsRepo.getAllSettings();
      set({ settings, isLoading: false });
      
      // Apply theme and language
      document.documentElement.setAttribute('data-theme', settings.theme);
      document.documentElement.setAttribute('dir', settings.language === 'ar' ? 'rtl' : 'ltr');
      document.documentElement.setAttribute('lang', settings.language);
      i18n.changeLanguage(settings.language);
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  updateSetting: async (key, value) => {
    try {
      await settingsRepo.set(key, value);
      const newSettings = { ...get().settings, [key]: value };
      set({ settings: newSettings });
      
      if (key === 'theme') {
         document.documentElement.setAttribute('data-theme', value as string);
      } else if (key === 'language') {
         document.documentElement.setAttribute('dir', value === 'ar' ? 'rtl' : 'ltr');
         document.documentElement.setAttribute('lang', value as string);
         i18n.changeLanguage(value as string);
      }
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  updateMultipleSettings: async (newSettings) => {
     try {
      await settingsRepo.setMultiple(newSettings);
      const updated = { ...get().settings, ...newSettings };
      set({ settings: updated });
      
      if (newSettings.theme) {
         document.documentElement.setAttribute('data-theme', newSettings.theme);
      }
      if (newSettings.language) {
         document.documentElement.setAttribute('dir', newSettings.language === 'ar' ? 'rtl' : 'ltr');
         document.documentElement.setAttribute('lang', newSettings.language);
         i18n.changeLanguage(newSettings.language);
      }
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  }
}));
