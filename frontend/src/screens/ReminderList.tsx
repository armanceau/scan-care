import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

/* =========================
   Types
========================= */
interface Reminder {
  id: string;
  nom: string;
  dosage: string;
  dosageValue: string;
  quantity: string;
  quantityValue: string;
  duration: string;
  durationValue: string;
  completed: boolean;
  description: string;
}

interface Prescription {
  id: string;
  nom: string;
  date: string;
  medicaments: Reminder[];
}

/* =========================
   Component
========================= */
const ReminderList: React.FC = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [expandedPrescriptionId, setExpandedPrescriptionId] = useState<string | null>(null);
  const [editingPrescriptionId, setEditingPrescriptionId] = useState<string | null>(null);
  const [editPrescriptionForm, setEditPrescriptionForm] = useState<Prescription | null>(null);
  const [editingReminderId, setEditingReminderId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Reminder | null>(null);
  const [infoReminder, setInfoReminder] = useState<Reminder | null>(null);

  useEffect(() => {
    setPrescriptions([
      {
        id: 'p1',
        nom: 'Ordonnance du Dr. Martin',
        date: '21/01/2026',
        medicaments: [
          {
            id: '1',
            nom: 'Ibuprofène',
            dosage: '400 mg',
            dosageValue: '400',
            quantity: '1 comprimé(s)',
            quantityValue: '1',
            duration: '3 jours',
            durationValue: '3',
            completed: false,
            description: 'Médicament utilisé pour soulager la douleur et réduire la fièvre. L\'ibuprofène est un anti-inflammatoire non stéroïdien (AINS) qui aide à réduire l\'inflammation et l\'inconfort causés par diverses conditions.',
          },
          {
            id: '2',
            nom: 'Doliprane',
            dosage: '500 mg',
            dosageValue: '500',
            quantity: '1 comprimé(s)',
            quantityValue: '1',
            duration: '5 jours',
            durationValue: '5',
            completed: false,
            description: 'Médicament utilisé pour soulager la douleur et réduire la fièvre.',
          },
        ],
      },
    ]);
  }, []);

  const handleEdit = (id: string) => {
    if (!expandedPrescriptionId) return;
    const prescription = prescriptions.find((p) => p.id === expandedPrescriptionId);
    if (!prescription) return;
    const reminder = prescription.medicaments.find((r) => r.id === id);
    if (reminder) {
      setEditingReminderId(id);
      setEditForm({ ...reminder });
    }
  };

  const handleSaveEdit = () => {
    if (editForm && expandedPrescriptionId && editingReminderId) {
      const updatedPrescriptions = prescriptions.map((p) => {
        if (p.id === expandedPrescriptionId) {
          const updatedMedicaments = p.medicaments.map((r) => {
            if (r.id === editingReminderId) {
              return {
                ...editForm,
                dosage: `${editForm.dosageValue} mg`,
                quantity: `${editForm.quantityValue} comprimé(s)`,
                duration: `${editForm.durationValue} jours`,
              };
            }
            return r;
          });
          return {
            ...p,
            medicaments: updatedMedicaments,
          };
        }
        return p;
      });
      
      setPrescriptions(updatedPrescriptions);
      setEditingReminderId(null);
      setEditForm(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingReminderId(null);
    setEditForm(null);
  };

  const handleDelete = (id: string) => {
    if (!expandedPrescriptionId) return;
    Alert.alert(
      'Supprimer',
      'Supprimer ce médicament ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            setPrescriptions((prev) =>
              prev.map((p) => {
                if (p.id === expandedPrescriptionId) {
                  return {
                    ...p,
                    medicaments: p.medicaments.filter((r) => r.id !== id),
                  };
                }
                return p;
              })
            );
          },
        },
      ]
    );
  };

  const handleEditPrescription = (id: string) => {
    const prescription = prescriptions.find((p) => p.id === id);
    if (prescription) {
      setEditingPrescriptionId(id);
      setEditPrescriptionForm({ ...prescription });
    }
  };

  const handleSaveEditPrescription = () => {
    if (editPrescriptionForm && editingPrescriptionId) {
      const updatedPrescriptions = prescriptions.map((p) => {
        if (p.id === editingPrescriptionId) {
          return {
            ...editPrescriptionForm,
          };
        }
        return p;
      });
      
      setPrescriptions(updatedPrescriptions);
      setEditingPrescriptionId(null);
      setEditPrescriptionForm(null);
    }
  };

  const handleCancelEditPrescription = () => {
    setEditingPrescriptionId(null);
    setEditPrescriptionForm(null);
  };

  /* =========================
     Rendu des ordonnances
  ========================= */
  /* =========================
     Rendu des médicaments
  ========================= */
  const renderMedicamentItem = ({ item }: { item: Reminder }) => (
    <View style={styles.card}>
      {/* Ligne du haut */}
      <View style={styles.topRow}>
        <View style={styles.circle} />
        <View style={styles.content}>
          <Text style={styles.title}>{item.nom}</Text>
          <Text style={styles.subtitle}>{item.dosage}</Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEdit(item.id)}
          >
            <Svg width="24" height="24" viewBox="0 0 24 24">
              <Path fill="none" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m14.304 4.844l2.852 2.852M7 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4.5m2.409-9.91a2.017 2.017 0 0 1 0 2.853l-6.844 6.844L8 14l.713-3.565l6.844-6.844a2.015 2.015 0 0 1 2.852 0Z" />
            </Svg>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDelete(item.id)}
          >
            <Svg width="24" height="24" viewBox="0 0 24 24">
              <Path fill="none" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.687 6.213L6.8 18.976a2.5 2.5 0 0 0 2.466 2.092h3.348m6.698-14.855L17.2 18.976a2.5 2.5 0 0 1-2.466 2.092h-3.348m-1.364-9.952v5.049m3.956-5.049v5.049M2.75 6.213h18.5m-6.473 0v-1.78a1.5 1.5 0 0 0-1.5-1.5h-2.554a1.5 1.5 0 0 0-1.5 1.5v1.78z" />
            </Svg>
          </TouchableOpacity>

          <TouchableOpacity style={styles.infoButton} onPress={() => setInfoReminder(item)}>
            <Svg width="24" height="24" viewBox="0 0 24 24">
              <Path fill="#8E8E93" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m1 15h-2v-6h2v6m0-8h-2V7h2v2z" />
            </Svg>
          </TouchableOpacity>
        </View>
      </View>

      {/* Ligne du bas */}
      <View style={styles.bottomRow}>
        <Text style={styles.meta}>⏱ {item.quantity}</Text>
        <Text style={styles.meta}>📅 {item.duration}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Mes ordonnances</Text>
      <FlatList
        data={prescriptions}
        renderItem={({ item }) => (
          <View>
            <TouchableOpacity
              style={styles.prescriptionCard}
              activeOpacity={0.7}
              onPress={() => setExpandedPrescriptionId(
                expandedPrescriptionId === item.id ? null : item.id
              )}
            >
              <View style={styles.prescriptionContent}>
                <Text style={styles.prescriptionTitle}>{item.nom}</Text>
                <Text style={styles.prescriptionDate}>📅 {item.date}</Text>
                <Text style={styles.medicamentCount}>
                  {item.medicaments.length} médicament{item.medicaments.length > 1 ? 's' : ''}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.editPrescriptionButton}
                activeOpacity={0.7}
                onPress={(e) => {
                  e.stopPropagation?.();
                  handleEditPrescription(item.id);
                }}
              >
                <Svg width="24" height="24" viewBox="0 0 24 24">
                  <Path fill="none" stroke="#0F172A" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m14.304 4.844l2.852 2.852M7 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4.5m2.409-9.91a2.017 2.017 0 0 1 0 2.853l-6.844 6.844L8 14l.713-3.565l6.844-6.844a2.015 2.015 0 0 1 2.852 0Z" />
                </Svg>
              </TouchableOpacity>
              <View style={styles.prescriptionClickArea}>
  <Svg
    width={32}
    height={32}
    viewBox="0 0 24 24"
    style={{
      transform: [
        { rotate: expandedPrescriptionId === item.id ? '180deg' : '0deg' },
      ],
    }}
  >
    <Path
      d="m6 9l6 6l6-6"
      fill="none"
      stroke={expandedPrescriptionId === item.id ? '#3B82F6' : '#94A3B8'}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
</View>

            </TouchableOpacity>

            {/* Menu déroulant des médicaments */}
            {expandedPrescriptionId === item.id && (
              <View style={styles.medicamentsDropdown}>
                {item.medicaments.map((medicament) => (
                  <View key={medicament.id}>
                    {renderMedicamentItem({ item: medicament })}
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
      />

      {/* Modal d'édition des ordonnances */}
      <Modal
        visible={editingPrescriptionId !== null}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.infoModalOverlay}>
          <View style={styles.infoModalContent}>
            {editPrescriptionForm && (
              <ScrollView showsVerticalScrollIndicator={true}>
                {/* Header du modal */}
                <View style={styles.infoModalHeader}>
                  <Text style={styles.infoModalTitle}>Éditer l'ordonnance</Text>
                  <TouchableOpacity onPress={handleCancelEditPrescription}>
                    <Text style={styles.closeButton}>✕</Text>
                  </TouchableOpacity>
                </View>

                {/* Nom de l'ordonnance */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Nom de l'ordonnance</Text>
                  <TextInput
                    style={styles.input}
                    value={editPrescriptionForm.nom}
                    onChangeText={(text) => {
                      setEditPrescriptionForm({ ...editPrescriptionForm, nom: text });
                    }}
                    placeholder="Nom de l'ordonnance"
                    placeholderTextColor="#9ca3af"
                  />
                </View>

                {/* Date */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Date</Text>
                  <TextInput
                    style={styles.input}
                    value={editPrescriptionForm.date}
                    onChangeText={(text) => {
                      setEditPrescriptionForm({ ...editPrescriptionForm, date: text });
                    }}
                    placeholder="JJ/MM/AAAA"
                    placeholderTextColor="#9ca3af"
                  />
                </View>

                {/* Nombre de médicaments (lecture seule) */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Nombre de médicaments</Text>
                  <View style={[styles.input, styles.readOnlyInput]}>
                    <Text style={[styles.readOnlyText]}>
                      {editPrescriptionForm.medicaments.length} médicament{editPrescriptionForm.medicaments.length > 1 ? 's' : ''}
                    </Text>
                  </View>
                </View>

                {/* Boutons */}
                <View style={styles.buttonGroup}>
                  <TouchableOpacity
                    style={[styles.saveButton, styles.cancelButtonStyle]}
                    onPress={handleCancelEditPrescription}
                  >
                    <Text style={styles.cancelButtonText}>Annuler</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSaveEditPrescription}
                  >
                    <Text style={styles.saveButtonText}>Sauvegarder</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal d'édition */}
      <Modal
        visible={editingReminderId !== null}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.infoModalOverlay}>
          <View style={styles.infoModalContent}>
            {editForm && (
              <ScrollView showsVerticalScrollIndicator={true}>
                {/* Header du modal */}
                <View style={styles.infoModalHeader}>
                  <Text style={styles.infoModalTitle}>Éditer le médicament</Text>
                  <TouchableOpacity onPress={handleCancelEdit}>
                    <Text style={styles.closeButton}>✕</Text>
                  </TouchableOpacity>
                </View>

                {/* Nom du médicament */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Nom du médicament</Text>
                  <TextInput
                    style={styles.input}
                    value={editForm.nom}
                    onChangeText={(text) => {
                      setEditForm({ ...editForm, nom: text });
                    }}
                    placeholder="Nom du médicament"
                    placeholderTextColor="#9ca3af"
                  />
                </View>

                {/* Dosage */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Dosage</Text>
                  <View style={styles.inputWithUnit}>
                    <TextInput
                      style={styles.editableInput}
                      value={editForm.dosageValue}
                      onChangeText={(text) => {
                        setEditForm({ ...editForm, dosageValue: text });
                      }}
                      placeholder="400"
                      keyboardType="numeric"
                      placeholderTextColor="#9ca3af"
                    />
                    <Text style={styles.unit}>mg</Text>
                  </View>
                </View>

                {/* Quantité */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Quantité</Text>
                  <View style={styles.inputWithUnit}>
                    <TextInput
                      style={styles.editableInput}
                      value={editForm.quantityValue}
                      onChangeText={(text) => {
                        setEditForm({ ...editForm, quantityValue: text });
                      }}
                      placeholder="1"
                      keyboardType="numeric"
                      placeholderTextColor="#9ca3af"
                    />
                    <Text style={styles.unit}>comprimé(s)</Text>
                  </View>
                </View>

                {/* Durée */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Durée</Text>
                  <View style={styles.inputWithUnit}>
                    <TextInput
                      style={styles.editableInput}
                      value={editForm.durationValue}
                      onChangeText={(text) => {
                        setEditForm({ ...editForm, durationValue: text });
                      }}
                      placeholder="3"
                      keyboardType="numeric"
                      placeholderTextColor="#9ca3af"
                    />
                    <Text style={styles.unit}>jours</Text>
                  </View>
                </View>

                {/* Description - Lecture seule */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Description</Text>
                  <View style={[styles.input, styles.readOnlyInput]}>
                    <Text style={[styles.readOnlyText, styles.descriptionText]}>{editForm.description}</Text>
                  </View>
                </View>

                {/* Boutons */}
                <View style={styles.buttonGroup}>
                  <TouchableOpacity
                    style={[styles.saveButton, styles.cancelButtonStyle]}
                    onPress={handleCancelEdit}
                  >
                    <Text style={styles.cancelButtonText}>Annuler</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSaveEdit}
                  >
                    <Text style={styles.saveButtonText}>Sauvegarder</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal d'information */}
      <Modal
        visible={infoReminder !== null}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.infoModalOverlay}>
          <View style={styles.infoModalContent}>
            {infoReminder && (
              <ScrollView showsVerticalScrollIndicator={true}>
                <View style={styles.infoModalHeader}>
                  <Text style={styles.infoModalTitle}>Détails du médicament</Text>
                  <TouchableOpacity onPress={() => setInfoReminder(null)}>
                    <Text style={styles.closeButton}>✕</Text>
                  </TouchableOpacity>
                </View>

                {/* Card principale avec nom et dosage */}
                <View style={styles.infoMainCard}>
                  <Text style={styles.infoMainTitle}>{infoReminder.nom}</Text>
                  <Text style={styles.infoMainSubtitle}>{infoReminder.dosage}</Text>
                </View>

                {/* Sections d'infos */}
                <View style={styles.infoSectionGroup}>
                  <View style={styles.infoSection}>
                    <Text style={styles.infoIcon}>💊</Text>
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Quantité</Text>
                      <Text style={styles.infoValue}>{infoReminder.quantity}</Text>
                    </View>
                  </View>

                  <View style={styles.infoSection}>
                    <Text style={styles.infoIcon}>⏱</Text>
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Durée</Text>
                      <Text style={styles.infoValue}>{infoReminder.duration}</Text>
                    </View>
                  </View>

                  <View style={styles.infoSection}>
                    <Text style={styles.infoIcon}>✓</Text>
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Statut</Text>
                      <Text style={styles.infoValue}>
                        {infoReminder.completed ? '✓ Complété' : '⊙ En cours'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Description */}
                <View style={styles.infoDescriptionSection}>
                  <Text style={styles.infoDescriptionTitle}>À propos de ce médicament</Text>
                  <Text style={styles.infoDescription}>{infoReminder.description}</Text>
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
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
    marginVertical: 16,
    textAlign: 'center',
  },

  headerBackContainer: {
    position: 'relative',
    alignItems: 'center',
    marginVertical: 16,
    paddingHorizontal: 12,
  },

  backButtonContainer: {
    position: 'absolute',
    left: 0,
    top: 16,
  },

  backButton: {
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '600',
  },

  headerBack: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    paddingHorizontal: 12,
  },

  /* =========================
     Styles des ordonnances
  ========================= */
  prescriptionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#efefefff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginVertical: 12,
    marginHorizontal: 'auto',
    width: '90%',
    maxWidth: 500,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },

  prescriptionContent: {
    flex: 1,
  },

  prescriptionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000ff',
    marginBottom: 4,
  },

  prescriptionDate: {
    fontSize: 13,
    color: '#000000ff',
    marginBottom: 6,
  },

  medicamentCount: {
    fontSize: 12,
    color: '#000000ff',
    fontWeight: '600',
    
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
  },

  editPrescriptionButton: {
    padding: 4,
    marginHorizontal: 4,
  },

  prescriptionClickArea: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },

  arrowIcon: {
    fontSize: 28,
    color: '#94A3B8',
  },

  arrowIconExpanded: {
    color: '#3B82F6',
    fontWeight: '700',
  },

  /* =========================
     Styles des cartes (médicaments)
  ========================= */
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginHorizontal: 0,
    marginVertical: 8,
    width: '100%',
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  circle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#94A3B8',
    marginRight: 12,
  },

  content: {
    flex: 1,
  },

  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },

  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },

  actions: {
    flexDirection: 'row',
    gap: 8,
  },

  actionButton: {
    padding: 4,
  },

  infoButton: {
    padding: 4,
  },

  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },

  meta: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },

  /* =========================
     Styles des modals
  ========================= */
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },

  infoModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },

  infoModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '90%',
    maxWidth: 420,
    maxHeight: '80%',
    paddingHorizontal: 20,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },

  infoModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },

  infoModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },

  closeButton: {
    fontSize: 28,
    color: '#8E8E93',
  },

  /* =========================
     Styles des formulaires
  ========================= */
  formGroup: {
    marginBottom: 16,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 8,
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

  editableInput: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    paddingHorizontal: 0,
  },

  inputWithUnit: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
  },

  unit: {
    marginLeft: 8,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },

  readOnlyInput: {
    backgroundColor: '#F1F5F9',
  },

  readOnlyText: {
    color: '#64748B',
  },

  descriptionText: {
    lineHeight: 20,
  },

  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 20,
  },

  saveButton: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  cancelButtonStyle: {
    backgroundColor: '#E2E8F0',
  },

  cancelButtonText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '700',
  },

  /* =========================
     Styles des infos
  ========================= */
  infoMainCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#0F172A',
  },

  infoMainTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },

  infoMainSubtitle: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '600',
  },

  infoSectionGroup: {
    marginBottom: 24,
    gap: 12,
  },

  infoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    marginBottom: 0,
  },

  infoIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },

  infoContent: {
    flex: 1,
  },

  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  infoValue: {
    fontSize: 15,
    color: '#0F172A',
    lineHeight: 22,
    fontWeight: '500',
  },

  infoDescriptionSection: {
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
  },

  infoDescriptionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  infoDescription: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    fontWeight: '400',
  },

  modalHeader: {
    marginBottom: 16,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },

  /* =========================
     Styles du menu déroulant
  ========================= */
  medicamentsDropdown: {
    backgroundColor: '#F0F4F8',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginVertical: 0,
    marginHorizontal: 'auto',
    width: '90%',
    maxWidth: 500,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#E2E8F0',
  },
});
