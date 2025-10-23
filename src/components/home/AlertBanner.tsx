// src/components/profile/AlertBanner.tsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AlertBannerProps {
  type: 'warning' | 'error' | 'info';
  message: string;
  actionLabel?: string;
  onActionPress?: () => void;
  onDismiss?: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  type,
  message,
  actionLabel,
  onActionPress,
  onDismiss,
}) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'error':
        return {
          container: styles.errorContainer,
          icon: 'alert-circle' as const,
          iconColor: '#DC2626',
        };
      case 'warning':
        return {
          container: styles.warningContainer,
          icon: 'warning' as const,
          iconColor: '#F59E0B',
        };
      case 'info':
        return {
          container: styles.infoContainer,
          icon: 'information-circle' as const,
          iconColor: '#007AFF',
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <View style={[styles.container, typeStyles.container]}>
      <View style={styles.content}>
        <Ionicons
          name={typeStyles.icon}
          size={24}
          color={typeStyles.iconColor}
          style={styles.icon}
        />
        
        <View style={styles.textContainer}>
          <Text style={styles.message}>{message}</Text>
          
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
        </View>

        {onDismiss && (
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={onDismiss}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={20} color="#6B7280" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  warningContainer: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA',
  },
  infoContainer: {
    backgroundColor: '#DBEAFE',
    borderColor: '#BFDBFE',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  icon: {
    marginRight: 12,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    color: '#1F2937',
    fontWeight: '500',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginRight: 4,
  },
  dismissButton: {
    marginLeft: 8,
    padding: 4,
  },
});