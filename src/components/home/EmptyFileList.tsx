// src/features/vault/components/EmptyFilesList.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export function EmptyFilesList() {
  return (
    <View style={styles.container}>
      {/* Icono */}
      <View style={styles.iconContainer}>
        <Ionicons name="cloud-upload-outline" size={64} color="#9CA3AF" />
      </View>

      {/* Título */}
      <Text style={styles.title}>Aún no has subido archivos</Text>

      {/* Descripción */}
      <Text style={styles.description}>
        Guarda documentos importantes, fotos y videos de forma segura en tu bóveda digital
      </Text>

      {/* Lista de tipos aceptados */}
      <View style={styles.typesContainer}>
        <Text style={styles.typesTitle}>Puedes subir:</Text>
        <View style={styles.typesList}>
          <TypeItem icon="image" text="Fotos y videos" />
          <TypeItem icon="document-text" text="PDFs y documentos" />
          <TypeItem icon="musical-notes" text="Audio" />
        </View>
      </View>

      {/* Nota */}
      <Text style={styles.note}>Toca el botón + abajo para comenzar</Text>
    </View>
  );
}

/**
 * Item de tipo de archivo
 */
function TypeItem({ icon, text }: { icon: any; text: string }) {
  return (
    <View style={styles.typeItem}>
      <Ionicons name={icon} size={16} color="#6B7280" />
      <Text style={styles.typeText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  typesContainer: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  typesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  typesList: {
    gap: 8,
  },
  typeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeText: {
    fontSize: 14,
    color: '#6B7280',
  },
  note: {
    fontSize: 13,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
});
