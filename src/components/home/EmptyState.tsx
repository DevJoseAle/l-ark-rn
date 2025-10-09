// src/components/home/EmptyState.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-color';
import { useRouter } from 'expo-router';

interface EmptyStateProps {
  onCreateCampaign?: () => void;
}

export default function EmptyState({ onCreateCampaign }: EmptyStateProps) {
    const color = useThemeColors();
    const styles = emptyStateStyles(color);
    const router = useRouter()
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => {
            router.push('/(auth)/campaign/createCampaign')
        }}
      >
        <Ionicons name="add" size={40} color="#FFFFFF" />
      </TouchableOpacity>
      
      <Text style={styles.message}>
        Aun no tienes campaña.{'\n'}
        Presiona aquí para crear una
      </Text>
    </View>
  );
}

const emptyStateStyles = (color: ThemeColors) =>StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  addButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  message: {
    color: color.text,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 24,
  },
});