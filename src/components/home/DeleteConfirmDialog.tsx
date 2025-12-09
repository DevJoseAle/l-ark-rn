// src/components/home/DeleteConfirmDialog.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatBytes } from '@/src/utils/vaultUtils';
import { useTranslation } from 'react-i18next';

interface DeleteConfirmDialogProps {
  visible: boolean;
  file: any | null; // VaultFile
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmDialog({
  visible,
  file,
  isDeleting,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
  if (!file) return null;
  const {t:translate} = useTranslation("common")
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      {/* Overlay SIN BlurView */}
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="trash" size={48} color="#ff4444" />
          </View>

          {/* Title */}
          <Text style={styles.title}>{translate("modals.deleteDialog.title")}</Text>

          {/* Message */}
          <Text style={styles.message}>
           {translate("modals.deleteDialog.disclaimer")}
          </Text>

          {/* File info */}
          <View style={styles.fileInfo}>
            <Ionicons 
              name={
                file.file_type === 'image' ? 'image' :
                file.file_type === 'pdf' ? 'document-text' :
                file.file_type === 'video' ? 'videocam' :
                'document'
              } 
              size={20} 
              color="rgba(255,255,255,0.6)" 
            />
            <View style={styles.fileDetails}>
              <Text style={styles.fileName} numberOfLines={1}>
                {file.file_name}
              </Text>
              <Text style={styles.fileSize}>
                {formatBytes(file.file_size_bytes)}
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
              disabled={isDeleting}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>{translate("modals.deleteDialog.cancelButton")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.deleteButton]}
              onPress={onConfirm}
              disabled={isDeleting}
              activeOpacity={0.7}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Ionicons name="trash-outline" size={18} color="white" />
                  <Text style={styles.deleteButtonText}>{translate("modals.deleteDialog.deleteButton")}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // Fondo semi-transparente
  },
  container: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: 'rgba(30,30,30,0.95)',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,68,68,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  deleteButton: {
    backgroundColor: '#ff4444',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});