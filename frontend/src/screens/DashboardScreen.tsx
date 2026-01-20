import { Pressable, StyleSheet, Text, View } from "react-native";

type DashboardScreenProps = {
  onOpenReminders?: () => void;
  userEmail?: string;
};

export const DashboardScreen = ({
  onOpenReminders,
  userEmail,
}: DashboardScreenProps) => {
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
          <Text style={styles.cardTitle}>Ajouter un rappel</Text>
          <Text style={styles.cardText}>
            Une photo, et le rappel est créé automatiquement.
          </Text>
          <Pressable
            style={[styles.button, styles.primaryButton]}
            onPress={onOpenReminders}
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
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
