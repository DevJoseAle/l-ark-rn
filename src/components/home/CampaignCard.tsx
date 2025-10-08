// src/components/home/CampaignCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-color';

interface CampaignCardProps {
  totalRaised: string;
  currentAmount: string;
  goalAmount: string;
  percentage: number;
  isVisible?: boolean;
  onViewCampaign?: () => void;
  onShare?: () => void;
  onSendLink?: () => void;
  onToggleVisibility?: () => void;
}

export default function CampaignCard({
  totalRaised,
  currentAmount,
  goalAmount,
  percentage,
  isVisible = true,
  onViewCampaign,
  onShare,
  onSendLink,
  onToggleVisibility,
}: CampaignCardProps) {
  const theme = useThemeColors();
  const styles = cardCampaignStyles(theme);

  return (
    <LinearGradient
      colors={['#1e3a8a', '#2563eb', '#1e40af']}
      locations={[0, 0.5, 1]}
      start={{ x: 2, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      {/* Header con Total Recaudado */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerLabel}>Total Recaudado:</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={styles.headerLabel}>Estatus Campaña:</Text> 
            <Text style={styles.headerLabel}>{isVisible ? "Visible" : "Oculta"}</Text>
          </View>
          <Text style={styles.totalAmount}>
            CLP: {totalRaised}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.visibilityButton}
          onPress={onToggleVisibility}
        >
          <Ionicons 
            name={isVisible ? "eye-outline" : "eye-off-outline"} 
            size={24} 
            color="rgba(255, 255, 255, 0.8)" 
          />
        </TouchableOpacity>
      </View>

      {/* Progress Section */}
      <View style={styles.progressSection}>
        <Text style={styles.progressLabel}>Tu meta:</Text>
        
        <View style={styles.progressAmounts}>
          <Text style={styles.currentAmount}>CLP: {currentAmount}</Text>
          <Text style={styles.goalAmount}>CLP: {goalAmount}</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarFill, { width: `${percentage}%` }]} />
        </View>

        <Text style={styles.percentage}>¡Llevas un {percentage}% de tu meta!</Text>
      </View>

      {/* Action Buttons */}
      <TouchableOpacity 
        style={styles.primaryButton}
        onPress={onViewCampaign}
      >
        <Text style={styles.primaryButtonText}>Ver mi Campaña</Text>
        <Ionicons name="document-text-outline" size={20} color="#0f1c3a" />
      </TouchableOpacity>

      <View style={styles.secondaryButtons}>
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={onShare}
        >
          <Text style={styles.secondaryButtonText}>Compartir</Text>
          <Ionicons name="share-outline" size={18} color="#0f1c3a" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={onSendLink}
        >
          <Text style={styles.secondaryButtonText}>Enviar Link</Text>
          <Ionicons name="link-outline" size={18} color="#0f1c3a" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const cardCampaignStyles = (color: ThemeColors) => StyleSheet.create({
  container: {
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerLabel: {
    color: color.customWhite,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  totalAmount: {
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: '700',
    letterSpacing: -1,
  },
  visibilityButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  progressLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  progressAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  currentAmount: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
  goalAmount: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#60A5FA',
    borderRadius: 4,
  },
  percentage: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#0f1c3a',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  secondaryButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#0f1c3a',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 6,
  },
});