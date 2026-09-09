import { Platform } from "react-native";
import { isRunningInExpoGo } from "expo";

/**
 * Da Expo SDK 53 in poi, Expo Go su Android non supporta più nessuna funzionalità di
 * expo-notifications (nemmeno le notifiche locali): il solo caricamento del modulo lancia
 * un errore fatale. In una build reale (`expo run:android`, `eas build`, o un development
 * build) questa limitazione non c'è.
 *
 * Per evitare che l'app crashi all'avvio dentro Expo Go su Android, non importiamo
 * `expo-notifications` in modo statico: lo carichiamo pigramente con `require`, e solo se
 * non siamo nel caso limitato. Se siamo in quel caso, il promemoria è semplicemente
 * disabilitato (nessun crash, l'app funziona normalmente per il resto).
 */
const PUSH_UNSUPPORTED = isRunningInExpoGo() && Platform.OS === "android";

// eslint-disable-next-line @typescript-eslint/no-var-requires
type NotificationsModule = typeof import("expo-notifications");

let cachedModule: NotificationsModule | null = null;
let warned = false;

function getNotifications(): NotificationsModule | null {
  if (PUSH_UNSUPPORTED) {
    if (!warned) {
      console.warn(
        "[La Mia Palestra] Il promemoria \"allenamento in corso\" è disabilitato: Expo Go su Android non supporta più expo-notifications da SDK 53. Funzionerà in una build reale dell'app."
      );
      warned = true;
    }
    return null;
  }
  if (!cachedModule) {
    // require (non import) per evitare che il modulo venga valutato quando PUSH_UNSUPPORTED è true
    cachedModule = require("expo-notifications") as NotificationsModule;
    cachedModule.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }
  return cachedModule;
}

/** true se i promemoria push non sono disponibili in questo ambiente (Expo Go su Android). */
export function isWorkoutReminderAvailable(): boolean {
  return !PUSH_UNSUPPORTED;
}

export async function ensureNotificationPermission(): Promise<boolean> {
  const Notifications = getNotifications();
  if (!Notifications) return false;
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
  const Notifications = getNotifications();
  if (!Notifications) return;

  const granted = await ensureNotificationPermission();
  if (!granted) return;

  await cancelWorkoutReminder();

  await Notifications.scheduleNotificationAsync({
    identifier: WORKOUT_REMINDER_ID,
    content: {
      title: "Allenamento in corso 💪",
      body: `Il cronometro è ancora attivo (${elapsedLabel}). Torna nell'app per continuare o terminare.`,
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 2, repeats: false },
  });
}

export async function cancelWorkoutReminder() {
  const Notifications = getNotifications();
  if (!Notifications) return;
  await Notifications.cancelScheduledNotificationAsync(WORKOUT_REMINDER_ID).catch(() => {});
  await Notifications.dismissNotificationAsync(WORKOUT_REMINDER_ID).catch(() => {});
}
