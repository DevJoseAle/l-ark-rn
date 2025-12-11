// src/features/vault/components/UpgradeModal.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { IS_MOCK_PAYMENTS_ENABLED, MOCK_PAYMENT_MESSAGES } from '@/src/services/mockPayment.service';
import { useVaultStore } from '@/src/stores/vault.store';
import { BillingInterval } from '@/src/types/vault.types';
import { PLAN_PRICES } from '@/src/utils/vaultConstants';
import { useTranslation } from 'react-i18next';

interface UpgradeModalProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Modal para actualizar a plan PRO
 */
export function UpgradeModal({ visible, onClose }: UpgradeModalProps) {
  const [selectedInterval, setSelectedInterval] = useState<BillingInterval>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  const {t:translate} = useTranslation("common")
  
  const upgradeToPro = useVaultStore(state => state.upgradeToPro);

  /**
   * Handler para procesar la compra
   */
  const handlePurchase = async () => {
    setIsProcessing(true);

    try {
      // Mostrar mensaje de modo desarrollo si aplica
      if (IS_MOCK_PAYMENTS_ENABLED) {
        Alert.alert(
          '🎭 Modo Desarrollo',
          MOCK_PAYMENT_MESSAGES.devMode,
          [{ text: 'Continuar', onPress: () => processPurchase() }]
        );
      } else {
        await processPurchase();
      }
    } catch (error) {
      console.error('Error en handlePurchase:', error);
      setIsProcessing(false);
    }
  };

  /**
   * Procesa la compra real
   */
  const processPurchase = async () => {
    const success = await upgradeToPro(selectedInterval);

    setIsProcessing(false);

    if (success) {
      Alert.alert(
        translate("alert.vault.welcomeToPro"),
        translate("alert.vault.welcomeToProMessage"),
        [
          {
            text: translate("alert.vault.welcomeToProButton"),
            onPress: () => {
              onClose();
            },
          },
        ]
      );
    } else {
      Alert.alert(
        translate("errors.vault.proErrorTitle"),
        translate("errors.vault.proErrorMessage"),
        [{ text: 'OK' }]
      );
    }
  };

  const monthlyPrice = PLAN_PRICES.PRO_MONTHLY.toLocaleString('es-CL');
  const yearlyPrice = PLAN_PRICES.PRO_YEARLY.toLocaleString('es-CL');
  const yearlyMonthlyEquivalent = Math.round(PLAN_PRICES.PRO_YEARLY / 12).toLocaleString('es-CL');

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{translate("modals.upgradeModal.modalHeader")}</Text>
          <View style={styles.closeButtonPlaceholder} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Icono destacado */}
          <View style={styles.iconContainer}>
            <Ionicons name="star" size={48} color="#FBBF24" />
          </View>

          {/* Título */}
          <Text style={styles.title}>
            {translate("modals.upgradeModal.modalTitle")}
          </Text>

          {/* Descripción */}
          <Text style={styles.description}>
            {translate("modals.upgradeModal.modalSubtitle")}
          </Text>

          {/* Selector de intervalo */}
          <View style={styles.intervalSelector}>
            <TouchableOpacity
              style={[
                styles.intervalOption,
                selectedInterval === 'monthly' && styles.intervalOptionActive,
              ]}
              onPress={() => setSelectedInterval('monthly')}
              activeOpacity={0.7}
            >
              <View style={styles.intervalHeader}>
                <Text
                  style={[
                    styles.intervalLabel,
                    selectedInterval === 'monthly' && styles.intervalLabelActive,
                  ]}
                >
                  Mensual
                </Text>
                {selectedInterval === 'monthly' && (
                  <View style={styles.checkBadge}>
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  </View>
                )}
              </View>
              <Text
                style={[
                  styles.intervalPrice,
                  selectedInterval === 'monthly' && styles.intervalPriceActive,
                ]}
              >
                ${monthlyPrice} CLP/mes
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.intervalOption,
                selectedInterval === 'yearly' && styles.intervalOptionActive,
              ]}
              onPress={() => setSelectedInterval('yearly')}
              activeOpacity={0.7}
            >
              <View style={styles.intervalHeader}>
                <View style={styles.intervalLabelContainer}>
                  <Text
                    style={[
                      styles.intervalLabel,
                      selectedInterval === 'yearly' && styles.intervalLabelActive,
                    ]}
                  >
                    Anual
                  </Text>
                  <View style={styles.saveBadge}>
                    <Text style={styles.saveText}>Ahorra 10%</Text>
                  </View>
                </View>
                {selectedInterval === 'yearly' && (
                  <View style={styles.checkBadge}>
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  </View>
                )}
              </View>
              <Text
                style={[
                  styles.intervalPrice,
                  selectedInterval === 'yearly' && styles.intervalPriceActive,
                ]}
              >
                ${yearlyPrice} CLP/año
              </Text>
              <Text
                style={[
                  styles.intervalEquivalent,
                  selectedInterval === 'yearly' && styles.intervalEquivalentActive,
                ]}
              >
                (~${yearlyMonthlyEquivalent} CLP/mes)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Features */}
          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>{translate("modals.upgradeModal.benefitsSectionTitle")}</Text>
            
            <FeatureItem
              icon="expand"
              title={translate("modals.upgradeModal.benefit1")}
              description={translate("modals.upgradeModal.benefit1Subtitle")}
            />
            
            <FeatureItem
              icon="headset"
              title={translate("modals.upgradeModal.benefit2")}
              description={translate("modals.upgradeModal.benefit2Subtitle")}
            />
            
            <FeatureItem
              icon="hardware-chip"
              title={translate("modals.upgradeModal.benefit3")}
              description={translate("modals.upgradeModal.benefit3Subtitle")}
            />
            
            <FeatureItem
              icon="shield-checkmark"
              title={translate("modals.upgradeModal.benefit4")}
              description={translate("modals.upgradeModal.benefit4Subtitle")}
            />
          </View>

          {/* Nota de desarrollo */}
          {IS_MOCK_PAYMENTS_ENABLED && (
            <View style={styles.devNote}>
              <Ionicons name="information-circle" size={20} color="#3B82F6" />
              <Text style={styles.devNoteText}>
                Modo desarrollo: Esta es una compra simulada
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Botón de compra */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.purchaseButton, isProcessing && styles.purchaseButtonDisabled]}
            onPress={handlePurchase}
            disabled={isProcessing}
            activeOpacity={0.8}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.purchaseButtonText}>
                  {translate("modals.upgradeModal.upgradeButton")}
                </Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
          
          <Text style={styles.footerNote}>
            {translate("modals.upgradeModal.modalDisclaimer")}
          </Text>
        </View>
      </View>
    </Modal>
  );
}

/**
 * Item de feature con icono y descripción
 */
function FeatureItem({ 
  icon, 
  title, 
  description 
}: { 
  icon: any; 
  title: string; 
  description: string;
}) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIconContainer}>
        <Ionicons name={icon} size={24} color="#4BA3D9" />
      </View>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonPlaceholder: {
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  intervalSelector: {
    gap: 12,
    marginBottom: 32,
  },
  intervalOption: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  intervalOptionActive: {
    borderColor: '#4BA3D9',
    backgroundColor: '#EFF6FF',
  },
  intervalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  intervalLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  intervalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  intervalLabelActive: {
    color: '#1E40AF',
  },
  saveBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  saveText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  checkBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4BA3D9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  intervalPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  intervalPriceActive: {
    color: '#1E40AF',
  },
  intervalEquivalent: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  intervalEquivalentActive: {
    color: '#3B82F6',
  },
  featuresContainer: {
    gap: 16,
    marginBottom: 24,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  featureItem: {
    flexDirection: 'row',
    gap: 16,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  devNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#DBEAFE',
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  devNoteText: {
    flex: 1,
    fontSize: 13,
    color: '#1E40AF',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  purchaseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4BA3D9',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  purchaseButtonDisabled: {
    opacity: 0.6,
  },
  purchaseButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 8,
  },
  footerNote: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },
});