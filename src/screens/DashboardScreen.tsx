import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import {
  registerForPushNotifications,
  sendTestNotification,
} from "../services/notifications";

type DashboardScreenProps = {
  onOpenReminders?: () => void;
  onOpenScanPrescription?: () => void;
  userEmail?: string;
};

export const DashboardScreen = ({
  onOpenReminders,
  onOpenScanPrescription,
  userEmail,
}: DashboardScreenProps) => {
  const handleTestNotification = async () => {
    try {
      const hasPermission = await registerForPushNotifications();
      if (!hasPermission) {
        Alert.alert(
          "Permission refusée",
          "Activez les notifications dans les paramètres pour tester.",
        );
        return;
      }

      await sendTestNotification();
      Alert.alert(
        "🧪 Test lancé",
        "Tu vas recevoir une notification dans 2 secondes !",
      );
    } catch (error) {
      console.error("Erreur test notification:", error);
      Alert.alert("Erreur", "Impossible d'envoyer la notification de test");
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.hero}>
        <Text style={styles.subtitle}>
          {userEmail
            ? `Connecté en tant que ${userEmail}`
            : "Gérez vos rappels et notifications."}
        </Text>
      </View>

      <View style={styles.cards}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🧪 Test de notifications</Text>
          <Text style={styles.cardText}>
            Notifications push dans 2 secondes.
          </Text>
          <Pressable
            style={[styles.button, styles.testButton]}
            onPress={handleTestNotification}
          >
            <Text style={styles.buttonText}>Envoyer une notif test</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.cards}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ajouter un rappel</Text>
          <Text style={styles.cardText}>
            Une photo, et le rappel est créé automatiquement.
          </Text>
          <Pressable
            style={[styles.button, styles.primaryButton]}
            onPress={onOpenScanPrescription}
          >
            <Text style={styles.buttonText}>Ajouter un rappel</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.cards}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Rappels</Text>
          <Text style={styles.cardText}>
            Consultez, éditez et suivez vos rappels actifs.
          </Text>
          <Pressable
            style={[styles.button, styles.primaryButton]}
            onPress={onOpenReminders}
          >
            <Text style={styles.buttonText}>Ouvrir la liste</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    gap: 16,
  },
  hero: {
    gap: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0f172a",
  },
  subtitle: {
    fontSize: 15,
    color: "#475569",
    fontWeight: "500",
  },
  cards: {
    gap: 12,
  },
  card: {
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  cardText: {
    fontSize: 14,
    color: "#475569",
  },
  button: {
    marginTop: 8,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    backgroundColor: "#2563eb",
  },
  testButton: {
    backgroundColor: "#10B981",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
