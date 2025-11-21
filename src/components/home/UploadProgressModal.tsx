// src/features/vault/components/UploadProgressModal.tsx

import React from 'react';
import { View, Text, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatBytes } from '@/src/utils/vaultUtils';

interface UploadProgressModalProps {
  visible: boolean;
  fileName: string;
  fileSize: number;
  isUploading: boolean;
  isSuccess: boolean;
  isError: boolean;
  errorMessage?: string;
}

/**
 * Modal que muestra el progreso de subida de archivos
 */
export function UploadProgressModal({
  visible,
  fileName,
  fileSize,
  isUploading,
  isSuccess,
  isError,
  errorMessage,
}: UploadProgressModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Icono de estado */}
          {isUploading && <ActivityIndicator size="large" color="#4BA3D9" />}

          {isSuccess && (
            <View style={styles.iconContainer}>
              <Ionicons name="checkmark-circle" size={64} color="#10B981" />
            </View>
          )}

          {isError && (
            <View style={styles.iconContainer}>
              <Ionicons name="close-circle" size={64} color="#EF4444" />
            </View>
          )}

          {/* Título */}
          <Text style={styles.title}>
            {isUploading && 'Subiendo archivo...'}
            {isSuccess && '¡Archivo subido!'}
            {isError && 'Error al subir'}
          </Text>

          {/* Descripción */}
          <Text style={styles.fileName} numberOfLines={1}>
            {fileName}
          </Text>

          <Text style={styles.fileSize}>{formatBytes(fileSize)}</Text>

          {/* Mensaje de error */}
          {isError && errorMessage && <Text style={styles.errorMessage}>{errorMessage}</Text>}

          {/* Mensaje de éxito */}
          {isSuccess && (
            <Text style={styles.successMessage}>Tu archivo se ha guardado en la bóveda</Text>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  fileName: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 4,
    textAlign: 'center',
  },
  fileSize: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 8,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 14,
    color: '#059669',
    textAlign: 'center',
    marginTop: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#DC2626',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});
