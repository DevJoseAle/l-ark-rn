// src/features/vault/components/StorageBar.tsx

import { useStorageStatus } from '@/src/stores/vault.store';
import { getStorageBarColor, formatBytes } from '@/src/utils/vaultUtils';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet } from 'react-native';


/**
 * Barra de progreso que muestra el uso de almacenamiento
 */
export function StorageBar() {
  const { quota } = useStorageStatus();
  const { t: translate } = useTranslation("common");

  if (!quota) return null;

  const barColor = getStorageBarColor(quota.percentage);
  const showWarning = quota.isNearLimit && !quota.isAtLimit;
  const showError = quota.isAtLimit;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{translate("private.vault.storageBarTitle")}</Text>
        <Text style={styles.percentage}>
          {quota.percentage.toFixed(0)}%
        </Text>
      </View>

      {/* Barra de progreso */}
      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBarFill,
            {
              width: `${Math.min(100, quota.percentage)}%`,
              backgroundColor: barColor,
            },
          ]}
        />
      </View>

      {/* Texto de uso */}
      <View style={styles.usageContainer}>
        <Text style={styles.usageText}>
          {translate("private.vault.actualStorage",{
            used: formatBytes(quota.used),
            total: formatBytes(quota.total)
          })}
        </Text>
      </View>

      {/* Mensajes de advertencia/error */}
      {showWarning && (
        <View style={[styles.messageContainer, styles.warningContainer]}>
          <Text style={styles.warningText}>
            {translate("private.vault.storageUsed",{
              remaining: formatBytes(quota.remaining),
            })}
          </Text>
        </View>
      )}

      {showError && (
        <View style={[styles.messageContainer, styles.errorContainer]}>
          <Text style={styles.errorText}>
            {translate("private.vault.totalUsed")}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  percentage: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4BA3D9',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  usageContainer: {
    marginBottom: 4,
  },
  usageText: {
    fontSize: 13,
    color: '#6B7280',
  },
  messageContainer: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  warningContainer: {
    backgroundColor: '#FEF3C7',
  },
  warningText: {
    fontSize: 13,
    color: '#92400E',
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
  },
  errorText: {
    fontSize: 13,
    color: '#991B1B',
    fontWeight: '500',
  },
});