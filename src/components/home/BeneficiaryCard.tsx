// src/components/campaign/BeneficiaryCard.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Image,
  Modal,
  Pressable,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '@/constants/theme';
import { ImageUploadService } from '@/src/services/imageUpload.service';
import { useCreateCampaignStore } from '@/src/stores/createCampaign.store';
import { CampaignBeneficiary, LocalImage } from '@/src/types/campaign-create.types';

interface BeneficiaryCardProps {
  beneficiary: CampaignBeneficiary;
}

export const BeneficiaryCard: React.FC<BeneficiaryCardProps> = ({ beneficiary }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const {
    formData,
    removeBeneficiary,
    updateBeneficiaryShare,
    addBeneficiaryDocument,
    removeBeneficiaryDocument,
  } = useCreateCampaignStore();

  const [showSharePicker, setShowSharePicker] = useState(false);
  const [shareInput, setShareInput] = useState(beneficiary.shareValue.toString());

  // Handler para cambiar porcentaje/partes
  const handleShareChange = (text: string) => {
    setShareInput(text);
    const value = parseFloat(text) || 0;
    updateBeneficiaryShare(beneficiary.id, value);
  };

  // Handler para eliminar beneficiario
  const handleRemove = () => {
    Alert.alert(
      'Eliminar beneficiario',
      `¿Estás seguro de eliminar a ${beneficiary.user.display_name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => removeBeneficiary(beneficiary.id),
        },
      ]
    );
  };

  // Handler para agregar documento
  const handleAddDocument = async () => {
    try {
      if (beneficiary.documents.length >= 3) {
        Alert.alert('Límite alcanzado', 'Solo puedes agregar 3 documentos por beneficiario.');
        return;
      }

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos necesarios', 'Necesitamos acceso a tu galería.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (result.canceled) return;

      const asset = result.assets[0];

      // Obtener tamaño del archivo
      const fileSize = await ImageUploadService.getFileSize(asset.uri);

      // Extraer nombre del archivo
      const fileName = asset.uri.split('/').pop() || `image_${Date.now()}.jpg`;

      // Crear objeto LocalImage
      const localImage: LocalImage = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        uri: asset.uri,
        name: fileName, // ✅ Agregamos name
        type: asset.mimeType || 'image/jpeg',
        size: fileSize,
        width: asset.width,
        height: asset.height,
      };
      const validation = ImageUploadService.validateImage(localImage);
      if (!validation.valid) {
        Alert.alert('Error', validation.error || 'Imagen inválida');
        return;
      }

      addBeneficiaryDocument(beneficiary.id, localImage);
    } catch (error) {
      console.error('Error adding document:', error);
      Alert.alert('Error', 'No se pudo cargar el documento.');
    }
  };

  // Handler para eliminar documento
  const handleRemoveDocument = (documentId: string) => {
    Alert.alert('Eliminar documento', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => removeBeneficiaryDocument(beneficiary.id, documentId),
      },
    ]);
  };

  // Cambiar tipo de participación
  const handleChangeShareType = (type: 'percentage' | 'fixed') => {
    // Esto debería actualizar el tipo, pero por ahora está ligado a distributionRule global
    setShowSharePicker(false);
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor:
            colorScheme === 'dark' ? 'rgba(10, 21, 33, 0.5)' : 'rgba(10, 21, 33, 0.8)',
        },
      ]}
    >
      {/* HEADER */}
      <View style={styles.header}>
        {/* Avatar */}
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={[styles.avatarText, { color: colors.customWhite }]}>
            {beneficiary.user.display_name.substring(0, 2).toUpperCase()}
          </Text>
        </View>

        {/* Info */}
        <View style={styles.info}>
          <View style={styles.nameContainer}>
            <Text style={styles.name}>{beneficiary.user.display_name}</Text>
            {beneficiary.user.kyc_status === 'kyc_verified' && (
              <Ionicons name="checkmark-circle" size={14} color={colors.success} />
            )}
          </View>
          <Text style={styles.email}>{beneficiary.user.email}</Text>
        </View>

        {/* Remove Button */}
        <TouchableOpacity
          style={[styles.removeButton, { backgroundColor: colors.error }]}
          onPress={handleRemove}
        >
          <Ionicons name="close" size={18} color={colors.customWhite} />
        </TouchableOpacity>
      </View>

      {/* SHARE SECTION */}
      <View style={styles.shareSection}>
        <Text style={styles.shareLabel}>Tipo de participación</Text>
        <View style={styles.shareRow}>
          <TouchableOpacity
            style={[
              styles.shareTypeButton,
              {
                backgroundColor:
                  colorScheme === 'dark' ? 'rgba(34, 51, 68, 0.5)' : 'rgba(214, 228, 245, 0.3)',
              },
            ]}
            onPress={() => setShowSharePicker(true)}
          >
            <Text style={[styles.shareTypeText, { color: colors.customWhite }]}>
              {formData.distributionRule === 'percentage' ? 'Porcentaje' : 'Partes fijas'}
            </Text>
            <Ionicons name="chevron-down" size={16} color="rgba(255, 255, 255, 0.6)" />
          </TouchableOpacity>

          <View
            style={[
              styles.shareInput,
              {
                backgroundColor:
                  colorScheme === 'dark' ? 'rgba(34, 51, 68, 0.5)' : 'rgba(214, 228, 245, 0.3)',
              },
            ]}
          >
            <TextInput
              style={styles.shareInputText}
              value={shareInput}
              onChangeText={handleShareChange}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
            />
            <Text style={styles.shareUnit}>
              {formData.distributionRule === 'percentage' ? '%' : ''}
            </Text>
          </View>
        </View>
      </View>

      {/* DOCUMENTS SECTION */}
      <View style={styles.documentsSection}>
        <View style={styles.documentsHeader}>
          <Text style={styles.documentsLabel}>Documentos de relación</Text>
          <Text style={[styles.documentsCounter, { color: colors.secondaryText }]}>
            {beneficiary.documents.length}/3
          </Text>
        </View>

        {/* Documents Grid */}
        <View style={styles.documentsGrid}>
          {beneficiary.documents.map((doc) => (
            <View key={doc.id} style={styles.documentCard}>
              <Image source={{ uri: doc.uri }} style={styles.documentImage} />
              <TouchableOpacity
                style={[styles.removeDocButton, { backgroundColor: colors.error }]}
                onPress={() => handleRemoveDocument(doc.id)}
              >
                <Ionicons name="close" size={12} color={colors.customWhite} />
              </TouchableOpacity>
            </View>
          ))}

          {/* Add Document Button */}
          {beneficiary.documents.length < 3 && (
            <TouchableOpacity
              style={[
                styles.addDocButton,
                {
                  backgroundColor:
                    colorScheme === 'dark' ? 'rgba(34, 51, 68, 0.5)' : 'rgba(214, 228, 245, 0.3)',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
              ]}
              onPress={handleAddDocument}
            >
              <Ionicons name="document-outline" size={24} color="rgba(255, 255, 255, 0.6)" />
              <Text style={styles.addDocText}>Agregar documento</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* MODAL PARA CAMBIAR TIPO (aunque está bloqueado por distributionRule) */}
      <Modal
        visible={showSharePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSharePicker(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowSharePicker(false)}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: colorScheme === 'dark' ? colors.cardBackground : colors.background,
              },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>Tipo de participación</Text>
            <Text style={[styles.modalDescription, { color: colors.secondaryText }]}>
              Este valor está definido globalmente en la configuración de la campaña.
            </Text>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowSharePicker(false)}
            >
              <Text style={[styles.modalButtonText, { color: colors.customWhite }]}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
  },
  info: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  email: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareSection: {
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  shareLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
  },
  shareRow: {
    flexDirection: 'row',
    gap: 12,
  },
  shareTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  shareTypeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  shareInput: {
    width: 100,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  shareInputText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'right',
  },
  shareUnit: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginLeft: 4,
  },
  documentsSection: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  documentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  documentsLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  documentsCounter: {
    fontSize: 12,
    fontWeight: '600',
  },
  documentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  documentCard: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  documentImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeDocButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addDocButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  addDocText: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 10,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
