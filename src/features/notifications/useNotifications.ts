import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { useSettingsStore } from '../../store/useSettingsStore';

export function useNotifications() {
  const { settings } = useSettingsStore();

  const requestPermissions = async () => {
    if (!Capacitor.isNativePlatform()) return false;
    
    let permStatus = await LocalNotifications.checkPermissions();
    
    if (permStatus.display === 'prompt') {
      permStatus = await LocalNotifications.requestPermissions();
    }
    
    return permStatus.display === 'granted';
  };

  const scheduleReminder = async (commitmentId: number, title: string, body: string, dueDay: number) => {
    if (!Capacitor.isNativePlatform() || !settings.notifications_enabled) return;

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    // Calculate next due date
    const now = new Date();
    let nextDue = new Date(now.getFullYear(), now.getMonth(), dueDay, 10, 0, 0); // 10:00 AM
    
    // If due day has passed this month, schedule for next month
    if (now.getDate() > dueDay) {
       nextDue.setMonth(nextDue.getMonth() + 1);
    }

    // Schedule 1 day before
    const reminderDate = new Date(nextDue);
    reminderDate.setDate(reminderDate.getDate() - 1);

    // If reminder date is in the past (e.g. added it today, due tomorrow), schedule for immediately + 5 mins
    if (reminderDate < now) {
       reminderDate.setTime(now.getTime() + 5 * 60 * 1000); // 5 mins from now
    }

    await LocalNotifications.schedule({
      notifications: [
        {
          id: commitmentId,
          title: title,
          body: body,
          schedule: { at: reminderDate },
          smallIcon: "ic_stat_icon",
          autoCancel: true,
        }
      ]
    });
  };

  const cancelReminder = async (commitmentId: number) => {
    if (!Capacitor.isNativePlatform()) return;
    await LocalNotifications.cancel({ notifications: [{ id: commitmentId }] });
  };

  return {
    requestPermissions,
    scheduleReminder,
    cancelReminder
  };
}
