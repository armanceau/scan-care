import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { getAuth } from 'firebase/auth';
import type { StoredPrescription } from '../services/firebase';
import { getUserPrescriptions, deletePrescriptionFromFirestore } from '../services/firebase';

export default function PrescriptionsHistoryScreen() {
  const [prescriptions, setPrescriptions] = useState<(StoredPrescription & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const loadPrescriptions = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Erreur', 'Vous devez être connecté');
        return;
      }

      setLoading(true);
      const data = await getUserPrescriptions(user.uid);
      setPrescriptions(data.sort((a, b) => b.prescriptionDate.toMillis() - a.prescriptionDate.toMillis()));
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert('Erreur', 'Impossible de charger les ordonnances');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (prescriptionId: string, patientName?: string) => {
    Alert.alert(
      'Supprimer l\'ordonnance',
      `Êtes-vous sûr de vouloir supprimer l'ordonnance ${patientName ? `de ${patientName}` : ''}?`,
      [
        { text: 'Annuler', onPress: () => {}, style: 'cancel' },
        {
          text: 'Supprimer',
          onPress: async () => {
            try {
              await deletePrescriptionFromFirestore(prescriptionId);
              setPrescriptions(prescriptions.filter(p => p.id !== prescriptionId));
              Alert.alert('Succès', 'Ordonnance supprimée');
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer l\'ordonnance');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📚 Historique des ordonnances</Text>
        <TouchableOpacity onPress={loadPrescriptions}>
          <Text style={styles.refreshButton}>🔄 Actualiser</Text>
        </TouchableOpacity>
      </View>

      {prescriptions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Aucune ordonnance enregistrée</Text>
          <Text style={styles.emptySubtext}>
            Commencez par scanner une ordonnance
          </Text>
        </View>
      ) : (
        <FlatList
          data={prescriptions}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardInfo}>
                  {item.patient && (
                    <Text style={styles.patientName}>👤 {item.patient}</Text>
                  )}
                  {item.date && (
                    <Text style={styles.date}>📅 {item.date}</Text>
                  )}
                  {item.doctor && (
                    <Text style={styles.doctor}>👨‍⚕️ {item.doctor}</Text>
                  )}
                </View>
                <Text style={styles.medCount}>💊 {item.medications.length}</Text>
              </View>

              {item.medications.length > 0 && (
                <View style={styles.medicationsPreview}>
                  <Text style={styles.previewTitle}>Médicaments:</Text>
                  {item.medications.slice(0, 2).map((med, idx) => (
                    <Text key={idx} style={styles.medPreview}>
                      • {med.name} ({med.dosage})
                    </Text>
                  ))}
                  {item.medications.length > 2 && (
                    <Text style={styles.moreText}>
                      +{item.medications.length - 2} autres...
                    </Text>
                  )}
                </View>
              )}

              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.viewBtn]}
                  onPress={() => {
                    // TODO: implémenter la vue détaillée
                    Alert.alert('Info', 'Détail non implémenté encore');
                  }}
                >
                  <Text style={styles.actionBtnText}>👁️ Voir</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, styles.deleteBtn]}
                  onPress={() => handleDelete(item.id, item.patient)}
                >
                  <Text style={styles.actionBtnText}>🗑️ Supprimer</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  refreshButton: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6B7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4F46E5',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  date: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 2,
  },
  doctor: {
    fontSize: 13,
    color: '#6B7280',
  },
  medCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  medicationsPreview: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  previewTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  medPreview: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 3,
  },
  moreText: {
    fontSize: 12,
    color: '#4F46E5',
    fontStyle: 'italic',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  viewBtn: {
    backgroundColor: '#DBEAFE',
  },
  deleteBtn: {
    backgroundColor: '#FEE2E2',
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
});
