// src/components/home/CampaignCard.tsx
import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-color';
import { CampaignService } from '@/src/services/campaign.service';
import { useRouter } from 'expo-router';
import { useCampaignStore } from '@/src/stores/campaign.store';
import { CountryCode, getCountryFlag, getCurrencyCode } from '@/src/types/campaign-create.types';
import { useExchangeRatesStore } from '@/src/stores/exchangeRates.store';
import { fromUSDNumberToCurrencyString } from '@/src/utils/ratesUtils';
import { TFunction } from 'i18next';

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
  handleBottomSheetOpen: () => void;
  translate: TFunction<"common", undefined>
}

export default function CampaignCard({
  totalRaised,
  currentAmount,
  goalAmount,
  percentage,
  isVisible = true,
  onShare,
  onSendLink,
  handleBottomSheetOpen,
  translate
}: CampaignCardProps) {
  const theme = useThemeColors();
  const styles = cardCampaignStyles(theme);
  const router = useRouter();

  const country = useExchangeRatesStore(state => state.country)
  const [isBtnActive, setIsBtnActive] = useState(true);
  const {campaign} = useCampaignStore();
  const ownCampaignId = campaign?.id;
  const handleViewCampaign = async () => {
    setIsBtnActive(false);
    router.push(`/(auth)/campaign/${ownCampaignId}`);
    setIsBtnActive(true);
  };
  
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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={styles.headerLabel}>Estatus Campaña:</Text> 
            <Text style={styles.headerLabel}>{isVisible ? "Visible" : "Oculta"}</Text>
          </View>
          <Text style={styles.headerLabel}>{translate("private.home.campaignCard.totalRaised")}</Text>
            <View style={{flexDirection: 'row'}}>
            <Text style={styles.totalAmountCode}>
            {getCurrencyCode(country)}
          </Text>
          <Text style={styles.totalAmount}>
            : {fromUSDNumberToCurrencyString(totalRaised, country)}
          </Text>
            </View>
        </View>
        
        <TouchableOpacity 
          style={styles.visibilityButton}
          onPress={handleBottomSheetOpen}
        >
          <Text style={{fontSize: 20, marginLeft: -2}}> {getCountryFlag(country)}</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Section */}
      <View style={styles.progressSection}>
        <Text style={styles.progressLabel}>{translate("private.home.campaignCard.yourGoal")}</Text>
        
        <View style={styles.progressAmounts}>
          <Text style={styles.currentAmount}>{getCurrencyCode(country)}: {fromUSDNumberToCurrencyString(currentAmount, country)}</Text>
          <Text style={styles.goalAmount}>{getCurrencyCode(country)}: {fromUSDNumberToCurrencyString(goalAmount, country)}</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarFill, { width: `${percentage}%` }]} />
        </View>

        <Text style={styles.percentage}>{translate("private.home.campaignCard.goalPercentage", { percentage })}</Text>
      </View>

      {/* Action Buttons */}
      <TouchableOpacity 
        style={[styles.primaryButton,{ opacity: isBtnActive ? 1 : 0.6 }]}
        onPress={handleViewCampaign}
        disabled={!isBtnActive}
      >
        <Text style={styles.primaryButtonText}>{translate("private.home.campaignCard.toMyCampaignButton")}</Text>
        <Ionicons name="document-text-outline" size={20} color="#0f1c3a" />
      </TouchableOpacity>

      <View style={styles.secondaryButtons}>
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={onShare}
        >
          <Text style={styles.secondaryButtonText}>
            {translate("private.home.campaignCard.shareButton")}
          </Text>
          <Ionicons name="share-outline" size={18} color="#0f1c3a" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={onSendLink}
        >
          <Text style={styles.secondaryButtonText}>{translate("private.home.campaignCard.sendCampaign")}</Text>
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
    marginBottom: 10,
  },
  headerLabel: {
    color: color.customWhite,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  totalAmount: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '500',
    letterSpacing: -1,
  },
  totalAmountCode: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '500',
    letterSpacing: 1,
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
    fontWeight: '500',
    marginRight: 6,
  },
});