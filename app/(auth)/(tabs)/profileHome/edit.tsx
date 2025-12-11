// app/(auth)/(tabs)/profile/edit.tsx
// VERSIÓN CORREGIDA - country como string

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useProfileStore } from '../../../../src/stores/profile.store';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

// Tipo simple para los países
type CountryCode = 'US' | 'MX' | 'CO' | 'CL';


export default function EditProfileScreen() {
  const router = useRouter();
  const {t:translate} = useTranslation("common");
  const COUNTRIES: { code: CountryCode; name: string; flag: string }[] = [
    { code: 'US', name: translate("countries.US"), flag: '🇺🇸' },
    { code: 'MX', name: translate("countries.MX"), flag: '🇲🇽' },
    { code: 'CO', name: translate("countries.CO"), flag: '🇨🇴' },
    { code: 'CL', name: translate("countries.CL"), flag: '🇨🇱' },
  ];
  const { user, isUpdating, updateProfile } = useProfileStore();

  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(
    user?.country || null
  );
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.display_name);
      setSelectedCountry(user.country);
    }
  }, [user]);

  const handleSave = async () => {
    // Validation
    if (!displayName.trim()) {
      Alert.alert(translate("common.errorTitle"), translate("errors.kyc.name"));
      return;
    }

    if (displayName.trim().length < 2) {
      Alert.alert(translate("common.errorTitle"), translate("errors.kyc.nameLenght"));
      return;
    }

    if (!selectedCountry) {
      Alert.alert(translate("common.errorTitle"), translate("errors.kyc.countrySelected"));
      return;
    }

    // Check if anything changed
    if (
      displayName.trim() === user?.display_name &&
      selectedCountry === user?.country
    ) {
      Alert.alert('Sin cambios', 'No has realizado ningún cambio');
      return;
    }

    // Update profile
    const success = await updateProfile({
      display_name: displayName.trim(),
      country: selectedCountry,
    });

    if (success) {
      Alert.alert('Perfil actualizado', 'Tu perfil ha sido actualizado exitosamente', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } else {
      Alert.alert(translate("common.errorTitle"), translate("errors.kyc.editError"));
    }
  };

  const handleCancel = () => {
    if (
      displayName.trim() !== user?.display_name ||
      selectedCountry !== user?.country
    ) {
      Alert.alert(
        translate("errors.kyc.discardChangesTitle"),
        translate("errors.kyc.discardChangesMessage"),
        [
          {
            text: translate("errors.kyc.discardMessageButtonCancel"),
            style: 'cancel',
          },
          {
            text: translate("errors.kyc.discardMessageButtonDiscard"),
            style: 'destructive',
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>


      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleCancel}
            style={styles.headerButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={28} color="#1F2937" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>{translate("private.profile.editProfile")}</Text>

          <TouchableOpacity
            onPress={handleSave}
            style={[styles.headerButton, isUpdating && styles.headerButtonDisabled]}
            disabled={isUpdating}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={[styles.saveText, isUpdating && styles.saveTextDisabled]}>
              {isUpdating ? translate("private.profile.saving") : translate("private.profile.save")}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Display Name */}
          <View style={styles.section}>
            <Text style={styles.label}>{translate("common.name")}</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="person-outline"
                size={20}
                color="#9CA3AF"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Tu nombre"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="words"
                maxLength={50}
              />
              {displayName.length > 0 && (
                <TouchableOpacity onPress={() => setDisplayName('')}>
                  <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.hint}>
              {displayName.length}/50 {translate("private.profile.characters")}
            </Text>
          </View>

          {/* Email (readonly) */}
          <View style={styles.section}>
            <Text style={styles.label}>{translate("common.email")}</Text>
            <View style={[styles.inputContainer, styles.inputDisabled]}>
              <Ionicons
                name="mail-outline"
                size={20}
                color="#9CA3AF"
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, styles.inputTextDisabled]}
                value={user?.email}
                editable={false}
              />
              <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
            </View>
            <Text style={styles.hint}>
              {translate("private.profile.emailDisclaimer")}
            </Text>
          </View>

          {/* Country */}
          <View style={styles.section}>
            <Text style={styles.label}>{translate("common.country")}</Text>
            <TouchableOpacity
              style={styles.countrySelector}
              onPress={() => setShowCountryPicker(!showCountryPicker)}
              activeOpacity={0.7}
            >
              <View style={styles.countrySelectorLeft}>
                <Ionicons
                  name="earth-outline"
                  size={20}
                  color="#9CA3AF"
                  style={styles.inputIcon}
                />
                {selectedCountry ? (
                  <View style={styles.selectedCountryContainer}>
                    <Text style={styles.countryFlag}>
                      {COUNTRIES.find((c) => c.code === selectedCountry)?.flag}
                    </Text>
                    <Text style={styles.countryName}>
                      {COUNTRIES.find((c) => c.code === selectedCountry)?.name}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.placeholderText}>Selecciona tu país</Text>
                )}
              </View>
              <Ionicons
                name={showCountryPicker ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#9CA3AF"
              />
            </TouchableOpacity>

            {/* Country Picker */}
            {showCountryPicker && (
              <View style={styles.countryList}>
                {COUNTRIES.map((country) => (
                  <TouchableOpacity
                    key={country.code}
                    style={[
                      styles.countryItem,
                      selectedCountry === country.code && styles.countryItemSelected,
                    ]}
                    onPress={() => {
                      setSelectedCountry(country.code);
                      setShowCountryPicker(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.countryFlag}>{country.flag}</Text>
                    <Text style={styles.countryItemName}>{country.name}</Text>
                    {selectedCountry === country.code && (
                      <Ionicons name="checkmark" size={20} color="#007AFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={styles.hint}>
              {translate("private.profile.countryDisclaimer")}
            </Text>
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={24} color="#007AFF" />
            <Text style={styles.infoText}>
              {translate("private.profile.countryPaymentDisclaimer")}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerButton: {
    minWidth: 80,
  },
  headerButtonDisabled: {
    opacity: 0.5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    textAlign: 'right',
  },
  saveTextDisabled: {
    color: '#9CA3AF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inputDisabled: {
    backgroundColor: '#F9FAFB',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  inputTextDisabled: {
    color: '#9CA3AF',
  },
  hint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 6,
  },
  countrySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  countrySelectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectedCountryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  countryName: {
    fontSize: 16,
    color: '#1F2937',
  },
  placeholderText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  countryList: {
    marginTop: 8,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  countryItemSelected: {
    backgroundColor: '#F0F9FF',
  },
  countryItemName: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 20,
    marginLeft: 12,
  },
});