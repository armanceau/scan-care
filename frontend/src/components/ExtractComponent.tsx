import React, { useState } from "react";
import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import {
  extractOrdonnanceData,
  validateOrdonnanceData,
  type OrdonnanceData,
  type Ordonnance,
} from "../services/prescriptionExtractor";

type ExtractComponentProps = {
  onSubmit?: (data: OrdonnanceData) => void;
  onCancel?: () => void;
};

const ExtractComponent: React.FC<ExtractComponentProps> = ({
  onSubmit,
  onCancel,
}) => {
  const [step, setStep] = useState<"camera" | "edit" | "review">("camera");
  const [loading, setLoading] = useState(false);
  const [ordonnanceData, setOrdonnanceData] = useState<OrdonnanceData | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  /**
   * Récupère une image de la caméra ou de la galerie
   */
  const pickImage = async () => {
    try {
      setLoading(true);

      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission refusée", "L'accès à la caméra est nécessaire");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        await processImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Erreur", "Impossible de prendre une photo");
      console.error("Erreur image picker:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Traite l'image et extrait les données
   */
  const processImage = async (imageUri: string) => {
    try {
      setLoading(true);
      const data = await extractOrdonnanceData(imageUri);
      setOrdonnanceData(data);
      setStep("edit");
      setErrors([]);
    } catch (error) {
      Alert.alert(
        "Erreur",
        "Impossible d'extraire les données de l'ordonnance"
      );
      console.error("Erreur extraction:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Met à jour un champ de données
   */
  const updateField = (
    field: keyof OrdonnanceData,
    value: string | Ordonnance[] | undefined
  ): void => {
    if (!ordonnanceData) return;
    setOrdonnanceData({
      ...ordonnanceData,
      [field]: value,
    });
  };

  /**
   * Met à jour une ordonnance
   */
  const updateOrdonnance = (
    index: number,
    field: keyof Ordonnance,
    value: string
  ): void => {
    if (!ordonnanceData || !ordonnanceData.ordonnances) return;

    const updatedOrdonnances: Ordonnance[] = [...ordonnanceData.ordonnances];
    updatedOrdonnances[index] = {
      ...updatedOrdonnances[index],
      [field]: value,
    };

    updateField("ordonnances", updatedOrdonnances);
  };

  /**
   * Ajoute une nouvelle ordonnance
   */
  const addOrdonnance = (): void => {
    if (!ordonnanceData) return;

    const newOrdonnance: Ordonnance = {
      id: Date.now().toString(),
      userid: "user123",
      name: "",
      dosage: "",
      instructions: "",
      duration: "",
      times: "",
      dayOfWeek: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    updateField("ordonnances", [
      ...ordonnanceData.ordonnances,
      newOrdonnance,
    ]);
  };

  /**
   * Supprime une ordonnance
   */
  const removeOrdonnance = (index: number): void => {
    if (!ordonnanceData) return;

    const updatedOrdonnances = ordonnanceData.ordonnances.filter(
      (_, i) => i !== index
    );
    updateField("ordonnances", updatedOrdonnances);
  };

  /**
   * Valide et soumet les données
   */
  const handleSubmit = (): void => {
    if (!ordonnanceData) return;

    const validation = validateOrdonnanceData(ordonnanceData);

    if (!validation.valid) {
      setErrors(validation.errors);
      Alert.alert(
        "Erreurs de validation",
        validation.errors.join("\n")
      );
      return;
    }

    setErrors([]);
    onSubmit?.(ordonnanceData);
  };

  // Écran de capture
  if (step === "camera") {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Ordonnance</Text>
        <Text style={styles.subtitle}>
          Photographiez votre ordonnance pour extraire les informations
        </Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={pickImage}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>📷 Prendre une photo</Text>
          )}
        </TouchableOpacity>

        {onCancel && (
          <TouchableOpacity style={styles.secondaryButton} onPress={onCancel}>
            <Text style={styles.secondaryButtonText}>Annuler</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // Écran d'édition
  if (step === "edit" && ordonnanceData) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Valider les informations</Text>

        {errors.length > 0 && (
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>Erreurs détectées:</Text>
            {errors.map((error, index) => (
              <Text key={index} style={styles.errorText}>
                • {error}
              </Text>
            ))}
          </View>
        )}

        {/* Section Patient */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Patient</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Nom</Text>
            <TextInput
              style={styles.input}
              value={ordonnanceData.patientName}
              onChangeText={(value) => updateField("patientName", value)}
              placeholder="Nom du patient"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Date de naissance</Text>
            <TextInput
              style={styles.input}
              value={ordonnanceData.patientDateOfBirth}
              onChangeText={(value) =>
                updateField("patientDateOfBirth", value)
              }
              placeholder="YYYY-MM-DD"
            />
          </View>
        </View>

        {/* Section Médecin */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👨‍⚕️ Médecin</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Nom</Text>
            <TextInput
              style={styles.input}
              value={ordonnanceData.doctorName}
              onChangeText={(value) => updateField("doctorName", value)}
              placeholder="Nom du médecin"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Spécialité</Text>
            <TextInput
              style={styles.input}
              value={ordonnanceData.doctorSpecialty}
              onChangeText={(value) => updateField("doctorSpecialty", value)}
              placeholder="Spécialité"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Date de l'ordonnance</Text>
            <TextInput
              style={styles.input}
              value={ordonnanceData.prescriptionDate}
              onChangeText={(value) => updateField("prescriptionDate", value)}
              placeholder="YYYY-MM-DD"
            />
          </View>
        </View>

        {/* Section Ordonnances */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💊 Ordonnances</Text>

          {ordonnanceData.ordonnances.map((ordonnance, index) => (
            <View key={index} style={styles.medicationCard}>
              <View style={styles.medicationHeader}>
                <Text style={styles.medicationNumber}>Ordonnance {index + 1}</Text>
                {ordonnanceData.ordonnances.length > 1 && (
                  <TouchableOpacity onPress={() => removeOrdonnance(index)}>
                    <Text style={styles.removeButton}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Nom du médicament</Text>
                <TextInput
                  style={styles.input}
                  value={ordonnance.name}
                  onChangeText={(value) =>
                    updateOrdonnance(index, "name", value)
                  }
                  placeholder="Ex: Amoxicilline"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Posologie</Text>
                <TextInput
                  style={styles.input}
                  value={ordonnance.dosage}
                  onChangeText={(value) =>
                    updateOrdonnance(index, "dosage", value)
                  }
                  placeholder="Ex: 500mg"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Horaires</Text>
                <TextInput
                  style={styles.input}
                  value={ordonnance.times}
                  onChangeText={(value) =>
                    updateOrdonnance(index, "times", value)
                  }
                  placeholder="Ex: 3 fois par jour"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Jours</Text>
                <TextInput
                  style={styles.input}
                  value={ordonnance.dayOfWeek}
                  onChangeText={(value) =>
                    updateOrdonnance(index, "dayOfWeek", value)
                  }
                  placeholder="Ex: Tous les jours"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Durée</Text>
                <TextInput
                  style={styles.input}
                  value={ordonnance.duration}
                  onChangeText={(value) =>
                    updateOrdonnance(index, "duration", value)
                  }
                  placeholder="Ex: 7 jours"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Instructions</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={ordonnance.instructions}
                  onChangeText={(value) =>
                    updateOrdonnance(index, "instructions", value)
                  }
                  placeholder="Instructions particulières"
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>
          ))}

          <TouchableOpacity
            style={styles.addButton}
            onPress={addOrdonnance}
          >
            <Text style={styles.addButtonText}>+ Ajouter une ordonnance</Text>
          </TouchableOpacity>
        </View>

        {/* Section Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Notes</Text>

          <View style={styles.formGroup}>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={ordonnanceData.notes}
              onChangeText={(value) => updateField("notes", value)}
              placeholder="Notes supplémentaires"
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Boutons d'action */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleSubmit}
          >
            <Text style={styles.buttonText}>✓ Valider</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => {
              setOrdonnanceData(null);
              setStep("camera");
              setErrors([]);
            }}
          >
            <Text style={styles.secondaryButtonText}>Nouvelle photo</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 8,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
    lineHeight: 24,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  formGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#1a1a1a",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
    paddingTop: 10,
  },
  medicationCard: {
    backgroundColor: "#fafafa",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  medicationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  medicationNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  removeButton: {
    fontSize: 20,
    color: "#ff3b30",
    fontWeight: "bold",
  },
  errorBox: {
    backgroundColor: "#fff3cd",
    borderWidth: 1,
    borderColor: "#ffc107",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#856404",
    marginBottom: 6,
  },
  errorText: {
    fontSize: 13,
    color: "#856404",
    marginBottom: 4,
  },
  primaryButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    minHeight: 48,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#d0d0d0",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#1a1a1a",
    fontSize: 16,
    fontWeight: "600",
  },
  addButton: {
    backgroundColor: "#e8f4f8",
    borderWidth: 1,
    borderColor: "#007AFF",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    marginTop: 8,
  },
  addButtonText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "600",
  },
  actionButtons: {
    gap: 12,
  },
});

export default ExtractComponent;
