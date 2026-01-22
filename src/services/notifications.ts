import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import type { Medication } from "./mistral";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const DEFAULT_TIMES = {
  matin: { hour: 8, minute: 0 },
  midi: { hour: 12, minute: 0 },
  "après-midi": { hour: 15, minute: 0 },
  "aprés-midi": { hour: 15, minute: 0 }, // variation orthographique --> mistral peut parfois se tromper d'accent (vu sur un test)
  soir: { hour: 19, minute: 0 },
  nuit: { hour: 22, minute: 0 },
  coucher: { hour: 22, minute: 0 },
};

/**
 * Demande les permissions pour les notifications
 */
export async function registerForPushNotifications(): Promise<boolean> {
  try {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("medication-reminders", {
        name: "Rappels de médicaments",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.warn("❌ Permission de notification refusée");
      return false;
    }

    console.log("✅ Permissions de notifications accordées");
    return true;
  } catch (error) {
    console.error("❌ Erreur lors de la demande de permissions:", error);
    return false;
  }
}

function parseFrequency(
  frequency: string,
): Array<{ count: number; moment: string }> {
  const parsed: Array<{ count: number; moment: string }> = [];

  const normalized = frequency.toLowerCase().trim();

  const parts = normalized.split(/,|et/).map((p) => p.trim());

  for (const part of parts) {
    const match = part.match(
      /(\d+)\s*(fois)?\s*(le)?\s*(matin|midi|après-midi|aprés-midi|soir|nuit|coucher)/i,
    );

    if (match) {
      const count = parseInt(match[1], 10);
      const moment = match[4];
      parsed.push({ count, moment });
    }
  }

  if (parsed.length === 0) {
    const timesPerDayMatch = normalized.match(/(\d+)\s*fois\s*par\s*jour/);
    if (timesPerDayMatch) {
      const count = parseInt(timesPerDayMatch[1], 10);
      const moments = ["matin", "midi", "soir", "nuit"];
      for (let i = 0; i < Math.min(count, 4); i++) {
        parsed.push({ count: 1, moment: moments[i] });
      }
    }
  }

  return parsed;
}

function parseDuration(duration: string): number {
  const match = duration.match(/(\d+)\s*jours?/i);
  if (match) {
    return parseInt(match[1], 10);
  }

  return 30;
}

export async function scheduleMedicationNotifications(
  medication: Medication,
  prescriptionId: string,
): Promise<string[]> {
  try {
    const notificationIds: string[] = [];

    const frequencies = parseFrequency(medication.frequency || "");

    if (frequencies.length === 0) {
      console.warn(
        `⚠️ Impossible de parser la fréquence pour ${medication.name}: "${medication.frequency}"`,
      );
      return [];
    }

    const durationDays = parseDuration(medication.duration || "");

    console.log(
      `📅 Planification de ${medication.name} pour ${durationDays} jours:`,
      frequencies,
    );

    for (const freq of frequencies) {
      const timeConfig =
        DEFAULT_TIMES[freq.moment.toLowerCase() as keyof typeof DEFAULT_TIMES];

      if (!timeConfig) {
        console.warn(`⚠️ Moment inconnu: ${freq.moment}`);
        continue;
      }

      const trigger: Notifications.DailyTriggerInput = {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: timeConfig.hour,
        minute: timeConfig.minute,
      };

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `💊 Rappel de médicament`,
          body: `Il est temps de prendre ${medication.name} (${medication.dosage})`,
          data: {
            medicationName: medication.name,
            prescriptionId,
            moment: freq.moment,
          },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger,
      });

      notificationIds.push(notificationId);
      console.log(
        `✅ Notification planifiée pour ${medication.name} à ${timeConfig.hour}h${timeConfig.minute.toString().padStart(2, "0")} (${freq.moment})`,
      );
    }

    return notificationIds;
  } catch (error) {
    console.error(
      `❌ Erreur lors de la planification des notifications pour ${medication.name}:`,
      error,
    );
    return [];
  }
}

export async function schedulePrescriptionNotifications(
  prescriptionId: string,
  medications: Medication[],
): Promise<Map<string, string[]>> {
  const notificationMap = new Map<string, string[]>();

  for (const medication of medications) {
    const ids = await scheduleMedicationNotifications(
      medication,
      prescriptionId,
    );
    if (ids.length > 0) {
      notificationMap.set(medication.name, ids);
    }
  }

  console.log(
    `✅ ${notificationMap.size} médicaments configurés avec des notifications`,
  );
  return notificationMap;
}

export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log("✅ Toutes les notifications ont été annulées");
  } catch (error) {
    console.error("❌ Erreur lors de l'annulation des notifications:", error);
  }
}

export async function cancelNotifications(
  notificationIds: string[],
): Promise<void> {
  try {
    for (const id of notificationIds) {
      await Notifications.cancelScheduledNotificationAsync(id);
    }
    console.log(`✅ ${notificationIds.length} notifications annulées`);
  } catch (error) {
    console.error("❌ Erreur lors de l'annulation des notifications:", error);
  }
}

export async function listScheduledNotifications(): Promise<
  Notifications.NotificationRequest[]
> {
  try {
    const notifications =
      await Notifications.getAllScheduledNotificationsAsync();
    console.log(
      `📋 ${notifications.length} notifications planifiées:`,
      notifications,
    );
    return notifications;
  } catch (error) {
    console.error(
      "❌ Erreur lors de la récupération des notifications:",
      error,
    );
    return [];
  }
}

export async function sendTestNotification(): Promise<string> {
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "🧪 Test de notification",
        body: "Tests notifications",
        data: {
          test: true,
        },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 2,
      },
    });

    console.log("✅ Notification de test planifiée dans 2 secondes");
    return notificationId;
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi de la notification de test:", error);
    throw error;
  }
}
