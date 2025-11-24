// app/(auth)/(tabs)/profile/index.tsx

import ButtonXL from '@/src/components/common/ButtonXL';
import { GradientBackground } from '@/src/components/common/GradiendBackground';
import { AlertBanner } from '@/src/components/home/AlertBanner';
import { CampaignsList } from '@/src/components/home/CampaignList';
import { DeleteAccountModal } from '@/src/components/home/DeleteUserModal';
import { ProfileHeader } from '@/src/components/home/ProfileHeader';
import { StatusCard } from '@/src/components/home/StatusCard';
import { supabase } from '@/src/lib/supabaseClient';
import { profileSelectors, useProfileStore } from '@/src/stores/profile.store';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
   const [showDeleteModal, setShowDeleteModal] = useState(false); // ✅ Estado del modal
  const [isDeleting, setIsDeleting] = useState(false); // ✅ Estado de carga

  // Store state
  const {
    user,
    kycDocuments,
    beneficiaryAccount,
    ownedCampaigns,
    beneficiaryCampaigns,
    alerts,
    stats,
    isLoading,
    isRefreshing,
    error,
    fetchProfile,
    refreshCampaigns,
    logout,
    clearError,
  } = useProfileStore();

  // Selectors
  const needsConnect = useProfileStore(profileSelectors.needsConnect);
  const isBeneficiary = useProfileStore(profileSelectors.isBeneficiary);
  const countrySupportsConnect = useProfileStore(profileSelectors.countrySupportsConnect);

  // Load profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  // Handle refresh
  const handleRefresh = async () => {
    await refreshCampaigns();
  };

  // Handle logout
  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(public)/welcome');
          },
        },
      ]
    );
  };

  // Get Connect status details
  const getConnectDetails = () => {
    if (!beneficiaryAccount) return undefined;

    const details: string[] = [];

    if (beneficiaryAccount.bank_account_last4) {
      details.push(`Cuenta: ****${beneficiaryAccount.bank_account_last4}`);
    }

    if (beneficiaryAccount.bank_name) {
      details.push(`Banco: ${beneficiaryAccount.bank_name}`);
    }

    return details.length > 0 ? details : undefined;
  };

  // Get Connect subtitle
  const getConnectSubtitle = () => {
    if (!isBeneficiary) {
      return 'No eres beneficiario de ninguna campaña';
    }

    if (!countrySupportsConnect) {
      return 'Tu país requiere transferencia manual';
    }

    const status = beneficiaryAccount?.connect_status;

    switch (status) {
      case 'verified':
      case 'active':
        return 'Puedes recibir pagos automáticamente';
      case 'pending':
      case 'onboarding':
        return 'Completa tu verificación para recibir pagos';
      case 'rejected':
        return 'Tu verificación fue rechazada. Contacta a soporte.';
      default:
        return 'Verifica tu cuenta para recibir pagos automáticamente';
    }
  };
    // ✅ Handle delete account - NUEVO
  const handleDeleteAccount = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'No se pudo identificar tu cuenta');
      return;
    }

    setIsDeleting(true);

    try {
      console.log('🔍 Verificando si la cuenta puede ser eliminada...');

      // 1. Verificar si tiene campañas activas con fondos
      const { data: activeCampaigns, error: campaignsError } = await supabase
        .from('campaigns')
        .select('id, title, total_raised, status')
        .eq('owner_user_id', user.id)
        .in('status', ['active', 'triggered'])
        .gt('total_raised', 0);

      if (campaignsError) {
        console.error('Error verificando campañas:', campaignsError);
        throw new Error('No se pudo verificar el estado de tus campañas');
      }

      console.log('Campañas activas con fondos:', activeCampaigns?.length || 0);

      if (activeCampaigns && activeCampaigns.length > 0) {
        // 🚫 No puede eliminar
        setIsDeleting(false);
        
        const campaignsList = activeCampaigns
          .map(c => `• ${c.title}: $${c.total_raised}`)
          .join('\n');

        Alert.alert(
          '⚠️ No se puede eliminar la cuenta',
          `Tienes ${activeCampaigns.length} campaña(s) activa(s) con fondos:\n\n${campaignsList}\n\n` +
          '⚖️ Por obligaciones legales y para proteger a los beneficiarios, debes primero:\n\n' +
          '1️⃣ Completar la distribución de fondos, o\n' +
          '2️⃣ Cancelar las campañas y procesar reembolsos\n\n' +
          '📧 Contacta a soporte para asistencia.',
          [
            {
              text: 'Contactar Soporte',
              onPress: () => {
                Linking.openURL(
                  `mailto:support@lark.app?subject=Solicitud de Eliminación de Cuenta&body=User ID: ${user.id}%0A%0ACampañas activas: ${activeCampaigns.length}`
                );
              }
            },
            { text: 'Entendido', style: 'cancel' }
          ]
        );
        return;
      }

      // 2. Si puede eliminar, mostrar modal de razones
      setIsDeleting(false);
      setShowDeleteModal(true);

    } catch (error: any) {
      setIsDeleting(false);
      console.error('Error en handleDeleteAccount:', error);
      Alert.alert('Error', error.message || 'No se pudo verificar el estado de tu cuenta.');
    }
  };

  // ✅ Confirmar eliminación con razón - NUEVO
  const confirmDeletion = async (reason: string) => {
    if (!user?.id) return;

    try {
      console.log('🗑️ Eliminando cuenta con razón:', reason);

      // Llamar a Edge Function
      const { data, error } = await supabase.functions.invoke('delete-user-account', {
        body: { 
          userId: user.id,
          reason: reason
        }
      });

      console.log('Respuesta de función:', { data, error });

      if (error) {
        console.error('Error de función:', error);
        throw new Error(error.message || 'Error al eliminar la cuenta');
      }

      if (data?.error) {
        console.error('Error en data:', data.error);
        Alert.alert('No se puede eliminar', data.error);
        setShowDeleteModal(false);
        return;
      }

      console.log('✅ Cuenta eliminada exitosamente');

      // Cerrar modal
      setShowDeleteModal(false);

      // Cerrar sesión
      await supabase.auth.signOut();

      // Mostrar confirmación y redirigir
      Alert.alert(
        '✅ Cuenta Eliminada',
        'Tu cuenta ha sido eliminada exitosamente. Ya no podrás acceder a L-ark con este email.',
        [
          { 
            text: 'Entendido', 
            onPress: () => {
              router.replace('/(public)/welcome');
            }
          }
        ],
        { cancelable: false }
      );

    } catch (error: any) {
      console.error('Error en confirmDeletion:', error);
      setShowDeleteModal(false);
      Alert.alert(
        'Error', 
        error.message || 'No se pudo eliminar la cuenta. Intenta nuevamente o contacta a soporte.'
      );
    }
  };
  // Get KYC subtitle based on status
  const getKYCSubtitle = () => {
    switch (user?.kyc_status) {
      case 'kyc_verified':
        return 'Tu identidad ha sido verificada exitosamente';
      case 'kyc_review':
        return 'Estamos revisando tus documentos. Te notificaremos pronto';
      case 'kyc_rejected':
        return 'Tu verificación fue rechazada. Debes realizarla nuevamente';
      case 'kyc_pending':
      default:
        return 'Debes completar tu verificación de identidad';
    }
  };

  // Determine if should show KYC alert
  const shouldShowKYCAlert = () => {
    if (!user) return false;

    const hasActivities = ownedCampaigns.length > 0 || beneficiaryCampaigns.length > 0;

    // Solo mostrar alert si tiene actividades Y está pending o rejected
    return hasActivities && (user.kyc_status === 'kyc_pending' || user.kyc_status === 'kyc_rejected');
  };

  // Loading state
  if (isLoading || !user) {
    return (
      <GradientBackground>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando perfil...</Text>
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
              message="Completa tu verificación de identidad para crear campañas y recibir pagos"
              actionLabel="Iniciar verificación"
              onActionPress={() => router.push('/(auth)/kyc/welcome')}
            />
          )}

          {shouldShowKYCAlert() && user.kyc_status === 'kyc_rejected' && (
            <AlertBanner
              type="error"
              message="Tu verificación falló. Debes realizar el proceso nuevamente para poder continuar"
              actionLabel="Intentar nuevamente"
              onActionPress={() => router.push('/(auth)/kyc/welcome')}
            />
          )}

          {/* Connect Alert */}
          {needsConnect && (
            <AlertBanner
              type="warning"
              message="Completa tu verificación de Stripe para recibir pagos automáticamente"
              actionLabel="Completar ahora"
              onActionPress={() => router.push('/profileHome/connect-details')}
            />
          )}

          {/* KYC Status Card - Solo badge, sin detalles ni navegación */}
          <StatusCard
            title="Verificación KYC"
            status={user.kyc_status}
            subtitle={getKYCSubtitle()}
            // ✅ Solo mostrar botón si está en pending
            actionLabel={
              user.kyc_status === 'kyc_pending' ? 'Iniciar verificación' : undefined
            }
            onActionPress={
              user.kyc_status === 'kyc_pending'
                ? () => router.push('/(auth)/kyc/welcome')
                : undefined
            }
          // ❌ Sin navegación a detalles (quitar onPress)
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
                  ? 'Completar verificación'
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
                    {stats.totalCampaigns === 1 ? 'Campaña' : 'Campañas'}
                  </Text>
                </View>
              )}

              {stats.totalRaised > 0 && (
                <View style={styles.statCard}>
                  <Ionicons name="trending-up-outline" size={24} color="#10B981" />
                  <Text style={styles.statValue}>
                    {user.country} {stats.totalRaised.toLocaleString('es-CL')}
                  </Text>
                  <Text style={styles.statLabel}>Recaudado</Text>
                </View>
              )}

              {stats.beneficiaryCount > 0 && (
                <View style={styles.statCard}>
                  <Ionicons name="heart-outline" size={24} color="#F59E0B" />
                  <Text style={styles.statValue}>{stats.beneficiaryCount}</Text>
                  <Text style={styles.statLabel}>
                    {stats.beneficiaryCount === 1 ? 'Beneficiario' : 'Beneficiario de'}
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
              title={'Cerrar Sesión'}
              action={handleLogout} />
            <ButtonXL
              title={'Eliminar Cuenta'}
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