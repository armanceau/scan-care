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
  quantity: string;
  duration: string;
  completed: boolean;
}

/* =========================
   Component
========================= */
const ReminderList: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Reminder | null>(null);

  useEffect(() => {
    setReminders([
      {
        id: '1',
        nom: 'Ibuprofène',
        dosage: '400 mg',
        quantity: '1 comprimé',
        duration: '3 jours',
        completed: false,
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
        prev.map((r) => (r.id === editingId ? editForm : r))
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
            <Text style={styles.editText}>✏️</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDelete(item.id)}
          >
            <Text style={styles.deleteText}>🗑</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.infoButton}>
            <Svg width="20" height="20" viewBox="0 0 24 24">
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
        animationType="slide"
      >
        <SafeAreaView style={styles.modalContainer}>
          <ScrollView style={styles.modalContent}>
            {editForm && (
              <>
                {/* Header du modal */}
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Éditer le rappel</Text>
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
                    onChangeText={(text) =>
                      setEditForm({ ...editForm, nom: text })
                    }
                    placeholder="Entrez le nom"
                  />
                </View>

                {/* Dosage */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Dosage</Text>
                  <TextInput
                    style={styles.input}
                    value={editForm.dosage}
                    onChangeText={(text) =>
                      setEditForm({ ...editForm, dosage: text })
                    }
                    placeholder="Entrez le dosage"
                  />
                </View>

                {/* Quantité */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Quantité</Text>
                  <TextInput
                    style={styles.input}
                    value={editForm.quantity}
                    onChangeText={(text) =>
                      setEditForm({ ...editForm, quantity: text })
                    }
                    placeholder="Entrez la quantité"
                  />
                </View>

                {/* Durée */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Durée</Text>
                  <TextInput
                    style={styles.input}
                    value={editForm.duration}
                    onChangeText={(text) =>
                      setEditForm({ ...editForm, duration: text })
                    }
                    placeholder="Entrez la durée"
                  />
                </View>

                {/* Bouton Sauvegarder */}
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveEdit}
                >
                  <Text style={styles.saveButtonText}>Sauvegarder</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </SafeAreaView>
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
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
  },

  headerTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#000',
    marginVertical: 20,
    textAlign: 'center',
  },

  card: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    marginHorizontal: 200, 
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
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 0.4,
  },

  dosage: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 1,
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },

  actionButton: {
    paddingHorizontal: 6,
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
    fontSize: 13,
    color: '#8E8E93',
    marginRight: 16,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },

  input: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#000',
  },

  saveButton: {
    backgroundColor: '#000',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
