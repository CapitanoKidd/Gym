import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function ensureNotificationPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

const WORKOUT_REMINDER_ID = "workout-in-progress-reminder";

/**
 * Programma una notifica locale che ricorda che l'allenamento è ancora in corso.
 * Va chiamata quando l'app passa in background mentre una sessione è attiva.
 */
export async function scheduleWorkoutReminder(elapsedLabel: string) {
  const granted = await ensureNotificationPermission();
  if (!granted) return;

  await cancelWorkoutReminder();

  await Notifications.scheduleNotificationAsync({
    identifier: WORKOUT_REMINDER_ID,
    content: {
      title: "Allenamento in corso 💪",
      body: `Il cronometro è ancora attivo (${elapsedLabel}). Torna nell'app per continuare o terminare.`,
      sound: Platform.OS === "ios" ? undefined : undefined,
    },
    trigger: { seconds: 2, repeats: false },
  });
}

export async function cancelWorkoutReminder() {
  await Notifications.cancelScheduledNotificationAsync(WORKOUT_REMINDER_ID).catch(() => {});
  await Notifications.dismissNotificationAsync(WORKOUT_REMINDER_ID).catch(() => {});
}
