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
  doctor: string;
  date: string;
  patient: string;
  prescriptionDate: Timestamp;
  imageUrl: string;
}

//nettoyer med eviter undefined
function cleanMedications(medications: Medication[]): Medication[] {
  return medications.map((med) => ({
    name: med.name || '',
    dosage: med.dosage || '',
    frequency: med.frequency || '',
    duration: med.duration || '',
    instructions: med.instructions || '', // Convertir undefined en string vide
  }));
}

//add dans firestore db
export async function savePrescriptionToFirestore(
  userId: string,
  prescription: PrescriptionAnalysis,
  imageUrl?: string
): Promise<string> {
  try {
    // Nettoyer les médicaments pour éviter les undefined
    const cleanedMedications = cleanMedications(prescription.medications);

    const docRef = await addDoc(collection(db, "prescriptions"), {
      userId,
      medications: cleanedMedications,
      doctor: prescription.doctor || '',
      date: prescription.date || '',
      patient: prescription.patient || '',
      prescriptionDate: Timestamp.now(),
      imageUrl: imageUrl || '',
    } as StoredPrescription);

    console.log("✅ Ordonnance enregistrée avec ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("❌ Erreur lors de l'enregistrement:", error);
    throw error;
  }
}

//getter ordo user
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

//update ordo
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

//delete ordo
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
