// src/components/campaign/AmountsSection.tsx
import { Colors } from '@/constants/theme';
import { useCreateCampaignStore } from '@/src/stores/createCampaign.store';
import { getCurrencyCode } from '@/src/types/campaign-create.types';
import { HARD_CAP_AMOUNTS_BY_COUNTRY, MAX_AMOUNTS_BY_COUNTRY, SOFT_CAP_AMOUNTS_BY_COUNTRY } from '@/src/utils/campaingConstants';
import { Formatters } from '@/src/utils/formatters';
import { fromUSDtoCurrencyString } from '@/src/utils/ratesUtils';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View
} from 'react-native';

export const AmountsSection = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const {
    formData,
    setGoalAmount,
    setSoftCap,
    setHardCap,
    errors,
    maxGoalAmount,
    minGoalAmount
  } = useCreateCampaignStore();
  const selectedCountry = formData.country;
  const minAndMaxAmountsGoal = () => `Entre ${Formatters.formatCLPInput((minGoalAmount()))} ${getCurrencyCode(selectedCountry)} y ${Formatters.formatCLPInput(maxGoalAmount())} ${getCurrencyCode(selectedCountry)}`
  const softCapPlaceholder = fromUSDtoCurrencyString(SOFT_CAP_AMOUNTS_BY_COUNTRY[selectedCountry], selectedCountry);
  const hardCapPlaceholder = fromUSDtoCurrencyString(HARD_CAP_AMOUNTS_BY_COUNTRY[selectedCountry], selectedCountry);
  const totalAmountPlaceholder = fromUSDtoCurrencyString(MAX_AMOUNTS_BY_COUNTRY[selectedCountry], selectedCountry);
  // Estado local para formateo
  const [goalDisplay, setGoalDisplay] = useState('');
  const [softCapDisplay, setSoftCapDisplay] = useState('');
  const [hardCapDisplay, setHardCapDisplay] = useState('');

  // Sincronizar con el store al montar
  useEffect(() => {
    if (formData.goalAmount) {
      setGoalDisplay(Formatters.formatCLPInput(formData.goalAmount));
    }
    if (formData.softCap) {
      setSoftCapDisplay(Formatters.formatCLPInput(formData.softCap));
    }
    if (formData.hardCap) {
      setHardCapDisplay(Formatters.formatCLPInput(formData.hardCap));
    }
  }, []);
  useEffect(() => {
    setGoalDisplay('')
    setSoftCapDisplay('')
    setHardCapDisplay('')
  }, [formData.country])

  // Handlers con formateo
  const handleGoalChange = (text: string) => {
    const cleaned = Formatters.unformatCLP(text);
setGoalDisplay(Formatters.formatCLPInput(cleaned));
    setGoalAmount(cleaned);
  };

  const handleSoftCapChange = (text: string) => {
    const cleaned = Formatters.unformatCLP(text);
    setSoftCapDisplay(Formatters.formatCLPInput(cleaned));
    setSoftCap(cleaned);
  };

  const handleHardCapChange = (text: string) => {
    const cleaned = Formatters.unformatCLP(text);
    setHardCapDisplay(Formatters.formatCLPInput(cleaned));
    setHardCap(cleaned);
  };

  // Encontrar errores
  const goalError = errors.find((e) => e.field === 'goalAmount');
  const softCapError = errors.find((e) => e.field === 'softCap');
  const hardCapError = errors.find((e) => e.field === 'hardCap');
  const actualCurrencyText = () => {
    switch (selectedCountry) {
      case 'US':
        return 'USD - Dólares Americanos';
      case 'CL':
        return 'CLP - Pesos Chilenos';
      case 'MX':
        return 'MXN - Pesos Mexicanos';
      case 'CO':
        return 'COP - Pesos Colombianos';
    }
  }
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
          Montos
        </Text>

        {/* META TOTAL */}
        <View style={styles.inputGroup}>
          <View style={styles.labelContainer}>
            <Text style={[styles.label, { color: colors.text }]}>
              Meta de recaudación
            </Text>
            <Text style={[styles.required, { color: colors.error }]}> *</Text>
          </View>
          <View>
            <Text style={[styles.hintText, { color: colors.secondaryText }]}>
              {minAndMaxAmountsGoal()}
            </Text>
          </View>
          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor:
                  colorScheme === 'dark'
                    ? 'rgba(34, 51, 68, 0.5)'
                    : 'rgba(214, 228, 245, 0.3)',
                borderColor: goalError ? colors.error : 'transparent',
              },
            ]}
          >
            <Ionicons
              name="cash-outline"
              size={20}
              color={colors.icon}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder={totalAmountPlaceholder}
              placeholderTextColor={colors.secondaryText}
              value={goalDisplay}
              onChangeText={handleGoalChange}
              keyboardType="numeric"
            />
          </View>

          {goalError && (
            <Text style={[styles.errorText, { color: colors.error }]}>
              {goalError.message}
            </Text>
          )}

          {selectedCountry !== 'US' && <Text style={[styles.hintText, { color: colors.secondaryText }]}>
            El cálculo se realiza en la moneda seleccionada a la tasa del momento
          </Text>}
        </View>

        {/* META MÍNIMA Y MEDIA EN ROW */}
        <View style={styles.row}>
          {/* META MÍNIMA */}
          <View style={styles.halfWidth}>
            <Text style={[styles.label, { color: colors.text }]}>
              Meta Mínima
            </Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor:
                    colorScheme === 'dark'
                      ? 'rgba(34, 51, 68, 0.5)'
                      : 'rgba(214, 228, 245, 0.3)',
                  borderColor: softCapError ? colors.error : 'transparent',
                },
              ]}
            >
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder={softCapPlaceholder}
                placeholderTextColor={colors.secondaryText}
                value={softCapDisplay}
                onChangeText={handleSoftCapChange}
                keyboardType="numeric"
              />
            </View>
            {softCapError && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {softCapError.message}
              </Text>
            )}
          </View>

          {/* META MEDIA */}
          <View style={styles.halfWidth}>
            <Text style={[styles.label, { color: colors.text }]}>
              Meta Media
            </Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor:
                    colorScheme === 'dark'
                      ? 'rgba(34, 51, 68, 0.5)'
                      : 'rgba(214, 228, 245, 0.3)',
                  borderColor: hardCapError ? colors.error : 'transparent',
                },
              ]}
            >
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder={hardCapPlaceholder}
                placeholderTextColor={colors.secondaryText}
                value={hardCapDisplay}
                onChangeText={handleHardCapChange}
                keyboardType="numeric"
              />
            </View>
            {hardCapError && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {hardCapError.message}
              </Text>
            )}
          </View>
        </View>

        {/* MONEDA */}
        <View style={styles.currencyContainer}>
          <Text style={[styles.label, { color: colors.text }]}>Moneda</Text>
          <View
            style={[
              styles.currencyButton,
              {
                backgroundColor:
                  colorScheme === 'dark'
                    ? 'rgba(34, 51, 68, 0.5)'
                    : 'rgba(214, 228, 245, 0.3)',
              },
            ]}
          >
            <Text style={[styles.currencyText, { color: colors.text }]}>
              {actualCurrencyText()}
            </Text>
          </View>
        </View>
      </View>
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
  inputGroup: {
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
  },
  required: {
    fontSize: 15,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
  },
  errorText: {
    fontSize: 13,
    marginTop: 6,
    fontWeight: '500',
  },
  hintText: {
    fontSize: 13,
    marginTop: 6,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  halfWidth: {
    flex: 1,
  },
  currencyContainer: {
    marginTop: 4,
  },
  currencyButton: {
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  currencyText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
