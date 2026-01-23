import { StatusBar } from "expo-status-bar";
import type { User } from "firebase/auth";
import React, { useEffect, useState } from "react";
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
import { FontAwesome } from "@expo/vector-icons";

import {
  signInWithEmail,
  signInWithGoogle,
  signUpWithEmail,
  watchAuthState,
} from "../services/auth";

type AuthMode = "signin" | "signup";

interface LoginScreenProps {
  onSignOut?: () => void;
  onAuthStateChange?: (user: User | null) => void;
}

export const LoginScreen = ({
  onSignOut,
  onAuthStateChange,
}: LoginScreenProps) => {
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
      onAuthStateChange?.(currentUser);
    });

    return unsubscribe;
  }, [onAuthStateChange]);

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
      const { signOutUser } = await import("../services/auth");
      await signOutUser();
      setEmail("");
      setPassword("");
      onSignOut?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setSubmitting(true);
    setError(null);

    try {
      await signInWithGoogle();
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar style="auto" />

      <View style={styles.background} />

      <View style={styles.wrapper}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoIcon}>💊</Text>
            </View>
            <Text style={styles.logo}>Scan Care</Text>
            <Text style={styles.tagline}>
              {user ? "Sécurisé et authentifié" : "Votre assistant de santé"}
            </Text>
          </View>

          {user ? (
            <View style={styles.connectedContainer}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatar}>
                  {(user.email ?? "U")[0].toUpperCase()}
                </Text>
              </View>

              <Text style={styles.connectedEmail}>{user.email}</Text>
              <Text style={styles.connectedText}>Vous êtes connecté</Text>

              <Pressable
                style={[
                  styles.button,
                  styles.buttonPrimary,
                  submitting && styles.buttonDisabled,
                ]}
                onPress={handleSignOut}
                disabled={submitting}
              >
                <Text style={styles.buttonText}>
                  {submitting ? "Déconnexion..." : "Se déconnecter"}
                </Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.formContainer}>
              <View style={styles.modeIndicator}>
                <Text style={styles.modeText}>
                  {mode === "signin" ? "Connexion" : "Inscription"}
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <TextInput
                  style={[styles.input, email && styles.inputFocused]}
                  placeholder="nom@exemple.com"
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  placeholderTextColor="#9ca3af"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (error) setError(null);
                  }}
                  editable={!submitting}
                />

                <TextInput
                  style={[styles.input, password && styles.inputFocused]}
                  placeholder="Mot de passe"
                  secureTextEntry
                  placeholderTextColor="#9ca3af"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (error) setError(null);
                  }}
                  editable={!submitting}
                />
              </View>

              {error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorIcon}>⚠️</Text>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <Pressable
                style={[
                  styles.button,
                  styles.buttonPrimary,
                  submitting && styles.buttonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={submitting}
              >
                <Text style={styles.buttonText}>
                  {submitting
                    ? "Patientez..."
                    : mode === "signin"
                      ? "Se connecter"
                      : "Créer mon compte"}
                </Text>
              </Pressable>

              <View style={styles.divider} />

              <Pressable
                style={[
                  styles.button,
                  styles.buttonSecondary,
                  submitting && styles.buttonDisabled,
                ]}
                onPress={handleGoogle}
                disabled={submitting}
              >
                <FontAwesome name="google" size={18} color="#db4437" />
                <Text style={styles.buttonTextSecondary}>
                  Continuer avec Google
                </Text>
              </Pressable>

              <Pressable
                style={styles.toggleMode}
                onPress={() =>
                  setMode((current) =>
                    current === "signin" ? "signup" : "signin",
                  )
                }
              >
                <Text style={styles.toggleModeText}>
                  {mode === "signin"
                    ? "Pas encore inscrit ?"
                    : "Déjà un compte ?"}
                  <Text style={styles.toggleModeLink}>
                    {mode === "signin" ? " S'inscrire" : " Se connecter"}
                  </Text>
                </Text>
              </Pressable>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2026 Scan Care. Tous droits réservés.
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 300,
    backgroundColor: "#f8fafc",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  wrapper: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "web" ? 12 : 32,
    paddingBottom: 24,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 32,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  header: {
    marginBottom: 32,
    alignItems: "center",
  },
  logo: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  formContainer: {
    gap: 24,
  },
  modeIndicator: {
    alignItems: "center",
    marginBottom: 8,
  },
  modeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2563eb",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  inputGroup: {
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#f8fafc",
    fontSize: 15,
    color: "#0f172a",
    fontWeight: "500",
  },
  inputFocused: {
    borderColor: "#2563eb",
    backgroundColor: "#ffffff",
  },
  button: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  buttonPrimary: {
    backgroundColor: "#2563eb",
  },
  buttonSecondary: {
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 15,
  },
  buttonTextSecondary: {
    color: "#0f172a",
    fontWeight: "600",
    fontSize: 15,
  },
  divider: {
    height: 1,
    backgroundColor: "#e2e8f0",
  },
  toggleMode: {
    alignItems: "center",
    paddingVertical: 12,
  },
  toggleModeText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  toggleModeLink: {
    color: "#2563eb",
    fontWeight: "700",
  },
  errorContainer: {
    backgroundColor: "#fef2f2",
    borderLeftWidth: 4,
    borderLeftColor: "#dc2626",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  errorIcon: {
    fontSize: 14,
  },
  errorText: {
    color: "#991b1b",
    fontWeight: "500",
    fontSize: 13,
    flex: 1,
  },
  connectedContainer: {
    alignItems: "center",
    gap: 16,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "700",
  },
  connectedEmail: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
  },
  connectedText: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 8,
  },
  footer: {
    alignItems: "center",
    marginTop: 24,
  },
  footerText: {
    fontSize: 12,
    color: "#94a3b8",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#1F2937",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  logoIcon: {
    fontSize: 24,
  },
});
