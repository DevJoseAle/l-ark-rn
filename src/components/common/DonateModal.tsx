// src/components/campaign/DonateModal.tsx

import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/use-theme-color';
import { ThemeColors } from '@/constants/theme';
import { DonationService } from '@/src/services/donation.service';
import { useAuthStore } from '@/src/stores/authStore';

interface DonateModalProps {
  visible: boolean;
  onClose: () => void;
  campaignId: string;
  campaignTitle: string;
  shortCode: string;
}

export default function DonateModal({
  visible,
  onClose,
  campaignId,
  campaignTitle,
  shortCode,
}: DonateModalProps) {
  const colors = useThemeColors();
  const styles = modalStyles(colors);
  const { user } = useAuthStore();
  
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Estado para monto
  const [selectedAmount, setSelectedAmount] = useState(1000); // $10 por defecto (en centavos)
  const [customAmount, setCustomAmount] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Montos predefinidos (en centavos)
  const presetAmounts = [
    { label: '$10', value: 1000 },
    { label: '$25', value: 2500 },
    { label: '$50', value: 5000 },
    { label: '$100', value: 10000 },
  ];

  const handleSelectAmount = (amount: number) => {
    setSelectedAmount(amount);
    setShowCustomInput(false);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (text: string) => {
    // Solo números y punto decimal
    const cleaned = text.replace(/[^0-9.]/g, '');
    setCustomAmount(cleaned);
    
    const amountInDollars = parseFloat(cleaned);
    if (!isNaN(amountInDollars) && amountInDollars >= 5) {
      setSelectedAmount(Math.round(amountInDollars * 100));
    }
  };

  const handleDonateNow = async () => {
    // Validar monto mínimo
    if (selectedAmount < 500) { // $5
      Alert.alert('Monto mínimo', 'El monto mínimo de donación es $5 USD');
      return;
    }

    setLoading(true);

    try {
      await DonationService.openDonationCheckout(campaignId, selectedAmount);
      onClose();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo abrir la página de donación');
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!user?.email) {
      Alert.alert('Error', 'No se pudo obtener tu email');
      return;
    }

    setSending(true);

    try {
      const result = await DonationService.sendDonationLink({
        campaignId,
        userEmail: user.email,
        userName: user.display_name || undefined,
      });

      if (result.success) {
        Alert.alert(
          '✅ Email enviado',
          `Te enviamos el link de donación a ${user.email}`,
          [
            {
              text: 'Abrir ahora',
              onPress: handleDonateNow,
            },
            {
              text: 'Cerrar',
              onPress: onClose,
              style: 'cancel',
            },
          ]
        );
      } else {
        throw new Error(result.error || 'Error desconocido');
      }
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo enviar el email. Intenta nuevamente.');
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  const displayAmount = selectedAmount / 100;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Close button */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.icon} />
          </TouchableOpacity>

          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="heart" size={48} color={colors.success} />
          </View>

          {/* Title */}
          <Text style={styles.title}>Donar a esta campaña</Text>
          
          <Text style={styles.campaignTitle} numberOfLines={2}>
            {campaignTitle}
          </Text>

          {/* Amount Selector */}
          <View style={styles.amountSection}>
            <Text style={styles.amountLabel}>Selecciona un monto</Text>
            
            {/* Preset amounts */}
            <View style={styles.presetGrid}>
              {presetAmounts.map((preset) => (
                <TouchableOpacity
                  key={preset.value}
                  style={[
                    styles.presetBtn,
                    selectedAmount === preset.value && !showCustomInput && styles.presetBtnActive,
                  ]}
                  onPress={() => handleSelectAmount(preset.value)}
                >
                  <Text
                    style={[
                      styles.presetText,
                      selectedAmount === preset.value && !showCustomInput && styles.presetTextActive,
                    ]}
                  >
                    {preset.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Custom amount */}
            <TouchableOpacity
              style={[
                styles.customBtn,
                showCustomInput && styles.customBtnActive,
              ]}
              onPress={() => setShowCustomInput(true)}
            >
              <Text style={styles.customLabel}>Monto personalizado</Text>
              {showCustomInput ? (
                <View style={styles.customInputContainer}>
                  <Text style={styles.currencySymbol}>$</Text>
                  <TextInput
                    style={styles.customInput}
                    value={customAmount}
                    onChangeText={handleCustomAmountChange}
                    placeholder="50"
                    placeholderTextColor={colors.icon}
                    keyboardType="decimal-pad"
                    autoFocus
                  />
                </View>
              ) : (
                <Ionicons name="chevron-forward" size={20} color={colors.icon} />
              )}
            </TouchableOpacity>

            <Text style={styles.minAmount}>Mínimo: $5 USD</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            {/* Donar Ahora */}
            <TouchableOpacity
              style={[styles.actionBtn, styles.primaryBtn]}
              onPress={handleDonateNow}
              disabled={loading || selectedAmount < 500}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size="small" color={colors.customWhite} />
              ) : (
                <>
                  <Text style={styles.actionBtnText}>
                    Donar ${displayAmount.toFixed(2)}
                  </Text>
                  <Ionicons name="arrow-forward" size={20} color={colors.customWhite} />
                </>
              )}
            </TouchableOpacity>

            {/* Enviar email */}
            <TouchableOpacity
              style={[styles.actionBtn, styles.secondaryBtn]}
              onPress={handleSendEmail}
              disabled={sending}
              activeOpacity={0.8}
            >
              {sending ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <>
                  <Ionicons name="mail-outline" size={20} color={colors.primary} />
                  <Text style={[styles.actionBtnText, { color: colors.primary }]}>
                    Enviarme el Link
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const modalStyles = (colors: ThemeColors) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: colors.cardBackground,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    shadowColor: colors.customBlack,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.separator,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${colors.success}20`,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  campaignTitle: {
    fontSize: 15,
    color: colors.secondaryText,
    textAlign: 'center',
    marginBottom: 24,
  },
  amountSection: {
    marginBottom: 24,
  },
  amountLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  presetBtn: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: colors.cardBackground,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  presetBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  presetText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  presetTextActive: {
    color: colors.customWhite,
  },
  customBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.cardBackground,
    borderWidth: 2,
    borderColor: colors.border,
  },
  customBtnActive: {
    borderColor: colors.primary,
  },
  customLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  customInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  customInput: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    minWidth: 60,
    textAlign: 'right',
  },
  minAmount: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: 8,
  },
  actions: {
    gap: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  primaryBtn: {
    backgroundColor: colors.success,
  },
  secondaryBtn: {
    backgroundColor: colors.cardBackground,
    borderWidth: 2,
    borderColor: colors.border,
  },
  actionBtnText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.customWhite,
  },
});
