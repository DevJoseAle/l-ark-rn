// src/components/profile/DeleteAccountModal.tsx

import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/use-theme-color';

interface DeleteAccountModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
}

const DELETION_REASONS = [
  { value: 'user_requested', label: 'Simplemente quiero irme', icon: 'log-out-outline' },
  { value: 'privacy_concerns', label: 'Preocupaciones de privacidad', icon: 'shield-outline' },
  { value: 'not_using_app', label: 'Ya no uso la app', icon: 'time-outline' },
  { value: 'switching_platform', label: 'Voy a usar otra plataforma', icon: 'swap-horizontal-outline' },
  { value: 'too_complex', label: 'Es muy complicada', icon: 'construct-outline' },
  { value: 'missing_features', label: 'Falta alguna característica', icon: 'apps-outline' },
  { value: 'technical_issues', label: 'Problemas técnicos', icon: 'bug-outline' },
  { value: 'cost_concerns', label: 'Costo muy alto', icon: 'cash-outline' },
  { value: 'other', label: 'Otra razón', icon: 'ellipsis-horizontal-outline' },
];

export function DeleteAccountModal({ visible, onClose, onConfirm }: DeleteAccountModalProps) {
  const colors = useThemeColors();
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    if (!selectedReason) return;

    setIsDeleting(true);
    try {
      await onConfirm(selectedReason);
      // El componente padre manejará el cierre y navegación
    } catch (error) {
      console.error('Error en modal:', error);
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (isDeleting) return;
    setSelectedReason(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons name="warning" size={32} color="#EF4444" />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>
              ¿Por qué te vas? 😢
            </Text>
            <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
              Tu feedback nos ayuda a mejorar
            </Text>
          </View>

          {/* Reasons List */}
          <ScrollView 
            style={styles.reasonsList}
            showsVerticalScrollIndicator={false}
          >
            {DELETION_REASONS.map((reason) => (
              <TouchableOpacity
                key={reason.value}
                style={[
                  styles.reasonItem,
                  { 
                    backgroundColor: colors.info,
                    borderColor: selectedReason === reason.value ? 'red' : colors.border,
                  }
                ]}
                onPress={() => setSelectedReason(reason.value)}
                disabled={isDeleting}
                activeOpacity={0.7}
              >
                <View style={styles.reasonIcon}>
                  <Ionicons 
                    name={reason.icon as any} 
                    size={24} 
                    color={'white' } 
                  />
                </View>
                <Text style={[
                  styles.reasonText,
                  { color:'white' }
                ]}>
                  {reason.label}
                </Text>
                {selectedReason === reason.value && (
                  <Ionicons name="checkmark-circle" size={24} color="white" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Warning */}
          <View style={[styles.warningBox, { backgroundColor: '#FEF2F2' }]}>
            <Ionicons name="alert-circle" size={20} color="#EF4444" />
            <Text style={styles.warningText}>
              Esta acción es irreversible. Tu cuenta será eliminada permanentemente.
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[
                styles.confirmButton,
                !selectedReason && styles.confirmButtonDisabled
              ]}
              onPress={handleConfirm}
              disabled={!selectedReason || isDeleting}
              activeOpacity={0.8}
            >
              {isDeleting ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Ionicons name="trash-outline" size={20} color="#FFF" />
                  <Text style={styles.confirmButtonText}>
                    Eliminar Cuenta
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
              disabled={isDeleting}
              activeOpacity={0.8}
            >
              <Text style={[styles.cancelButtonText, { color: colors.secondaryText }]}>
                Cancelar
              </Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingBottom: 40,
    maxHeight: '85%',
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
  },
  reasonsList: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
  },
  reasonIcon: {
    marginRight: 12,
  },
  reasonText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 24,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#DC2626',
    lineHeight: 18,
  },
  actions: {
    paddingHorizontal: 24,
    gap: 12,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EF4444',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.6,
  },
  confirmButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFF',
  },
  cancelButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});