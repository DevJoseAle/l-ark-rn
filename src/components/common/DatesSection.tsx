// src/components/campaign/DatesSection.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Platform,
  Pressable,
  Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useCreateCampaignStore } from '@/src/stores/createCampaign.store';
import { Formatters } from '@/src/utils/formatters';

type PickerType = 'start' | 'end' | null;

export const DatesSection = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const { formData, setStartDate, setEndDate, errors } = useCreateCampaignStore();

  // Estado unificado para controlar qué picker está abierto
  const [activePicker, setActivePicker] = useState<PickerType>(null);
  const [tempDate, setTempDate] = useState<Date>(new Date());

  // Encontrar errores
  const startDateError = errors.find((e) => e.field === 'startDate');
  const endDateError = errors.find((e) => e.field === 'endDate');

  // Calcular duración
  const duration = Formatters.getDurationInMonths(formData.startDate, formData.endDate);

  // Abrir picker de inicio
  const openStartPicker = () => {
    setTempDate(formData.startDate);
    setActivePicker('start');
  };

  // Abrir picker de fin
  const openEndPicker = () => {
    setTempDate(formData.endDate);
    setActivePicker('end');
  };

  // Confirmar selección
  const handleConfirm = () => {
    if (activePicker === 'start') {
      setStartDate(tempDate);
    } else if (activePicker === 'end') {
      setEndDate(tempDate);
    }
    setActivePicker(null);
  };

  // Cancelar selección
  const handleCancel = () => {
    setActivePicker(null);
  };

  // Handler para Android (selección directa)
  const handleAndroidDateChange = (event: any, selectedDate?: Date) => {
    if (event.type === 'dismissed') {
      setActivePicker(null);
      return;
    }

    if (selectedDate) {
      if (activePicker === 'start') {
        setStartDate(selectedDate);
      } else if (activePicker === 'end') {
        setEndDate(selectedDate);
      }
    }
    setActivePicker(null);
  };

  // Handler para iOS (cambio temporal)
  const handleIOSDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setTempDate(selectedDate);
    }
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.card,
          {
            backgroundColor:
              colorScheme === 'dark' ? 'rgba(30, 42, 54, 0.7)' : 'rgba(251, 252, 251, 0.7)',
            borderColor:
              colorScheme === 'dark' ? 'rgba(42, 63, 84, 0.5)' : 'rgba(172, 202, 231, 0.3)',
          },
        ]}
      >
        {/* HEADER */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Fechas:</Text>

        {/* FECHA DE INICIO */}
        <View style={styles.dateRow}>
          <Text style={[styles.label, { color: colors.text }]}>Fecha de inicio</Text>
          <TouchableOpacity
            style={[
              styles.dateButton,
              {
                backgroundColor:
                  colorScheme === 'dark' ? 'rgba(34, 51, 68, 0.5)' : 'rgba(214, 228, 245, 0.3)',
                borderColor: startDateError ? colors.error : 'transparent',
              },
            ]}
            onPress={openStartPicker}
          >
            <Text style={[styles.dateText, { color: colors.text }]}>
              {Formatters.formatDate(formData.startDate)}
            </Text>
            <Ionicons name="calendar-outline" size={18} color={colors.icon} />
          </TouchableOpacity>
        </View>

        {startDateError && (
          <Text style={[styles.errorText, { color: colors.error }]}>{startDateError.message}</Text>
        )}

        {/* FECHA DE FIN */}
        <View style={styles.dateRow}>
          <Text style={[styles.label, { color: colors.text }]}>Fecha de fin</Text>
          <TouchableOpacity
            style={[
              styles.dateButton,
              {
                backgroundColor:
                  colorScheme === 'dark' ? 'rgba(34, 51, 68, 0.5)' : 'rgba(214, 228, 245, 0.3)',
                borderColor: endDateError ? colors.error : 'transparent',
              },
            ]}
            onPress={openEndPicker}
          >
            <Text style={[styles.dateText, { color: colors.text }]}>
              {Formatters.formatDate(formData.endDate)}
            </Text>
            <Ionicons name="calendar-outline" size={18} color={colors.icon} />
          </TouchableOpacity>
        </View>

        {endDateError && (
          <Text style={[styles.errorText, { color: colors.error }]}>{endDateError.message}</Text>
        )}

        {/* DURACIÓN INFO */}
        {duration > 0 && (
          <View
            style={[
              styles.durationBadge,
              {
                backgroundColor:
                  duration >= 3 && duration <= 12 ? colors.success + '20' : colors.warning + '20',
              },
            ]}
          >
            <Ionicons
              name="time-outline"
              size={16}
              color={duration >= 3 && duration <= 12 ? colors.success : colors.warning}
            />
            <Text
              style={[
                styles.durationText,
                {
                  color: duration >= 3 && duration <= 12 ? colors.success : colors.warning,
                },
              ]}
            >
              Duración: {duration} {duration === 1 ? 'mes' : 'meses'}
            </Text>
          </View>
        )}
      </View>

      {/* MODAL PARA iOS */}
      {Platform.OS === 'ios' && activePicker !== null && (
        <Modal visible={true} transparent animationType="slide" onRequestClose={handleCancel}>
          <Pressable style={styles.modalOverlay} onPress={handleCancel}>
            <Pressable
              style={[
                styles.modalContent,
                {
                  backgroundColor:
                    colorScheme === 'dark' ? colors.cardBackground : colors.background,
                },
              ]}
              onPress={(e) => e.stopPropagation()}
            >
              {/* HEADER DEL MODAL */}
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={handleCancel} style={styles.modalButton}>
                  <Text style={[styles.modalButtonText, { color: colors.error }]}>Cancelar</Text>
                </TouchableOpacity>

                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {activePicker === 'start' ? 'Fecha de inicio' : 'Fecha de fin'}
                </Text>

                <TouchableOpacity onPress={handleConfirm} style={styles.modalButton}>
                  <Text style={[styles.modalButtonText, { color: colors.primary }]}>Confirmar</Text>
                </TouchableOpacity>
              </View>

              {/* DATE PICKER */}
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={handleIOSDateChange}
                minimumDate={activePicker === 'start' ? new Date() : formData.startDate}
                themeVariant={colorScheme!}
                style={styles.picker}
              />
            </Pressable>
          </Pressable>
        </Modal>
      )}

      {/* PICKER PARA ANDROID (comportamiento nativo) */}
      {Platform.OS === 'android' && activePicker !== null && (
        <DateTimePicker
          value={activePicker === 'start' ? formData.startDate : formData.endDate}
          mode="date"
          display="default"
          onChange={handleAndroidDateChange}
          minimumDate={activePicker === 'start' ? new Date() : formData.startDate}
        />
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
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
    borderWidth: 1,
  },
  dateText: {
    fontSize: 15,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 13,
    marginTop: -10,
    marginBottom: 12,
    fontWeight: '500',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    gap: 8,
    marginTop: 4,
  },
  durationText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34, // Safe area para iOS
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalButton: {
    minWidth: 80,
  },
  modalButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  picker: {
    width: '100%',
    height: 216,
  },
});
