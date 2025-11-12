// src/screens/home/ArkHomePage.tsx
import { ThemeColors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-color';
import { GradientBackground } from '@/src/components/common/GradiendBackground';
import CampaignCard from '@/src/components/home/CampaignCard';
import DonationItem from '@/src/components/home/DonationItem';
import EmptyState from '@/src/components/home/EmptyState';
import ErrorState from '@/src/components/home/ErrorState';
import { useHomeData } from '@/src/features/home/useHomeData';
import { SharingService } from '@/src/services/share.service';
import { useExchangeRatesStore } from '@/src/stores/exchangeRates.store';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Platform, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function ArkHomePage() {
  const router = useRouter();
  const colors = useThemeColors();
  const styles = arkHomeStyles(colors);
  
  const {
    viewState,
    campaignData,
    campaign,
    donations,
    handleRetry,
    handleToggleVisibility,
    handleRefresh,
  } = useHomeData();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await handleRefresh();
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleShare = async () => {
    // TODO: Implementar share con Expo Sharing
    //console.log('Share pressed');
  };

  const handleSendLink = async () => {
    try {
      await SharingService.shareCampaign(campaign!);
    } catch (error) {
      Alert.alert('Error', 'No se pudo compartir la campaña');
    }
  };

  const handleViewCampaign = () => {
    router.push('/campaign/detail');
  };

  const handleCreateCampaign = () => {
    // TODO: Navegar a crear campaña
    router.push('/campaign/create');
  };

  const renderContent = () => {
    switch (viewState) {
      case 'loading':
        return (
          <View style={styles.centerContent}>
            <Text style={styles.loadingText}>Cargando...</Text>
          </View>
        );

      case 'error':
        return <ErrorState onRetry={handleRetry} />;

      case 'empty':
        return <EmptyState onCreateCampaign={handleCreateCampaign} />;

      case 'success':
        if (!campaignData) return null;

        return (
          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: Platform.OS === 'ios' ? 100 : 110 }
            ]}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.text}
                colors={[colors.text]}
              />
            }
          >
            {/* Campaign Card */}
            <CampaignCard
              totalRaised={campaignData.totalRaised}
              currentAmount={campaignData.currentAmount}
              goalAmount={campaignData.goalAmount}
              percentage={campaignData.percentage}
              isVisible={campaignData.isVisible}
              onViewCampaign={handleViewCampaign}
              onShare={handleShare}
              onSendLink={handleSendLink}
              onToggleVisibility={handleToggleVisibility}
            />

            {/* Donations Section */}
            {donations.length > 0 && (
              <View style={styles.donationsSection}>
                <Text style={styles.donationsTitle}>Donaciones:</Text>
                
                {donations.map((donation) => (
                  <DonationItem
                    key={donation.id}
                    donorName={donation.donorName}
                    date={donation.date}
                    amount={`${donation.currency}: $${formatAmount(donation.amount)}`}
                  />
                ))}
              </View>
            )}

            {/* Empty donations state */}
            {donations.length === 0 && (
              <View style={styles.emptyDonations}>
                <Text style={styles.emptyDonationsText}>
                  Aún no hay donaciones para esta campaña
                </Text>
              </View>
            )}
          </ScrollView>
        );

      default:
        return null;
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Home</Text>
          </View>
          {renderContent()}
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

const arkHomeStyles = (color: ThemeColors) => StyleSheet.create({
  safeArea: { 
    flex: 1 
  },
  container: { 
    flex: 1 
  },
  header: { 
    paddingHorizontal: 20, 
    paddingTop: 20, 
    paddingBottom: 10 
  },
  headerTitle: { 
    color: color.text, 
    fontSize: 34, 
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  scrollView: { 
    flex: 1 
  },
  scrollContent: { 
    // paddingBottom agregado dinámicamente
  },
  donationsSection: { 
    paddingHorizontal: 20, 
    marginTop: 32 
  },
  donationsTitle: { 
    color: color.text, 
    fontSize: 22, 
    fontWeight: '700', 
    marginBottom: 16 
  },
  centerContent: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  loadingText: { 
    color: color.text, 
    fontSize: 16 
  },
  emptyDonations: {
    paddingHorizontal: 20,
    marginTop: 32,
    alignItems: 'center',
  },
  emptyDonationsText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
    textAlign: 'center',
  },
});