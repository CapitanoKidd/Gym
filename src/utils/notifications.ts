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
    if (Platform.OS === "android") {
      // Su Android 8+ una notifica senza canale (o con importanza bassa) può essere
      // ritardata o del tutto soppressa dal sistema/dal produttore del telefono: questo è
      // il motivo più comune per cui il promemoria "allenamento in corso" a volte non
      // arrivava. Un canale con importanza HIGH garantisce la consegna come heads-up.
      cachedModule.setNotificationChannelAsync(WORKOUT_REMINDER_CHANNEL, {
        name: "Allenamento in corso",
        importance: cachedModule.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
      }).catch(() => {});
    }
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
const REST_END_REMINDER_ID = "workout-rest-end-reminder";
const WORKOUT_REMINDER_CHANNEL = "workout-reminders";

/**
 * Programma una notifica locale che ricorda che l'allenamento è ancora in corso.
 * Va chiamata quando l'app passa in background durante la fase "esercizio" (fuori dal
 * riposo, dove invece si usa scheduleRestEndReminder qui sotto).
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
      ...(Platform.OS === "android" ? { channelId: WORKOUT_REMINDER_CHANNEL } : {}),
    },
    // trigger: null = mostra la notifica subito, invece di pianificarla tra qualche secondo.
    // Un trigger "a tempo" dipende dal processo JS che resta vivo abbastanza a lungo per
    // essere programmato: l'app può però essere sospesa dal sistema pochissimo dopo essere
    // andata in background, facendo perdere la notifica in modo intermittente.
    trigger: null,
  });
}

/**
 * Programma una notifica locale per il momento esatto in cui finisce il riposo tra le
 * serie, così il timer "continua" anche se l'app va in background: non è JS a contare i
 * secondi (si fermerebbe), ma il sistema operativo, che alla scadenza mostra la notifica
 * (con vibrazione, dal canale ad importanza alta). Va chiamata quando l'app passa in
 * background mentre la fase corrente è "riposo".
 */
export async function scheduleRestEndReminder(remainingSeconds: number) {
  const Notifications = getNotifications();
  if (!Notifications) return;
  if (remainingSeconds <= 0) return;

  const granted = await ensureNotificationPermission();
  if (!granted) return;

  await cancelWorkoutReminder();

  await Notifications.scheduleNotificationAsync({
    identifier: REST_END_REMINDER_ID,
    content: {
      title: "Recupero terminato ⏱️",
      body: "Il riposo è finito: torna nell'app per la prossima serie!",
      ...(Platform.OS === "android" ? { channelId: WORKOUT_REMINDER_CHANNEL } : {}),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.max(1, Math.round(remainingSeconds)),
      repeats: false,
    },
  });
}

export async function cancelWorkoutReminder() {
  const Notifications = getNotifications();
  if (!Notifications) return;
  await Notifications.cancelScheduledNotificationAsync(WORKOUT_REMINDER_ID).catch(() => {});
  await Notifications.cancelScheduledNotificationAsync(REST_END_REMINDER_ID).catch(() => {});
  await Notifications.dismissNotificationAsync(WORKOUT_REMINDER_ID).catch(() => {});
  await Notifications.dismissNotificationAsync(REST_END_REMINDER_ID).catch(() => {});
}
