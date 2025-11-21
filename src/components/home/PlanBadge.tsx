// src/features/vault/components/PlanBadge.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useVaultPlan } from '@/src/stores/vault.store';

interface PlanBadgeProps {
  onUpgradePress?: () => void;
}

/**
 * Badge que muestra el plan actual y opcionalmente un botón de upgrade
 */
export function PlanBadge({ onUpgradePress }: PlanBadgeProps) {
  const { isFree, isPro, planType } = useVaultPlan();

  if (isFree) {
    return (
      <View style={styles.container}>
        {/* Badge FREE */}
        <View style={[styles.badge, styles.freeBadge]}>
          <Ionicons name="gift-outline" size={16} color="#059669" />
          <Text style={[styles.badgeText, styles.freeText]}>Plan FREE</Text>
        </View>

        {/* Botón de upgrade */}
        {onUpgradePress && (
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={onUpgradePress}
            activeOpacity={0.7}
          >
            <Text style={styles.upgradeButtonText}>Actualizar a PRO</Text>
            <Ionicons name="arrow-up-circle" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (isPro) {
    return (
      <View style={styles.container}>
        {/* Badge PRO */}
        <View style={[styles.badge, styles.proBadge]}>
          <Ionicons name="star" size={16} color="#FBBF24" />
          <Text style={[styles.badgeText, styles.proText]}>Plan PRO</Text>
        </View>

        {/* Texto descriptivo */}
        <Text style={styles.proDescription}>Tienes acceso completo a todas las funciones</Text>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
  },
  freeBadge: {
    backgroundColor: '#D1FAE5',
  },
  proBadge: {
    backgroundColor: '#FEF3C7',
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  freeText: {
    color: '#059669',
  },
  proText: {
    color: '#92400E',
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4BA3D9',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginTop: 4,
  },
  upgradeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 6,
  },
  proDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 4,
  },
});
