// src/components/campaign/ConfigurationSection.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,

  Pressable,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CreateCampaignFormData } from '@/src/types/campaign-create.types';
import { Colors } from '@/constants/theme';
import { useCreateCampaignStore } from '@/src/stores/createCampaign.store';


type VisibilityOption = CreateCampaignFormData['visibility'];
type DistributionOption = CreateCampaignFormData['distributionRule'];

interface Option<T> {
  value: T;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const VISIBILITY_OPTIONS: Option<VisibilityOption>[] = [
  {
    value: 'public',
    label: 'Pública',
    description: 'Visible para todos los usuarios',
    icon: 'globe-outline',
  },
  {
    value: 'private',
    label: 'Privada',
    description: 'Solo visible con enlace directo',
    icon: 'lock-closed-outline',
  },
];

const DISTRIBUTION_OPTIONS: Option<DistributionOption>[] = [
  {
    value: 'percentage',
    label: 'Porcentaje',
    description: 'Distribuir por porcentajes (debe sumar 100%)',
    icon: 'pie-chart-outline',
  },
  {
    value: 'fixed_parts',
    label: 'Partes fijas',
    description: 'Cada beneficiario recibe partes iguales',
    icon: 'grid-outline',
  },
];

type PickerType = 'visibility' | 'distribution' | null;

export const ConfigurationSection = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const { formData, setVisibility, setDistributionRule } = useCreateCampaignStore();

  const [activePicker, setActivePicker] = useState<PickerType>(null);

  // Encontrar labels actuales
  const visibilityLabel =
    VISIBILITY_OPTIONS.find((o) => o.value === formData.visibility)?.label || 'Pública';
  const distributionLabel =
    DISTRIBUTION_OPTIONS.find((o) => o.value === formData.distributionRule)?.label ||
    'Porcentaje';

  // Handlers
  const handleVisibilitySelect = (value: VisibilityOption) => {
    setVisibility(value);
    setActivePicker(null);
  };

  const handleDistributionSelect = (value: DistributionOption) => {
    setDistributionRule(value);
    setActivePicker(null);
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.card,
          {
            backgroundColor:
              colorScheme === 'dark'
                ? 'rgba(30, 42, 54, 0.7)'
                : 'rgba(251, 252, 251, 0.7)',
            borderColor:
              colorScheme === 'dark'
                ? 'rgba(42, 63, 84, 0.5)'
                : 'rgba(172, 202, 231, 0.3)',
          },
        ]}
      >
        {/* HEADER */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Configuración
        </Text>

        {/* VISIBILIDAD */}
        <View style={styles.optionGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Visibilidad</Text>
          <TouchableOpacity
            style={[
              styles.optionButton,
              {
                backgroundColor:
                  colorScheme === 'dark'
                    ? 'rgba(34, 51, 68, 0.5)'
                    : 'rgba(214, 228, 245, 0.3)',
              },
            ]}
            onPress={() => setActivePicker('visibility')}
          >
            <Text style={[styles.optionText, { color: colors.text }]}>
              {visibilityLabel}
            </Text>
            <Ionicons name="chevron-down" size={18} color={colors.icon} />
          </TouchableOpacity>
        </View>

        {/* REGLA DE DISTRIBUCIÓN */}
        <View style={styles.optionGroup}>
          <Text style={[styles.label, { color: colors.text }]}>
            Regla de distribución
          </Text>
          <TouchableOpacity
            style={[
              styles.optionButton,
              {
                backgroundColor:
                  colorScheme === 'dark'
                    ? 'rgba(34, 51, 68, 0.5)'
                    : 'rgba(214, 228, 245, 0.3)',
              },
            ]}
            onPress={() => setActivePicker('distribution')}
          >
            <Text style={[styles.optionText, { color: colors.text }]}>
              {distributionLabel}
            </Text>
            <Ionicons name="chevron-down" size={18} color={colors.icon} />
          </TouchableOpacity>
        </View>
      </View>

      {/* MODAL PARA VISIBILIDAD */}
      {activePicker === 'visibility' && (
        <Modal
          visible={true}
          transparent
          animationType="fade"
          onRequestClose={() => setActivePicker(null)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setActivePicker(null)}>
            <Pressable
              style={[
                styles.modalContent,
                {
                  backgroundColor:
                    colorScheme === 'dark'
                      ? colors.cardBackground
                      : colors.background,
                },
              ]}
              onPress={(e) => e.stopPropagation()}
            >
              {/* HEADER */}
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  Visibilidad
                </Text>
                <TouchableOpacity onPress={() => setActivePicker(null)}>
                  <Ionicons name="close" size={24} color={colors.icon} />
                </TouchableOpacity>
              </View>

              {/* OPCIONES */}
              {VISIBILITY_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.modalOption,
                    {
                      backgroundColor:
                        formData.visibility === option.value
                          ? colors.primary + '20'
                          : 'transparent',
                    },
                  ]}
                  onPress={() => handleVisibilitySelect(option.value)}
                >
                  <View style={styles.optionContent}>
                    <View
                      style={[
                        styles.iconContainer,
                        {
                          backgroundColor:
                            formData.visibility === option.value
                              ? colors.primary
                              : colors.separator,
                        },
                      ]}
                    >
                      <Ionicons
                        name={option.icon}
                        size={20}
                        color={
                          formData.visibility === option.value
                            ? colors.customWhite
                            : colors.icon
                        }
                      />
                    </View>
                    <View style={styles.optionTextContainer}>
                      <Text style={[styles.optionLabel, { color: colors.text }]}>
                        {option.label}
                      </Text>
                      <Text
                        style={[styles.optionDescription, { color: colors.secondaryText }]}
                      >
                        {option.description}
                      </Text>
                    </View>
                  </View>
                  {formData.visibility === option.value && (
                    <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </Pressable>
          </Pressable>
        </Modal>
      )}

      {/* MODAL PARA DISTRIBUCIÓN */}
      {activePicker === 'distribution' && (
        <Modal
          visible={true}
          transparent
          animationType="fade"
          onRequestClose={() => setActivePicker(null)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setActivePicker(null)}>
            <Pressable
              style={[
                styles.modalContent,
                {
                  backgroundColor:
                    colorScheme === 'dark'
                      ? colors.cardBackground
                      : colors.background,
                },
              ]}
              onPress={(e) => e.stopPropagation()}
            >
              {/* HEADER */}
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  Regla de distribución
                </Text>
                <TouchableOpacity onPress={() => setActivePicker(null)}>
                  <Ionicons name="close" size={24} color={colors.icon} />
                </TouchableOpacity>
              </View>

              {/* OPCIONES */}
              {DISTRIBUTION_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.modalOption,
                    {
                      backgroundColor:
                        formData.distributionRule === option.value
                          ? colors.primary + '20'
                          : 'transparent',
                    },
                  ]}
                  onPress={() => handleDistributionSelect(option.value)}
                >
                  <View style={styles.optionContent}>
                    <View
                      style={[
                        styles.iconContainer,
                        {
                          backgroundColor:
                            formData.distributionRule === option.value
                              ? colors.primary
                              : colors.separator,
                        },
                      ]}
                    >
                      <Ionicons
                        name={option.icon}
                        size={20}
                        color={
                          formData.distributionRule === option.value
                            ? colors.customWhite
                            : colors.icon
                        }
                      />
                    </View>
                    <View style={styles.optionTextContainer}>
                      <Text style={[styles.optionLabel, { color: colors.text }]}>
                        {option.label}
                      </Text>
                      <Text
                        style={[styles.optionDescription, { color: colors.secondaryText }]}
                      >
                        {option.description}
                      </Text>
                    </View>
                  </View>
                  {formData.distributionRule === option.value && (
                    <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 16,
  },
  optionGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 8,
  },
  optionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
  },
  optionText: {
    fontSize: 15,
    fontWeight: '500',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTextContainer: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 13,
  },
});