import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import {
  getApp,
  getApps,
  initializeApp,
  type FirebaseOptions,
} from "firebase/app";
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from "firebase/auth";
import { 
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import type { Medication, PrescriptionAnalysis } from "./mistral";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
} satisfies Record<string, string | undefined>;

const missingKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingKeys.length) {
  throw new Error(`Firebase config manquant: ${missingKeys.join(", ")}`);
}

const app =
  getApps().length === 0
    ? initializeApp(firebaseConfig as FirebaseOptions)
    : getApp();

const isNative = Platform.OS !== "web";

const auth = isNative
  ? initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    })
  : getAuth(app);

const db = getFirestore(app);

// Types pour Firestore
export interface StoredPrescription {
  userId: string;
  medications: Medication[];
  doctor?: string;
  date?: string;
  patient?: string;
  prescriptionDate: Timestamp;
  imageUrl?: string;
}

/**
 * Enregistrer une ordonnance avec ses médicaments en Firestore
 */
export async function savePrescriptionToFirestore(
  userId: string,
  prescription: PrescriptionAnalysis,
  imageUrl?: string
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, "prescriptions"), {
      userId,
      medications: prescription.medications,
      doctor: prescription.doctor || null,
      date: prescription.date || null,
      patient: prescription.patient || null,
      prescriptionDate: Timestamp.now(),
      imageUrl: imageUrl || null,
    } as StoredPrescription);

    console.log("✅ Ordonnance enregistrée avec ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("❌ Erreur lors de l'enregistrement:", error);
    throw error;
  }
}

/**
 * Récupérer les ordonnances de l'utilisateur
 */
export async function getUserPrescriptions(userId: string): Promise<(StoredPrescription & { id: string })[]> {
  try {
    const q = query(collection(db, "prescriptions"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as StoredPrescription & { id: string }));
  } catch (error) {
    console.error("❌ Erreur lors de la récupération:", error);
    throw error;
  }
}

/**
 * Mettre à jour une ordonnance
 */
export async function updatePrescriptionInFirestore(
  prescriptionId: string,
  updatedData: Partial<StoredPrescription>
): Promise<void> {
  try {
    const docRef = doc(db, "prescriptions", prescriptionId);
    await updateDoc(docRef, updatedData);
    console.log("✅ Ordonnance mise à jour:", prescriptionId);
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour:", error);
    throw error;
  }
}

/**
 * Supprimer une ordonnance
 */
export async function deletePrescriptionFromFirestore(prescriptionId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "prescriptions", prescriptionId));
    console.log("✅ Ordonnance supprimée:", prescriptionId);
  } catch (error) {
    console.error("❌ Erreur lors de la suppression:", error);
    throw error;
  }
}

export { app, auth, db };
