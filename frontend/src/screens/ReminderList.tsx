import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ScrollView,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';

//import type firebase
import type { Medication } from '../services/mistral';
import { getUserPrescriptions, auth, updatePrescriptionInFirestore, deletePrescriptionFromFirestore } from '../services/firebase';

import Svg, { Path } from 'react-native-svg';


//Interface Reminder avec les propriétés des médicaments de Firestore
interface Reminder {
  id: string;
  prescriptionId: string;
  nom: string;
  dosage: string;
  dosageValue: string;
  quantity: string;
  quantityValue: string;
  duration: string;
  durationValue: string;
  completed: boolean;
  description: string;
  frequency?: string;
  instructions?: string;
}

interface ListPrescription {
  userId: string;
  medications: Medication[];
  doctor?: string;
  date?: string;
  patient?: string;
  prescriptionDate: any;
  imageUrl?: string;
  id: string;
  expandedMedicationId?: string | null;
}

//component
const ReminderList: React.FC = () => {
  const [prescriptions, setPrescriptions] = useState<ListPrescription[]>([]);
  const [expandedPrescriptions, setExpandedPrescriptions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<boolean>(true);
  const [editingPrescriptionId, setEditingPrescriptionId] = useState<string | null>(null);
  const [editingMedicationIndex, setEditingMedicationIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Medication | null>(null);

  //charger prescription 
  useEffect(() => {
    const loadPrescriptions = async () => {
      try {
        setLoading(true);
        const currentUser = auth.currentUser;
        
        if (!currentUser) {
          console.warn('Aucun utilisateur connecté');
          setPrescriptions([]);
          return;
        }

        // Récupérer les prescriptions de l'utilisateur
        const loadedPrescriptions = await getUserPrescriptions(currentUser.uid);
        setPrescriptions(loadedPrescriptions);
        console.log('✅ Prescriptions chargées:', loadedPrescriptions.length);
      } catch (error) {
        console.error('❌ Erreur lors du chargement des prescriptions:', error);
        Alert.alert('Erreur', 'Impossible de charger les prescriptions');
      } finally {
        setLoading(false);
      }
    };

    loadPrescriptions();
  }, []);


  const formatDate = (date: any): string => {
    if (!date) return 'Date inconnue';
    try {
      if (date.toDate) {
        return date.toDate().toLocaleDateString('fr-FR');
      }
      return new Date(date).toLocaleDateString('fr-FR');
    } catch {
      return 'Date invalide';
    }
  };


  const togglePrescriptionExpanded = (prescriptionId: string) => {
    setExpandedPrescriptions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(prescriptionId)) {
        newSet.delete(prescriptionId);
      } else {
        newSet.add(prescriptionId);
      }
      return newSet;
    });
  };


  const handleEditMedication = (prescriptionId: string, medicationIndex: number) => {
    const prescription = prescriptions.find((p) => p.id === prescriptionId);
    if (prescription?.medications?.[medicationIndex]) {
      setEditingPrescriptionId(prescriptionId);
      setEditingMedicationIndex(medicationIndex);
      setEditForm({ ...prescription.medications[medicationIndex] });
    }
  };

  //save medicament data
  const handleSaveMedication = async () => {
    if (!editingPrescriptionId || editingMedicationIndex === null || !editForm) return;

    try {
      const prescription = prescriptions.find((p) => p.id === editingPrescriptionId);
      if (!prescription) return;

      const updatedMedications = [...prescription.medications];
      updatedMedications[editingMedicationIndex] = editForm;

      await updatePrescriptionInFirestore(editingPrescriptionId, {
        medications: updatedMedications,
      });

      setPrescriptions((prev) =>
        prev.map((p) => {
          if (p.id === editingPrescriptionId) {
            return { ...p, medications: updatedMedications };
          }
          return p;
        })
      );

      setEditingPrescriptionId(null);
      setEditingMedicationIndex(null);
      setEditForm(null);
      Alert.alert('Succès', 'Médicament mis à jour');
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour le médicament');
    }
  };


  const handleCancelEdit = () => {
    setEditingPrescriptionId(null);
    setEditingMedicationIndex(null);
    setEditForm(null);
  };

  const handleDeletePrescription = (prescriptionId: string) => {
    const confirmDelete = () => {
      deletePrescriptionAsync(prescriptionId);
    };

    Alert.alert(
      'Supprimer la prescription',
      'Êtes-vous sûr de vouloir supprimer cette ordonnance et tous ses médicaments?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: confirmDelete,
        },
      ]
    );
  };

  //modale delete 
  const deletePrescriptionAsync = async (prescriptionId: string) => {
    try {
      await deletePrescriptionFromFirestore(prescriptionId);
      removePrescriptionFromState(prescriptionId);
      Alert.alert('Succès', 'Prescription supprimée');
    } catch (error) {
      console.error('❌ Erreur lors de la suppression:', error);
      Alert.alert('Erreur', 'Impossible de supprimer la prescription');
    }
  };

  //delete state
  const removePrescriptionFromState = (prescriptionId: string) => {
    setPrescriptions((prev) => prev.filter((p) => p.id !== prescriptionId));
  };
  const renderPrescriptionCard = (prescription: ListPrescription) => {
    const isExpanded = expandedPrescriptions.has(prescription.id);
    const medicationsCount = prescription.medications?.length || 0;

    return (
      <View key={prescription.id} style={styles.card}>
        <TouchableOpacity
          style={styles.prescriptionHeader}
          onPress={() => togglePrescriptionExpanded(prescription.id)}
        >
          <View style={styles.prescriptionHeaderLeft}>
            <Text style={styles.prescriptionTitle}>
              Dr. {prescription.doctor || 'Médecin'}
            </Text>
            <Text style={styles.prescriptionDate}>
              📅 {formatDate(prescription.prescriptionDate)}
            </Text>
            <Text style={styles.medicationsCount}>
              💊 {medicationsCount} médicament{medicationsCount > 1 ? 's' : ''}
            </Text>
          </View>
          <View style={styles.expandIcon}>
            <Text style={{ fontSize: 20 }}>
              {isExpanded ? '▼' : '▶'}
            </Text>
          </View>
        </TouchableOpacity>

        {prescription.patient && (
          <View style={styles.patientInfo}>
            <Text style={styles.patientLabel}>Patient:</Text>
            <Text style={styles.patientValue}>{prescription.patient}</Text>
          </View>
        )}

        {isExpanded && prescription.medications && (
          <View style={styles.medicationsContainer}>
            {prescription.medications.map((medication, index) => (
              <View key={`${prescription.id}-${medication.name}-${index}`} style={styles.medicationItem}>
                <View style={styles.medicationNameRow}>
                  <Text style={styles.medicationName}>
                    {index + 1}. {medication.name}
                  </Text>
                </View>
                <View style={styles.medicationDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Dosage:</Text>
                    <Text style={styles.detailValue}>{medication.dosage}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Fréquence:</Text>
                    <Text style={styles.detailValue}>{medication.frequency}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Durée:</Text>
                    <Text style={styles.detailValue}>{medication.duration}</Text>
                  </View>
                  {medication.instructions && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Instructions:</Text>
                      <Text style={styles.detailValue}>
                        {medication.instructions}
                      </Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.editMedicationButton}
                  onPress={() => handleEditMedication(prescription.id, index)}
                >
                  <Text style={styles.editMedicationButtonText}>✏️ Éditer</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View style={styles.cardActions}>
          <TouchableOpacity 
            style={styles.actionButtonSmall}
            onPress={() => handleEditMedication(prescription.id, 0)}
          >
            <Svg width="18" height="18" viewBox="0 0 24 24">
              <Path fill="none" stroke="#0F172A" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m14.304 4.844l2.852 2.852M7 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4.5m2.409-9.91a2.017 2.017 0 0 1 0 2.853l-6.844 6.844L8 14l.713-3.565l6.844-6.844a2.015 2.015 0 0 1 2.852 0Z" />
            </Svg>
            <Text style={styles.actionButtonText}>Éditer</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButtonSmall}
            onPress={() => handleDeletePrescription(prescription.id)}
          >
            <Svg width="18" height="18" viewBox="0 0 24 24">
              <Path fill="none" stroke="#E53E3E" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.687 6.213L6.8 18.976a2.5 2.5 0 0 0 2.466 2.092h3.348m6.698-14.855L17.2 18.976a2.5 2.5 0 0 1-2.466 2.092h-3.348m-1.364-9.952v5.049m3.956-5.049v5.049M2.75 6.213h18.5m-6.473 0v-1.78a1.5 1.5 0 0 0-1.5-1.5h-2.554a1.5 1.5 0 0 0-1.5 1.5v1.78z" />
            </Svg>
            <Text style={[styles.actionButtonText, { color: '#E53E3E' }]}>Supprimer</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#0F172A" />
          <Text style={styles.loadingText}>Chargement des prescriptions...</Text>
        </View>
      );
    }

    if (prescriptions.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Aucune prescription trouvée</Text>
        </View>
      );
    }

    return (
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {prescriptions.map((prescription) => renderPrescriptionCard(prescription))}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Mes rappels</Text>

      {renderContent()}

      <Modal
        visible={editingPrescriptionId !== null && editingMedicationIndex !== null}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {editForm && (
              <ScrollView showsVerticalScrollIndicator={true}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Éditer le médicament</Text>
                  <TouchableOpacity onPress={handleCancelEdit}>
                    <Text style={styles.closeButton}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Nom du médicament</Text>
                  <TextInput
                    style={styles.input}
                    value={editForm.name}
                    onChangeText={(text) => {
                      setEditForm({ ...editForm, name: text });
                    }}
                    placeholder="Nom du médicament"
                    placeholderTextColor="#9ca3af"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Dosage</Text>
                  <TextInput
                    style={styles.input}
                    value={editForm.dosage}
                    onChangeText={(text) => {
                      setEditForm({ ...editForm, dosage: text });
                    }}
                    placeholder="ex: 500mg"
                    placeholderTextColor="#9ca3af"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Fréquence</Text>
                  <TextInput
                    style={styles.input}
                    value={editForm.frequency}
                    onChangeText={(text) => {
                      setEditForm({ ...editForm, frequency: text });
                    }}
                    placeholder="ex: 2 fois par jour"
                    placeholderTextColor="#9ca3af"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Durée</Text>
                  <TextInput
                    style={styles.input}
                    value={editForm.duration}
                    onChangeText={(text) => {
                      setEditForm({ ...editForm, duration: text });
                    }}
                    placeholder="ex: 7 jours"
                    placeholderTextColor="#9ca3af"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Instructions</Text>
                  <TextInput
                    style={[styles.input, styles.textAreaInput]}
                    value={editForm.instructions || ''}
                    onChangeText={(text) => {
                      setEditForm({ ...editForm, instructions: text });
                    }}
                    placeholder="ex: À prendre pendant les repas"
                    placeholderTextColor="#9ca3af"
                    multiline={true}
                    numberOfLines={4}
                  />
                </View>

                <View style={styles.modalButtonsContainer}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={handleCancelEdit}
                  >
                    <Text style={styles.cancelButtonText}>Annuler</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.saveButton]}
                    onPress={handleSaveMedication}
                  >
                    <Text style={styles.saveButtonText}>Sauvegarder</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ReminderList;

/* =========================
   Styles
========================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
  },

  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0F172A',
    marginVertical: 24,
    textAlign: 'center',
    letterSpacing: -0.5,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },

  card: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    marginHorizontal: 'auto',
    width: '90%',
    maxWidth: 500,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  prescriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },

  prescriptionHeaderLeft: {
    flex: 1,
  },

  prescriptionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: 0.3,
  },

  prescriptionDate: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },

  medicationsCount: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },

  expandIcon: {
    paddingLeft: 16,
    justifyContent: 'center',
  },

  patientInfo: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 12,
    marginTop: 8,
  },

  patientLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
  },

  patientValue: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '500',
    lineHeight: 18,
  },

  medicationsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    marginTop: 12,
    paddingTop: 12,
  },

  medicationItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },

  medicationNameRow: {
    marginBottom: 8,
  },

  medicationName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: 0.3,
  },

  medicationDetails: {
    marginLeft: 4,
  },

  detailRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },

  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    minWidth: 80,
  },

  detailValue: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '500',
    flex: 1,
  },

  editMedicationButton: {
    marginTop: 8,
    paddingVertical: 8,
    backgroundColor: '#F0F9FF',
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },

  editMedicationButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
  },

  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 12,
    marginTop: 8,
  },

  actionButtonSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
  },

  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
  },

  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 450,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    maxHeight: '90%',
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },

  closeButton: {
    fontSize: 28,
    color: '#8E8E93',
    padding: 4,
  },

  formGroup: {
    marginBottom: 16,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 8,
    letterSpacing: 0.3,
  },

  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },

  textAreaInput: {
    textAlignVertical: 'top',
    minHeight: 80,
  },

  modalButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },

  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },

  cancelButton: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },

  saveButton: {
    backgroundColor: '#0F172A',
  },

  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  circle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#C7C7CC',
    marginRight: 12,
  },

  circleCompleted: {
    backgroundColor: '#000',
    borderColor: '#000',
  },

  content: {
    flex: 1,
  },

  medName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: 0.3,
  },

  dosage: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    gap: 8,
  },

  actionButton: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },

  editText: {
    fontSize: 16,
  },

  deleteText: {
    fontSize: 16,
  },

  infoButton: {
    marginLeft: 8,
  },

  infoText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
  },

  bottomRow: {
    flexDirection: 'row',
    marginTop: 6,
    marginLeft: 32,
  },

  meta: {
    fontSize: 12,
    color: '#64748B',
    marginRight: 20,
    fontWeight: '500',
  },
});
