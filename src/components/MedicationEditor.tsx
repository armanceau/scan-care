import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import type { Medication } from '../services/mistral';

interface MedicationEditorProps {
  medication: Medication;
  onSave: (updatedMed: Medication) => void;
  onCancel: () => void;
}

export default function MedicationEditor({
  medication,
  onSave,
  onCancel,
}: MedicationEditorProps) {
  const [name, setName] = useState(medication.name);
  const [dosage, setDosage] = useState(medication.dosage);
  const [frequency, setFrequency] = useState(medication.frequency);
  const [duration, setDuration] = useState(medication.duration);
  const [instructions, setInstructions] = useState(medication.instructions || '');

  const handleSave = () => {
    if (!name.trim() || !dosage.trim() || !frequency.trim() || !duration.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    const updatedMed: Medication = {
      name: name.trim(),
      dosage: dosage.trim(),
      frequency: frequency.trim(),
      duration: duration.trim(),
      instructions: instructions.trim() || undefined,
    };

    onSave(updatedMed);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>✏️ Modifier le médicament</Text>
      </View>

      {/* Nom */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Nom du médicament *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Amoxicilline"
          value={name}
          onChangeText={setName}
        />
      </View>

      {/* Dosage */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Dosage *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 500mg, 1000mg, 5ml"
          value={dosage}
          onChangeText={setDosage}
        />
      </View>

      {/* Fréquence */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Fréquence *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 3 fois par jour, matin et soir"
          value={frequency}
          onChangeText={setFrequency}
        />
      </View>

      {/* Durée */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Durée du traitement *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 5 jours, 1 semaine, 2 semaines"
          value={duration}
          onChangeText={setDuration}
        />
      </View>

      {/* Instructions */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Instructions particulières (optionnel)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Ex: À prendre pendant les repas, À jeun"
          value={instructions}
          onChangeText={setInstructions}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Boutons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>💾 Enregistrer</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={onCancel}
        >
          <Text style={styles.cancelButtonText}>❌ Annuler</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  fieldGroup: {
    backgroundColor: '#FFFFFF',
    margin: 12,
    padding: 16,
    borderRadius: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  textArea: {
    textAlignVertical: 'top',
    minHeight: 80,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#10B981',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cancelButton: {
    backgroundColor: '#EF4444',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  spacer: {
    height: 20,
  },
});
