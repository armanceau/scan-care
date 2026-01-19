import { StatusBar } from "expo-status-bar";
import type { User } from "firebase/auth";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  signInWithEmail,
  signOutUser,
  signUpWithEmail,
  watchAuthState,
} from "./src/services/auth";

type AuthMode = "signin" | "signup";

export default function App() {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = watchAuthState((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleSubmit = async () => {
    if (!email || !password) {
      setError("Email et mot de passe requis.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (mode === "signin") {
        await signInWithEmail(email.trim(), password);
      } else {
        await signUpWithEmail(email.trim(), password);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    setSubmitting(true);
    setError(null);

    try {
      await signOutUser();
      setEmail("");
      setPassword("");
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
        <ActivityIndicator size="large" />
        <Text style={styles.title}>Chargement...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Scan Care</Text>

        {user ? (
          <>
            <Text style={styles.subtitle}>
              Connecté en tant que {user.email ?? "Utilisateur"}
            </Text>
            <Pressable
              style={[styles.button, styles.danger]}
              onPress={handleSignOut}
              disabled={submitting}
            >
              <Text style={styles.buttonText}>
                {submitting ? "Déconnexion..." : "Se déconnecter"}
              </Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.subtitle}>
              {mode === "signin" ? "Connexion" : "Créer un compte"}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Email"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            <TextInput
              style={styles.input}
              placeholder="Mot de passe"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable
              style={[styles.button, submitting ? styles.buttonDisabled : null]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              <Text style={styles.buttonText}>
                {submitting
                  ? "Patientez..."
                  : mode === "signin"
                  ? "Se connecter"
                  : "Créer le compte"}
              </Text>
            </Pressable>

            <Pressable
              style={styles.linkButton}
              onPress={() =>
                setMode((current) =>
                  current === "signin" ? "signup" : "signin"
                )
              }
            >
              <Text style={styles.linkText}>
                {mode === "signin"
                  ? "Pas de compte ? Inscription"
                  : "Déjà un compte ? Connexion"}
              </Text>
            </Pressable>
          </>
        )}

        <StatusBar style="auto" />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#374151",
    textAlign: "center",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#f9fafb",
  },
  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.8,
  },
  danger: {
    backgroundColor: "#dc2626",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  linkButton: {
    alignItems: "center",
    marginTop: 6,
  },
  linkText: {
    color: "#2563eb",
    fontWeight: "600",
  },
  error: {
    color: "#dc2626",
    textAlign: "center",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
  },
});
