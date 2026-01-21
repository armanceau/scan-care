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

/* =========================
   Component
========================= */
const ReminderList: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Reminder | null>(null);
  const [infoReminder, setInfoReminder] = useState<Reminder | null>(null);

  useEffect(() => {
    setReminders([
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
        dosage: '400 mg',
        dosageValue: '400',
        quantity: '1 comprimé(s)',
        quantityValue: '1',
        duration: '3 jours',
        durationValue: '3',
        completed: false,
        description: 'Médicament utilisé pour soulager la douleur et réduire la fièvre. L\'ibuprofène est un anti-inflammatoire non stéroïdien (AINS) qui aide à réduire l\'inflammation et l\'inconfort causés par diverses conditions.',
      },
    ]);
  }, []);

  const handleEdit = (id: string) => {
    const reminder = reminders.find((r) => r.id === id);
    if (reminder) {
      setEditingId(id);
      setEditForm({ ...reminder });
    }
  };

  const handleSaveEdit = () => {
    if (editForm) {
      setReminders((prev) =>
        prev.map((r) => {
          if (r.id === editingId) {
            return {
              ...editForm,
              dosage: `${editForm.dosageValue} mg`,
              quantity: `${editForm.quantityValue} comprimé(s)`,
              duration: `${editForm.durationValue} jours`,
            };
          }
          return r;
        })
      );
      setEditingId(null);
      setEditForm(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Supprimer',
      'Supprimer ce rappel ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () =>
            setReminders((prev) =>
              prev.filter((item) => item.id !== id)
            ),
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Reminder }) => (
    <View style={styles.card}>
      {/* Ligne du haut */}
      <View style={styles.topRow}>
        <TouchableOpacity
          style={[
            styles.circle,
            item.completed && styles.circleCompleted,
          ]}
        />

        <View style={styles.content}>
          <Text style={styles.medName}>
            {item.nom.toUpperCase()}
          </Text>
          <Text style={styles.dosage}>
            {item.dosage}
          </Text>
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
      <Text style={styles.headerTitle}>Mes rappels</Text>

      <FlatList
        data={reminders}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
      />

      {/* Modal d'édition */}
      <Modal
        visible={editingId !== null}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.infoModalOverlay}>
          <View style={styles.infoModalContent}>
            {editForm && (
              <ScrollView>
                {/* Header du modal */}
                <View style={styles.infoModalHeader}>
                  <Text style={styles.infoModalTitle}>Éditer le rappel</Text>
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

                {/* Bouton Sauvegarder */}
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveEdit}
                >
                  <Text style={styles.saveButtonText}>Sauvegarder</Text>
                </TouchableOpacity>
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
                  <Text style={styles.infoModalTitle}>Informations du médicament</Text>
                  <TouchableOpacity onPress={() => setInfoReminder(null)}>
                    <Text style={styles.closeButton}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.infoSection}>
                  <Text style={styles.infoLabel}>Nom</Text>
                  <Text style={styles.infoValue}>{infoReminder.nom}</Text>
                </View>

                <View style={styles.infoSection}>
                  <Text style={styles.infoLabel}>Dosage</Text>
                  <Text style={styles.infoValue}>{infoReminder.dosage}</Text>
                </View>

                <View style={styles.infoSection}>
                  <Text style={styles.infoLabel}>Quantité</Text>
                  <Text style={styles.infoValue}>{infoReminder.quantity}</Text>
                </View>

                <View style={styles.infoSection}>
                  <Text style={styles.infoLabel}>Durée</Text>
                  <Text style={styles.infoValue}>{infoReminder.duration}</Text>
                </View>

                <View style={styles.infoSection}>
                  <Text style={styles.infoLabel}>Statut</Text>
                  <Text style={styles.infoValue}>
                    {infoReminder.completed ? 'Complété' : 'En cours'}
                  </Text>
                </View>

                <View style={styles.infoSection}>
                  <Text style={styles.infoLabel}>Description</Text>
                  <Text style={styles.infoValue}>{infoReminder.description}</Text>
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

  card: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
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

  /* Modal Styles */
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  modalContent: {
    flex: 1,
    padding: 20,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },

  closeButton: {
    fontSize: 28,
    color: '#8E8E93',
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
  },

  readOnlyInput: {
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
  },

  readOnlyText: {
    fontSize: 16,
    color: '#64748b',
  },

  descriptionText: {
    lineHeight: 24,
  },

  inputWithUnit: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },

  inputSmall: {
    flex: 1,
    borderWidth: 0,
    paddingHorizontal: 0,
  },

  editableInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 0,
    fontSize: 16,
    color: '#000',
  },

  unit: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
    marginLeft: 8,
  },

  saveButton: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 20,
    shadowColor: '#0F172A',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  /* Info Modal Styles */
  infoModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  infoModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 420,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    maxHeight: '85%',
  },

  infoModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  infoModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },

  infoSection: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },

  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 6,
    letterSpacing: 0.3,
  },

  infoValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#0F172A',
    lineHeight: 22,
  },
});
