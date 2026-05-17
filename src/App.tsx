import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { db } from './database/connection';
import { useSettingsStore } from './store/useSettingsStore';
import { useCommitmentStore } from './store/useCommitmentStore';
import AppShell from './components/layout/AppShell';

import DashboardScreen from './features/dashboard/DashboardScreen';
import CommitmentsListScreen from './features/commitments/CommitmentsListScreen';
import AddCommitmentScreen from './features/commitments/AddCommitmentScreen';
import CalendarScreen from './features/calendar/CalendarScreen';
import ReportsScreen from './features/reports/ReportsScreen';
import SettingsScreen from './features/settings/SettingsScreen';
import SplashScreen from './features/splash/SplashScreen';
import OnboardingScreen from './features/onboarding/OnboardingScreen';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const loadSettings = useSettingsStore(state => state.loadSettings);
  const fetchInitialData = useCommitmentStore(state => state.fetchInitialData);
  const { settings } = useSettingsStore();

  useEffect(() => {
    async function initApp() {
      // 1. Init Database
      await db.initialize();
      // 2. Load Settings & Theme
      await loadSettings();
      // 3. Load Data
      await fetchInitialData();
    }
    initApp();
  }, [loadSettings, fetchInitialData]);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  // Routing
  return (
    <BrowserRouter>
      <Routes>
        {/* If first launch, force onboarding */}
        {settings.first_launch && !settings.onboarding_completed && (
          <Route path="*" element={<OnboardingScreen />} />
        )}
        
        <Route path="/" element={<AppShell />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardScreen />} />
          <Route path="commitments" element={<CommitmentsListScreen />} />
          <Route path="calendar" element={<CalendarScreen />} />
          <Route path="reports" element={<ReportsScreen />} />
          <Route path="settings" element={<SettingsScreen />} />
        </Route>
        {/* Full screen routes outside of AppShell */}
        <Route path="/commitments/add" element={<AddCommitmentScreen />} />
      </Routes>
    </BrowserRouter>
  );
}
