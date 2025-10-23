 // src/components/profile/StatusCard.tsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { KycStatus, ConnectStatus } from '../../types/profile.types';

type StatusType = KycStatus | ConnectStatus | 'manual';

interface StatusConfig {
  color: string;
  backgroundColor: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}

interface StatusCardProps {
  title: string;
  status: StatusType;
  subtitle?: string;
  details?: string[];
  actionLabel?: string;
  onActionPress?: () => void;
  onPress?: () => void;
}

const STATUS_CONFIGS: Record<string, StatusConfig> = {
  // KYC Statuses
  kyc_pending: {
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    icon: 'hourglass-outline',
    label: 'Sin verificar',
  },
  kyc_review: {
    color: '#F59E0B',
    backgroundColor: '#FEF3C7',
    icon: 'time-outline',
    label: 'En revisión',
  },
  kyc_verified: {
    color: '#10B981',
    backgroundColor: '#D1FAE5',
    icon: 'checkmark-circle',
    label: 'Verificado',
  },
  kyc_rejected: {
    color: '#DC2626',
    backgroundColor: '#FEE2E2',
    icon: 'close-circle',
    label: 'Rechazado',
  },

  // Connect Statuses
  invited: {
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    icon: 'mail-outline',
    label: 'Invitado',
  },
  pending: {
    color: '#F59E0B',
    backgroundColor: '#FEF3C7',
    icon: 'hourglass-outline',
    label: 'Pendiente',
  },
  onboarding: {
    color: '#3B82F6',
    backgroundColor: '#DBEAFE',
    icon: 'document-text-outline',
    label: 'En proceso',
  },
  verified: {
    color: '#10B981',
    backgroundColor: '#D1FAE5',
    icon: 'checkmark-circle',
    label: 'Verificado',
  },
  active: {
    color: '#10B981',
    backgroundColor: '#D1FAE5',
    icon: 'checkmark-circle',
    label: 'Activo',
  },
  rejected: {
    color: '#DC2626',
    backgroundColor: '#FEE2E2',
    icon: 'close-circle',
    label: 'Rechazado',
  },
  external: {
    color: '#8B5CF6',
    backgroundColor: '#EDE9FE',
    icon: 'document-outline',
    label: 'Pago Manual',
  },
  manual: {
    color: '#8B5CF6',
    backgroundColor: '#EDE9FE',
    icon: 'hand-left-outline',
    label: 'Manual',
  },
};

export const StatusCard: React.FC<StatusCardProps> = ({
  title,
  status,
  subtitle,
  details,
  actionLabel,
  onActionPress,
  onPress,
}) => {
  const config = STATUS_CONFIGS[status] || STATUS_CONFIGS.kyc_pending;

  const CardWrapper = onPress ? TouchableOpacity : View;

  return (
    <CardWrapper
      style={styles.container}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        
        <View style={[styles.badge, { backgroundColor: config.backgroundColor }]}>
          <Ionicons name={config.icon} size={16} color={config.color} />
          <Text style={[styles.badgeText, { color: config.color }]}>
            {config.label}
          </Text>
        </View>
      </View>

      {/* Subtitle */}
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

      {/* Details */}
      {details && details.length > 0 && (
        <View style={styles.detailsContainer}>
          {details.map((detail, index) => (
            <View key={index} style={styles.detailRow}>
              <Ionicons
                name="checkmark-circle"
                size={16}
                color="#10B981"
                style={styles.detailIcon}
              />
              <Text style={styles.detailText}>{detail}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Action Button */}
      {actionLabel && onActionPress && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onActionPress}
          activeOpacity={0.7}
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
          <Ionicons name="arrow-forward" size={16} color="#007AFF" />
        </TouchableOpacity>
      )}

      {/* Tap to see more */}
      {onPress && (
        <View style={styles.tapHint}>
          <Text style={styles.tapHintText}>Toca para ver detalles</Text>
          <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
        </View>
      )}
    </CardWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  detailsContainer: {
    marginTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailIcon: {
    marginRight: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#4B5563',
    flex: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F9FF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#007AFF',
    marginRight: 6,
  },
  tapHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  tapHintText: {
    fontSize: 13,
    color: '#9CA3AF',
    marginRight: 4,
  },
});