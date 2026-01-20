import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithCredential,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import * as AuthSession from "expo-auth-session";
import { Platform } from "react-native";

import { auth } from "./firebase";

export const signUpWithEmail = async (email: string, password: string) => {
  const credential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );
  return credential.user;
};

export const signInWithEmail = async (email: string, password: string) => {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
};

export const signInWithGoogle = async () => {
  if (Platform.OS === "web") {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const credential = await signInWithPopup(auth, provider);
    return credential.user;
  }

  const clientId =
    Platform.OS === "ios"
      ? process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ||
        process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
      : Platform.OS === "android"
        ? process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ||
          process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
        : process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

  if (!clientId) {
    throw new Error(
      "Missing Google Client ID (provide at least the WEB client ID).",
    );
  }

  const redirectUri = AuthSession.makeRedirectUri();
  const state = Math.random().toString(36).slice(2);
  const nonce = Math.random().toString(36).slice(2);

  const authUrl =
    "https://accounts.google.com/o/oauth2/v2/auth" +
    `?client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    "&response_type=id_token" +
    "&scope=" +
    encodeURIComponent("openid email profile") +
    `&state=${state}` +
    `&nonce=${nonce}`;

  const result = await AuthSession.startAsync({ authUrl });

  if (result.type !== "success" || !result.params?.id_token) {
    throw new Error("Échec de la connexion Google.");
  }

  const credential = GoogleAuthProvider.credential(result.params.id_token);
  const userCred = await signInWithCredential(auth, credential);
  return userCred.user;
};

export const signOutUser = () => signOut(auth);

export const watchAuthState = (handler: (user: User | null) => void) =>
  onAuthStateChanged(auth, handler);
