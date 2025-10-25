// src/components/campaign/FloatingDonateButton.tsx

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/use-theme-color';
import { ThemeColors } from '@/constants/theme';

interface FloatingDonateButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

export default function FloatingDonateButton({ 
  onPress, 
  disabled = false 
}: FloatingDonateButtonProps) {
  const colors = useThemeColors();
  const styles = floatingButtonStyles(colors);

  return (
    <TouchableOpacity
      style={[styles.container, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Ionicons name="heart" size={24} color={colors.customWhite} />
      <Text style={styles.text}>Donar</Text>
    </TouchableOpacity>
  );
}

const floatingButtonStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 90,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.success,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 30,
    shadowColor: colors.customBlack,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 999,
  },
  disabled: {
    backgroundColor: colors.icon,
    opacity: 0.5,
  },
  text: {
    color: colors.customWhite,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});