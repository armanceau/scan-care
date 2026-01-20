import { LoginScreen } from "./src/screens/LoginScreen";
import type { User } from "firebase/auth";
import { useEffect, useState } from "react";

import {
  watchAuthState,
} from "./src/services/auth";

type AuthMode = "signin" | "signup";
import ReminderList from './src/screens/ReminderList';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = watchAuthState((authUser) => {
      setUser(authUser);
      handleAuthStateChange(authUser);
    });
    return unsubscribe;
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

  return (
    <>
      {user ? (
        <View style={styles.container}>
          <ReminderList />
          <Pressable
            style={styles.button}
            onPress={handleSignOut}
            disabled={submitting}
          >
            <Text style={styles.buttonText}>
              {submitting ? "Déconnexion..." : "Se déconnecter"}
            </Text>
          </Pressable>
        </View>
      ) : (
        <LoginScreen
          onAuthStateChange={handleAuthStateChange}
          onSignOut={() => console.log("Utilisateur déconnecté")}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "#000",
    borderRadius: 8,
    alignItems: "center",
    margin: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
