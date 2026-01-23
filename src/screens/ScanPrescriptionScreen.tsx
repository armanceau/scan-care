import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";
import {
  analyzePrescriptionImage,
  type Medication,
  type PrescriptionAnalysis,
} from "../services/mistral";
import ResultsScreen from "./ResultsScreen";

export default function ScanPrescriptionScreen() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] =
    useState<PrescriptionAnalysis | null>(null);
  const [rawResponse, setRawResponse] = useState<string>("");
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const requestPermissions = async () => {
    const { status: cameraStatus } =
      await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    return cameraStatus === "granted" && libraryStatus === "granted";
  };

  const handleTakePhoto = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) {
      alert("Les permissions sont nécessaires pour accéder à la caméra");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      console.log("📸 Photo prise:");
      console.log("  - URI:", result.assets[0].uri);
      console.log("  - Width:", result.assets[0].width);
      console.log("  - Height:", result.assets[0].height);
      console.log("  - Type:", result.assets[0].type);
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handlePickImage = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) {
      alert("Les permissions sont nécessaires pour accéder à la galerie");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      console.log("🖼️ Image sélectionnée depuis la galerie:");
      console.log("  - URI:", result.assets[0].uri);
      console.log("  - Width:", result.assets[0].width);
      console.log("  - Height:", result.assets[0].height);
      console.log("  - Type:", result.assets[0].type);
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleExtractMedications = async () => {
    if (!selectedImage) return;

    setIsProcessing(true);
    try {
      console.log("🔍 Début de l'extraction...");
      console.log("📍 URI à analyser:", selectedImage);

      const result = await analyzePrescriptionImage(selectedImage);

      setAnalysisResult(result);

      if (result.medications.length === 0) {
        Alert.alert(
          "Aucun médicament détecté",
          "Nous n'avons pas pu détecter de médicaments sur cette ordonnance.",
          [{ text: "OK" }],
        );
      } else {
        console.log(
          "✅ Affichage des résultats:",
          result.medications.length,
          "médicaments",
        );
      }
    } catch (error) {
      console.error("❌ Erreur lors de l'extraction:", error);
      Alert.alert(
        "Erreur",
        error instanceof Error
          ? error.message
          : "Impossible d'analyser l'ordonnance.",
        [{ text: "OK" }],
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (analysisResult) {
    return (
      <ResultsScreen
        medications={analysisResult.medications}
        doctor={analysisResult.doctor}
        date={analysisResult.date}
        patient={analysisResult.patient}
        rawResponse={JSON.stringify(analysisResult, null, 2)}
        navigation={navigation}
      />
    );
  }

  if (!selectedImage) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Text style={styles.documentIcon}>📋</Text>
            </View>
          </View>

          <Text style={styles.mainTitle}>Scannez votre{"\n"}ordonnance</Text>

          <Text style={styles.description}>
            Prenez une photo de votre ordonnance pour extraire automatiquement
            vos médicaments et créer des rappels
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleTakePhoto}
            >
              <Text style={styles.cameraIcon}>📷</Text>
              <Text style={styles.primaryButtonText}>Prendre une photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handlePickImage}
            >
              <Text style={styles.uploadIcon}>📤</Text>
              <Text style={styles.secondaryButtonText}>
                Choisir depuis la galerie
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.previewContent}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: selectedImage }}
            style={styles.previewImage}
            resizeMode="contain"
          />
        </View>

        <TouchableOpacity
          style={[
            styles.extractButton,
            isProcessing && styles.extractButtonDisabled,
          ]}
          onPress={handleExtractMedications}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <ActivityIndicator color="#FFFFFF" size="small" />
              <Text style={styles.extractButtonText}>
                Extraction en cours...
              </Text>
            </>
          ) : (
            <Text style={styles.extractButtonText}>
              Extraire les médicaments
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.changeImageButton}
          onPress={() => setSelectedImage(null)}
        >
          <Text style={styles.changeImageText}>Changer d'image</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "web" ? 12 : 40,
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: Platform.OS === "web" ? 16 : 32,
  },
  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  documentIcon: {
    fontSize: 80,
  },
  mainTitle: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 44,
  },
  description: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 48,
    paddingHorizontal: 8,
  },
  buttonContainer: {
    width: "100%",
    gap: 16,
  },
  primaryButton: {
    backgroundColor: "#1F2937",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cameraIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  uploadIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  secondaryButtonText: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "600",
  },
  // Styles pour l'écran de prévisualisation
  previewContent: {
    flex: 1,
    padding: 24,
  },
  imageContainer: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  extractButton: {
    backgroundColor: "#1F2937",
    borderRadius: 16,
    paddingVertical: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 12,
  },
  extractButtonDisabled: {
    opacity: 0.7,
  },
  extractButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  changeImageButton: {
    paddingVertical: 16,
    alignItems: "center",
  },
  changeImageText: {
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "500",
  },
});
