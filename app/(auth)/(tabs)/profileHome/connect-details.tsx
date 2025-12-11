// app/(auth)/(tabs)/profile/connect-details.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useProfileStore, profileSelectors } from '../../../../src/stores/profile.store';
import { StripeConnectService } from '../../../../src/services/stripeConnect.service';
import { useTranslation } from 'react-i18next';

export default function ConnectDetailsScreen() {
  const { t: translate } = useTranslation("common");
  
  const {
    user,
    beneficiaryAccount,
    beneficiaryCampaigns,
    refreshConnectStatus,
  } = useProfileStore();

  const isBeneficiary = useProfileStore(profileSelectors.isBeneficiary);
  const countrySupportsConnect = useProfileStore(profileSelectors.countrySupportsConnect);

  const [isLoading, setIsLoading] = useState(false);

  // Start onboarding
  const handleStartOnboarding = async () => {
    setIsLoading(true);

    try {
      // Get onboarding link from Edge Function
      const link = await StripeConnectService.getOnboardingLink();

      if (link) {
        // Open browser with the link
        const supported = await Linking.canOpenURL(link);
        
        if (supported) {
          await Linking.openURL(link);
          
          // Show info
          Alert.alert(
            translate("alert.profile.onboardingInProgressTitle"),
            translate("alert.profile.onboardingInProgressMessage"),
            [
              {
                text: translate("alert.profile.onboardingInProgressButton"),
                onPress: () => {
                  // Refresh after a delay to give user time to complete
                  setTimeout(() => {
                    refreshConnectStatus();
                  }, 2000);
                },
              },
            ]
          );
        } else {
          throw new Error(translate("alert.profile.linkErrorMessage"));
        }
      }
    } catch (error: any) {
      console.error('Error starting onboarding:', error);
      Alert.alert(
        translate("alert.profile.onboardingErrorTitle"),
        error.message || translate("alert.profile.onboardingErrorMessage")
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh status
  const handleRefresh = async () => {
    setIsLoading(true);
    await refreshConnectStatus();
    setIsLoading(false);
    Alert.alert(
      translate("alert.profile.refreshSuccessTitle"),
      translate("alert.profile.refreshSuccessMessage")
    );
  };

  // Get status info
  const getStatusInfo = () => {
    if (!isBeneficiary) {
      return {
        color: '#6B7280',
        backgroundColor: '#F3F4F6',
        icon: 'information-circle-outline' as const,
        title: translate("private.profile.statusNotBeneficiaryTitle"),
        message: translate("private.profile.statusNotBeneficiaryMessage"),
        showAction: false,
      };
    }

    if (!countrySupportsConnect) {
      return {
        color: '#8B5CF6',
        backgroundColor: '#EDE9FE',
        icon: 'document-outline' as const,
        title: translate("private.profile.statusManualPayTitle"),
        message: translate("private.profile.statusManualPayMessage", { 
          country: user?.country || 'desconocido' 
        }),
        showAction: false,
      };
    }

    const status = beneficiaryAccount?.connect_status;

    switch (status) {
      case 'verified':
      case 'active':
        return {
          color: '#10B981',
          backgroundColor: '#D1FAE5',
          icon: 'checkmark-circle' as const,
          title: translate("private.profile.statusVerifiedTitle"),
          message: translate("private.profile.statusVerifiedMessage"),
          showAction: false,
        };
      
      case 'onboarding':
        return {
          color: '#3B82F6',
          backgroundColor: '#DBEAFE',
          icon: 'document-text-outline' as const,
          title: translate("private.profile.statusOnboardingTitle"),
          message: translate("private.profile.statusOnboardingMessage"),
          showAction: true,
          actionLabel: translate("private.profile.statusOnboardingAction"),
        };
      
      case 'pending':
        return {
          color: '#F59E0B',
          backgroundColor: '#FEF3C7',
          icon: 'hourglass-outline' as const,
          title: translate("private.profile.statusPendingTitle"),
          message: translate("private.profile.statusPendingMessage"),
          showAction: true,
          actionLabel: translate("private.profile.statusPendingAction"),
        };
      
      case 'rejected':
        return {
          color: '#DC2626',
          backgroundColor: '#FEE2E2',
          icon: 'close-circle' as const,
          title: translate("private.profile.statusRejectedTitle"),
          message: translate("private.profile.statusRejectedMessage"),
          showAction: true,
          actionLabel: translate("private.profile.statusRejectedAction"),
        };
      
      default:
        return {
          color: '#F59E0B',
          backgroundColor: '#FEF3C7',
          icon: 'warning-outline' as const,
          title: translate("private.profile.statusRequiredTitle"),
          message: translate("private.profile.statusRequiredMessage"),
          showAction: true,
          actionLabel: translate("private.profile.statusRequiredAction"),
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Status Banner */}
      <View style={[styles.statusBanner, { backgroundColor: statusInfo.backgroundColor }]}>
        <Ionicons name={statusInfo.icon} size={32} color={statusInfo.color} />
        <View style={styles.statusTextContainer}>
          <Text style={[styles.statusTitle, { color: statusInfo.color }]}>
            {statusInfo.title}
          </Text>
          <Text style={styles.statusMessage}>{statusInfo.message}</Text>
        </View>
      </View>

      {/* Action Button */}
      {statusInfo.showAction && (
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleStartOnboarding}
          disabled={isLoading}
        >
          <Ionicons
            name={isLoading ? 'hourglass-outline' : 'arrow-forward-outline'}
            size={20}
            color="#FFF"
          />
          <Text style={styles.primaryButtonText}>
            {isLoading ? translate("private.profile.loadingButton") : statusInfo.actionLabel}
          </Text>
        </TouchableOpacity>
      )}

      {/* Account Details */}
      {beneficiaryAccount && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {translate("private.profile.accountDetailsTitle")}
          </Text>
          
          <View style={styles.detailCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                {translate("private.profile.accountIdLabel")}
              </Text>
              <Text style={styles.detailValue}>
                {beneficiaryAccount.stripe_connect_account_id
                  ? `...${beneficiaryAccount.stripe_connect_account_id.slice(-8)}`
                  : translate("private.profile.accountIdValue")}
              </Text>
            </View>

            <View style={styles.separator} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                {translate("private.profile.countryLabel")}
              </Text>
              <Text style={styles.detailValue}>
                {beneficiaryAccount.country}
              </Text>
            </View>

            <View style={styles.separator} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                {translate("private.profile.payoutModeLabel")}
              </Text>
              <Text style={styles.detailValue}>
                {beneficiaryAccount.payout_mode === 'connect'
                  ? translate("private.profile.payoutModeAutomatic")
                  : translate("private.profile.payoutModeManual")}
              </Text>
            </View>

            {beneficiaryAccount.bank_account_last4 && (
              <>
                <View style={styles.separator} />
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>
                    {translate("private.profile.bankAccountLabel")}
                  </Text>
                  <Text style={styles.detailValue}>
                    ****{beneficiaryAccount.bank_account_last4}
                  </Text>
                </View>
              </>
            )}

            {beneficiaryAccount.bank_name && (
              <>
                <View style={styles.separator} />
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>
                    {translate("private.profile.bankNameLabel")}
                  </Text>
                  <Text style={styles.detailValue}>
                    {beneficiaryAccount.bank_name}
                  </Text>
                </View>
              </>
            )}

            <View style={styles.separator} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                {translate("private.profile.createdLabel")}
              </Text>
              <Text style={styles.detailValue}>
                {new Date(beneficiaryAccount.created_at).toLocaleDateString('es-CL')}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Beneficiary Campaigns */}
      {beneficiaryCampaigns.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {translate("private.profile.beneficiaryCampaignsTitle", { 
              count: beneficiaryCampaigns.length 
            })}
          </Text>

          <View style={styles.campaignsList}>
            {beneficiaryCampaigns.map((bc) => (
              <View key={bc.id} style={styles.campaignCard}>
                <Text style={styles.campaignTitle}>{bc.campaign.title}</Text>
                <Text style={styles.campaignOwner}>
                  {translate("private.profile.campaignOwner", { 
                    owner: bc.campaign.owner.display_name 
                  })}
                </Text>
                
                <View style={styles.shareInfo}>
                  <Ionicons name="pie-chart-outline" size={16} color="#007AFF" />
                  <Text style={styles.shareText}>
                    {bc.share_type === 'percent'
                      ? translate("private.profile.sharePercentage", { value: bc.share_value })
                      : translate("private.profile.shareFixed", { 
                          currency: bc.campaign.currency,
                          value: bc.share_value.toLocaleString('es-CL')
                        })}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Info Box */}
      <View style={styles.infoBox}>
        <Ionicons name="information-circle-outline" size={24} color="#007AFF" />
        <View style={styles.infoTextContainer}>
          <Text style={styles.infoTitle}>
            {translate("private.profile.infoBoxTitle")}
          </Text>
          <Text style={styles.infoText}>
            {translate("private.profile.infoBoxMessage")}
          </Text>
        </View>
      </View>

      {/* Refresh Button */}
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={handleRefresh}
        disabled={isLoading}
      >
        <Ionicons
          name="refresh-outline"
          size={20}
          color="#007AFF"
        />
        <Text style={styles.refreshText}>
          {translate("private.profile.refreshButton")}
        </Text>
      </TouchableOpacity>

      {/* Support Button */}
      <TouchableOpacity style={styles.supportButton}>
        <Ionicons name="help-circle-outline" size={20} color="#007AFF" />
        <Text style={styles.supportText}>
          {translate("private.profile.supportButton")}
        </Text>
      </TouchableOpacity>

      <View style={{ height: 132 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    padding: 16,
  },
  statusBanner: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  statusTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  statusMessage: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  primaryButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginLeft: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  detailCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  campaignsList: {
    gap: 12,
  },
  campaignCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
  },
  campaignTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  campaignOwner: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
  },
  shareInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  shareText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 6,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 16,
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },
  refreshButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  refreshText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 6,
  },
  supportButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  supportText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 6,
  },
});