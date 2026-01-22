import { NavigationContainer } from "@react-navigation/native";
import type { User } from "firebase/auth";
import { useEffect, useState, useRef } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import * as Notifications from "expo-notifications";

import { RootNavigator } from "./src/navigation/RootNavigator";
import { watchAuthState } from "./src/services/auth";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    const unsubscribe = watchAuthState((authUser) => {
      setUser(authUser);
      setLoading(false);
      handleAuthStateChange(authUser);
    });

    return unsubscribe;
  }, []);

  // Configurer les listeners de notifications
  useEffect(() => {
    // Listener pour les notifications reçues quand l'app est ouverte
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("🔔 Notification reçue:", notification);
      });

    // Listener pour quand l'utilisateur tape sur une notification
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("👆 Notification tapée:", response);
        const data = response.notification.request.content.data;
        console.log("Données:", data);
        // Ici tu peux naviguer vers un écran spécifique si besoin
      });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  const handleAuthStateChange = (user: User | null) => {
    if (user) {
      console.log("✅ Utilisateur connecté:", user.email);
    } else {
      console.log("❌ Utilisateur déconnecté");
    }
  };

  const handleSignOut = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const { signOutUser } = await import("./src/services/auth");
      await signOutUser();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootNavigator
        user={user}
        submitting={submitting}
        onSignOut={handleSignOut}
        onAuthStateChange={handleAuthStateChange}
      />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "#fff",
  },
  loadingText: {
    color: "#64748b",
    fontWeight: "600",
  },
  headerAction: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#000",
    borderRadius: 8,
  },
  headerActionText: {
    color: "#fff",
    fontWeight: "600",
  },
});
