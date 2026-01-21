import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { getAuth } from 'firebase/auth';
import type { Medication } from '../services/mistral';
import { savePrescriptionToFirestore } from '../services/firebase';
import MedicationEditor from '../components/MedicationEditor';

interface ResultsScreenProps {
  medications: Medication[];
  doctor?: string;
  date?: string;
  patient?: string;
  rawResponse?: string;
}

export default function ResultsScreen({
  medications: initialMedications,
  doctor,
  date,
  patient,
  rawResponse,
}: ResultsScreenProps) {
  const [medications, setMedications] = useState<Medication[]>(initialMedications);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const auth = getAuth();

  const handleEditMedication = (index: number) => {
    setEditingIndex(index);
  };

  const handleSaveMedication = (updatedMed: Medication) => {
    if (editingIndex === null) return;

    const newMedications = [...medications];
    newMedications[editingIndex] = updatedMed;
    setMedications(newMedications);
    setEditingIndex(null);
  };

  const handleDeleteMedication = (index: number) => {
    Alert.alert(
      'Supprimer le médicament',
      `Êtes-vous sûr de vouloir supprimer ${medications[index].name}?`,
      [
        { text: 'Annuler', onPress: () => {}, style: 'cancel' },
        {
          text: 'Supprimer',
          onPress: () => {
            const newMedications = medications.filter((_, i) => i !== index);
            setMedications(newMedications);
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleSaveToFirestore = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Erreur', 'Vous devez être connecté pour enregistrer');
        return;
      }

      if (medications.length === 0) {
        Alert.alert('Erreur', 'Aucun médicament à enregistrer');
        return;
      }

      setIsSaving(true);

      const prescription = {
        medications,
        doctor: doctor || undefined,
        date: date || undefined,
        patient: patient || undefined,
      };

      const prescriptionId = await savePrescriptionToFirestore(user.uid, prescription);

      Alert.alert(
        'Succès',
        `Ordonnance enregistrée avec succès (ID: ${prescriptionId.substring(0, 8)}...)`
      );
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert('Erreur', 'Impossible d\'enregistrer l\'ordonnance');
    } finally {
      setIsSaving(false);
    }
  };

  if (editingIndex !== null) {
    return (
      <MedicationEditor
        medication={medications[editingIndex]}
        onSave={handleSaveMedication}
        onCancel={() => setEditingIndex(null)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>📋 Résultats de l'analyse</Text>

        {/* Informations générales */}
        {doctor && (
          <View style={styles.infoCard}>
            <Text style={styles.label}>Médecin:</Text>
            <Text style={styles.value}>{doctor}</Text>
          </View>
        )}

        {date && (
          <View style={styles.infoCard}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>{date}</Text>
          </View>
        )}

        {patient && (
          <View style={styles.infoCard}>
            <Text style={styles.label}>Patient:</Text>
            <Text style={styles.value}>{patient}</Text>
          </View>
        )}

        {/* Médicaments */}
        <Text style={styles.sectionTitle}>
          Médicaments détectés ({medications.length})
        </Text>

        {medications.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Aucun médicament détecté</Text>
          </View>
        ) : (
          medications.map((med, index) => (
            <View key={index} style={styles.medCard}>
              <Text style={styles.medName}>💊 {med.name}</Text>
              <Text style={styles.medDetail}>Dosage: {med.dosage}</Text>
              <Text style={styles.medDetail}>Fréquence: {med.frequency}</Text>
              <Text style={styles.medDetail}>Durée: {med.duration}</Text>
              {med.instructions && (
                <Text style={styles.medInstructions}>ℹ️ {med.instructions}</Text>
              )}

              {/* Boutons d'action */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => handleEditMedication(index)}
                >
                  <Text style={styles.actionButtonText}>✏️ Modifier</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteMedication(index)}
                >
                  <Text style={styles.actionButtonText}>🗑️ Supprimer</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {/* Réponse brute pour debug */}
        {rawResponse && (
          <View style={styles.debugCard}>
            <Text style={styles.debugTitle}>🔍 Réponse brute (debug):</Text>
            <Text style={styles.debugText}>{rawResponse}</Text>
          </View>
        )}
      </ScrollView>

      {/* Boutons d'action en bas */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSaveToFirestore}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>💾 Enregistrer en Firestore</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    padding: 20,
    paddingBottom: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 20,
    marginBottom: 12,
  },
  emptyCard: {
    backgroundColor: '#F3E8FF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#7C3AED',
    fontWeight: '500',
  },
  medCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4F46E5',
  },
  medName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  medDetail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  medInstructions: {
    fontSize: 14,
    color: '#4F46E5',
    marginTop: 8,
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#DBEAFE',
  },
  deleteButton: {
    backgroundColor: '#FEE2E2',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  debugCard: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 40,
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#78350F',
    fontFamily: 'monospace',
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  saveButton: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

