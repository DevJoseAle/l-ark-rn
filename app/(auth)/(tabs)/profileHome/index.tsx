import ButtonXL from '@/src/components/common/ButtonXL';
import { GradientBackground } from '@/src/components/common/GradiendBackground';
import { AlertBanner } from '@/src/components/home/AlertBanner';
import { CampaignsList } from '@/src/components/home/CampaignList';
import { DeleteAccountModal } from '@/src/components/home/DeleteUserModal';
import { ProfileHeader } from '@/src/components/home/ProfileHeader';
import { StatusCard } from '@/src/components/home/StatusCard';
import { useProfile } from '@/src/features/auth/hooks/useProfile';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';

export default function ProfileScreen() {
  const {
        user,
        beneficiaryAccount,
        ownedCampaigns,
        beneficiaryCampaigns,
        stats,
        isLoading,
        isRefreshing,
        error,
        clearError,
        router,
        insets,
        showDeleteModal,
        setShowDeleteModal,
        needsConnect,
        isBeneficiary,
        countrySupportsConnect,
        handleRefresh,
        handleLogout,
        getConnectDetails,
        getConnectSubtitle,
        handleDeleteAccount,
        confirmDeletion,
        getKYCSubtitle,
        shouldShowKYCAlert,
        translate
    } = useProfile()

  // Loading state
  if (isLoading || !user) {
    return (
      <GradientBackground>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            {translate("private.profile.loading")}
          </Text>
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>

      <View style={{ paddingTop: insets.top, flex: 1 }}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#007AFF"
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <ProfileHeader
            displayName={user.display_name}
            email={user.email}
            country={user.country}
            onEdit={() => router.push('/profileHome/edit')}
          />

          {/* Error Alert */}
          {error && (
            <AlertBanner
              type="error"
              message={error}
              onDismiss={clearError}
            />
          )}

          {/* KYC Alerts - Condicionales según estado */}
          {shouldShowKYCAlert() && user.kyc_status === 'kyc_pending' && (
            <AlertBanner
              type="warning"
              message={translate("private.profile.verificationMessage")}
              actionLabel={translate("private.profile.verificationButton")}
              onActionPress={() => router.push('/(auth)/kyc/welcome')}
            />
          )}

          {shouldShowKYCAlert() && user.kyc_status === 'kyc_rejected' && (
            <AlertBanner
              type="error"
              message={translate("private.profile.verificationFailed")}
              actionLabel={translate("private.profile.verificationFailedButton")}
              onActionPress={() => router.push('/(auth)/kyc/welcome')}
            />
          )}

          {/* Connect Alert */}
          {needsConnect && (
            <AlertBanner
              type="warning"
              message={translate("private.profile.completeStripeVerification")}
              actionLabel={translate("private.profile.completeStripeVerificationButton")}
              onActionPress={() => router.push('/profileHome/connect-details')}
            />
          )}

          {/* KYC Status Card - Solo badge, sin detalles ni navegación */}
          <StatusCard
            title={translate("private.profile.verificationKYC")}
            status={user.kyc_status}
            subtitle={getKYCSubtitle()}
            actionLabel={
              user.kyc_status === 'kyc_pending' ? translate("private.profile.initVerification") : undefined
            }
            onActionPress={
              user.kyc_status === 'kyc_pending'
                ? () => router.push('/(auth)/kyc/welcome')
                : undefined
            }
  
          />

          {/* Stripe Connect Card (solo si es beneficiario) */}
          {isBeneficiary && (
            <StatusCard
              title="Stripe Connect"
              status={
                !countrySupportsConnect
                  ? 'external'
                  : beneficiaryAccount?.connect_status || 'pending'
              }
              subtitle={getConnectSubtitle()}
              details={getConnectDetails()}
              actionLabel={
                countrySupportsConnect &&
                  beneficiaryAccount?.connect_status !== 'verified' &&
                  beneficiaryAccount?.connect_status !== 'active'
                  ? translate("private.profile.completeVerificationStripe")
                  : undefined
              }
              onActionPress={
                countrySupportsConnect &&
                  beneficiaryAccount?.connect_status !== 'verified' &&
                  beneficiaryAccount?.connect_status !== 'active'
                  ? () => router.push('/profileHome/connect-details')
                  : undefined
              }
              onPress={() => router.push('/profileHome/connect-details')}
            />
          )}

          {/* Stats Summary */}
          {stats && (
            <View style={styles.statsContainer}>
              {stats.totalCampaigns > 0 && (
                <View style={styles.statCard}>
                  <Ionicons name="folder-outline" size={24} color="#007AFF" />
                  <Text style={styles.statValue}>{stats.totalCampaigns}</Text>
                  <Text style={styles.statLabel}>
                    {stats.totalCampaigns === 1 ? 'Campaign' : 'Campaigns'}
                  </Text>
                </View>
              )}

              {stats.totalRaised > 0 && (
                <View style={styles.statCard}>
                  <Ionicons name="trending-up-outline" size={24} color="#10B981" />
                  <Text style={styles.statValue}>
                    {user.country} {stats.totalRaised.toLocaleString('es-CL')}
                  </Text>
                  <Text style={styles.statLabel}>
                    {translate("private.search.cardCollected")}
                  </Text>
                </View>
              )}

              {stats.beneficiaryCount > 0 && (
                <View style={styles.statCard}>
                  <Ionicons name="heart-outline" size={24} color="#F59E0B" />
                  <Text style={styles.statValue}>{stats.beneficiaryCount}</Text>
                  <Text style={styles.statLabel}>
                    {stats.beneficiaryCount === 1 ? translate("common.beneficiaries",{s: ''}) : translate("common.beneficiaries",{s: 's'})}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Owned Campaigns */}
          {ownedCampaigns.length > 0 && (
            <CampaignsList
              type="owner"
              campaigns={ownedCampaigns}
              onCampaignPress={(id) => { }}
              onSeeAll={() => router.push('/(auth)/(tabs)/arkHome')}
              maxItems={3}
            />
          )}

          {/* Beneficiary Campaigns */}
          {beneficiaryCampaigns.length > 0 && (
            <CampaignsList
              type="beneficiary"
              campaigns={beneficiaryCampaigns}
              onCampaignPress={(id) => { }}
              onSeeAll={() => router.push('/(auth)/(tabs)/profileHome')}
              maxItems={3}
            />
          )}

          {/* Logout Button */}

          <View style={{ paddingHorizontal: 20 }}>
            <ButtonXL
              mode='void'
              icon={'log-out-outline'}
              title={translate("common.logout")}
              action={handleLogout} />
            <ButtonXL
              title={translate("common.deleteAccount")}
              mode='danger'
              action={handleDeleteAccount} />
          </View>

          {/* Bottom spacing */}
          <View style={{ height: 142 }} />
        </ScrollView>
      </View>
       <DeleteAccountModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeletion}
      />
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 8,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
    marginLeft: 8,
  },
});