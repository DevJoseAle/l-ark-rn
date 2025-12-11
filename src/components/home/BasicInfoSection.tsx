// src/components/campaign/BasicInfoSection.tsx
import React from 'react';
import {
  View,
  Text,
  TextInput,
  Switch,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useCreateCampaignStore } from '@/src/stores/createCampaign.store';
import { useTranslation } from 'react-i18next';


export const BasicInfoSection = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t: translate } = useTranslation("common");
  
  const {
    formData,
    setTitle,
    setDescription,
    setHasDiagnosis,
    errors,
  } = useCreateCampaignStore();

  // Encontrar errores específicos
  const titleError = errors.find((e) => e.field === 'title');
  const descriptionError = errors.find((e) => e.field === 'description');

  return (
    <View style={styles.container}>
      {/* TÍTULO */}
      <View style={[styles.card, { 
        backgroundColor: colorScheme === 'dark' 
          ? 'rgba(30, 42, 54, 0.7)' 
          : 'rgba(251, 252, 251, 0.7)',
        borderColor: colorScheme === 'dark'
          ? 'rgba(42, 63, 84, 0.5)'
          : 'rgba(172, 202, 231, 0.3)',
      }]}>
        <View style={styles.labelContainer}>
          <Text style={[styles.label, { color: colors.text }]}>
            {translate("private.createCampaign.titleLabel")}
          </Text>
          <Text style={[styles.required, { color: colors.error }]}> *</Text>
        </View>

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colorScheme === 'dark'
                ? 'rgba(34, 51, 68, 0.5)'
                : 'rgba(214, 228, 245, 0.3)',
              color: colors.text,
              borderColor: titleError ? colors.error : 'transparent',
            },
          ]}
          placeholder={translate("private.createCampaign.titlePlaceholder")}
          placeholderTextColor={colors.secondaryText}
          value={formData.title}
          onChangeText={setTitle}
          maxLength={100}
        />

        {/* Contador de caracteres */}
        <View style={styles.footer}>
          <Text
            style={[
              styles.charCounter,
              {
                color:
                  formData.title.length >= 12
                    ? colors.success
                    : colors.secondaryText,
              },
            ]}
          >
            {translate("private.createCampaign.titleMinChars", { count: formData.title.length })}
          </Text>
        </View>

        {/* Error message */}
        {titleError && (
          <Text style={[styles.errorText, { color: colors.error }]}>
            {titleError.message}
          </Text>
        )}
      </View>

      {/* DESCRIPCIÓN */}
      <View style={[styles.card, { 
        backgroundColor: colorScheme === 'dark' 
          ? 'rgba(30, 42, 54, 0.7)' 
          : 'rgba(251, 252, 251, 0.7)',
        borderColor: colorScheme === 'dark'
          ? 'rgba(42, 63, 84, 0.5)'
          : 'rgba(172, 202, 231, 0.3)',
      }]}>
        <Text style={[styles.label, { color: colors.text }]}>
          {translate("private.createCampaign.descriptionLabel")}
        </Text>

        <TextInput
          style={[
            styles.textArea,
            {
              backgroundColor: colorScheme === 'dark'
                ? 'rgba(34, 51, 68, 0.5)'
                : 'rgba(214, 228, 245, 0.3)',
              color: colors.text,
              borderColor: descriptionError ? colors.error : 'transparent',
            },
          ]}
          placeholder={translate("private.createCampaign.descriptionPlaceholder")}
          placeholderTextColor={colors.secondaryText}
          value={formData.description}
          onChangeText={setDescription}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          maxLength={500}
        />

        {/* Contador de caracteres */}
        <View style={styles.footer}>
          <Text
            style={[
              styles.charCounter,
              {
                color:
                  formData.description.length >= 90
                    ? colors.success
                    : colors.secondaryText,
              },
            ]}
          >
            {translate("private.createCampaign.descriptionMinChars", { count: formData.description.length })}
          </Text>
        </View>

        {/* Error message */}
        {descriptionError && (
          <Text style={[styles.errorText, { color: colors.error }]}>
            {descriptionError.message}
          </Text>
        )}
      </View>

      {/* TOGGLE DE DIAGNÓSTICO */}
      <View style={[styles.card, styles.toggleCard, { 
        backgroundColor: colorScheme === 'dark' 
          ? 'rgba(30, 42, 54, 0.7)' 
          : 'rgba(251, 252, 251, 0.7)',
        borderColor: colorScheme === 'dark'
          ? 'rgba(42, 63, 84, 0.5)'
          : 'rgba(172, 202, 231, 0.3)',
      }]}>
        <View style={styles.toggleContent}>
          <Ionicons
            name="medkit-outline"
            size={24}
            color={colors.primary}
            style={styles.toggleIcon}
          />
          <Text style={[styles.toggleLabel, { color: colors.text }]}>
            {translate("private.createCampaign.diagnosisToggleLabel")}
          </Text>
        </View>

        <Switch
          value={formData.hasDiagnosis}
          onValueChange={setHasDiagnosis}
          trackColor={{ 
            false: colors.separator, 
            true: colors.primary 
          }}
          thumbColor={formData.hasDiagnosis ? colors.customWhite : colors.icon}
          ios_backgroundColor={colors.separator}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
    paddingHorizontal: 16,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  labelContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
  required: {
    fontSize: 15,
    fontWeight: '600',
  },
  input: {
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
  },
  textArea: {
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    minHeight: 120,
    borderWidth: 1,
  },
  footer: {
    marginTop: 8,
    alignItems: 'flex-end',
  },
  charCounter: {
    fontSize: 13,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 13,
    marginTop: 6,
    fontWeight: '500',
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  toggleIcon: {
    marginRight: 12,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
});