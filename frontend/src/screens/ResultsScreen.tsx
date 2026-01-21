import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import type { Medication } from '../services/mistral';

interface ResultsScreenProps {
  medications: Medication[];
  doctor?: string;
  date?: string;
  patient?: string;
  rawResponse?: string;
}

export default function ResultsScreen({ 
  medications, 
  doctor, 
  date, 
  patient,
  rawResponse 
}: ResultsScreenProps) {
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
        
        {medications.map((med, index) => (
          <View key={index} style={styles.medCard}>
            <Text style={styles.medName}>💊 {med.name}</Text>
            <Text style={styles.medDetail}>Dosage: {med.dosage}</Text>
            <Text style={styles.medDetail}>Fréquence: {med.frequency}</Text>
            <Text style={styles.medDetail}>Durée: {med.duration}</Text>
            {med.instructions && (
              <Text style={styles.medInstructions}>ℹ️ {med.instructions}</Text>
            )}
          </View>
        ))}

        {/* Réponse brute pour debug */}
        {rawResponse && (
          <View style={styles.debugCard}>
            <Text style={styles.debugTitle}>🔍 Réponse brute (debug):</Text>
            <Text style={styles.debugText}>{rawResponse}</Text>
          </View>
        )}
      </ScrollView>
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
  medCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
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
});
