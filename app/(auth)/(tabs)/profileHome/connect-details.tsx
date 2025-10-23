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

export default function ConnectDetailsScreen() {
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
            'Completando verificación',
            'Cuando termines el proceso en Stripe, regresa a la app para ver tu estado actualizado.',
            [
              {
                text: 'Entendido',
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
          throw new Error('No se puede abrir el enlace');
        }
      }
    } catch (error: any) {
      console.error('Error starting onboarding:', error);
      Alert.alert(
        'Error',
        error.message || 'No se pudo iniciar la verificación. Intenta nuevamente.'
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
    Alert.alert('Actualizado', 'Estado de verificación actualizado');
  };

  // Get status info
  const getStatusInfo = () => {
    if (!isBeneficiary) {
      return {
        color: '#6B7280',
        backgroundColor: '#F3F4F6',
        icon: 'information-circle-outline' as const,
        title: 'No eres beneficiario',
        message: 'No estás registrado como beneficiario en ninguna campaña. Stripe Connect solo es necesario para recibir pagos automáticos como beneficiario.',
        showAction: false,
      };
    }

    if (!countrySupportsConnect) {
      return {
        color: '#8B5CF6',
        backgroundColor: '#EDE9FE',
        icon: 'document-outline' as const,
        title: 'Pago Manual',
        message: `Tu país (${user?.country || 'desconocido'}) no soporta Stripe Connect actualmente. Los pagos serán procesados manualmente cuando se active la causal.`,
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
          title: '✅ Verificación Completa',
          message: 'Tu cuenta de Stripe Connect está verificada y activa. Puedes recibir pagos automáticamente cuando se active la causal.',
          showAction: false,
        };
      
      case 'onboarding':
        return {
          color: '#3B82F6',
          backgroundColor: '#DBEAFE',
          icon: 'document-text-outline' as const,
          title: '📝 En Proceso',
          message: 'Estás en proceso de completar tu verificación. Continúa donde lo dejaste.',
          showAction: true,
          actionLabel: 'Continuar verificación',
        };
      
      case 'pending':
        return {
          color: '#F59E0B',
          backgroundColor: '#FEF3C7',
          icon: 'hourglass-outline' as const,
          title: '⏳ Pendiente',
          message: 'Tu verificación está pendiente. Stripe está revisando tu información.',
          showAction: true,
          actionLabel: 'Revisar estado',
        };
      
      case 'rejected':
        return {
          color: '#DC2626',
          backgroundColor: '#FEE2E2',
          icon: 'close-circle' as const,
          title: '❌ Rechazado',
          message: 'Tu verificación fue rechazada por Stripe. Contacta a soporte para más información.',
          showAction: true,
          actionLabel: 'Contactar soporte',
        };
      
      default:
        return {
          color: '#F59E0B',
          backgroundColor: '#FEF3C7',
          icon: 'warning-outline' as const,
          title: '⚠️ Verificación Requerida',
          message: 'Completa tu verificación de Stripe Connect para recibir pagos automáticamente cuando se active la causal.',
          showAction: true,
          actionLabel: 'Iniciar verificación',
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
            {isLoading ? 'Cargando...' : statusInfo.actionLabel}
          </Text>
        </TouchableOpacity>
      )}

      {/* Account Details */}
      {beneficiaryAccount && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalles de Cuenta</Text>
          
          <View style={styles.detailCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>ID de Cuenta</Text>
              <Text style={styles.detailValue}>
                {beneficiaryAccount.stripe_connect_account_id
                  ? `...${beneficiaryAccount.stripe_connect_account_id.slice(-8)}`
                  : 'Sin asignar'}
              </Text>
            </View>

            <View style={styles.separator} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>País</Text>
              <Text style={styles.detailValue}>
                {beneficiaryAccount.country}
              </Text>
            </View>

            <View style={styles.separator} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Modo de Pago</Text>
              <Text style={styles.detailValue}>
                {beneficiaryAccount.payout_mode === 'connect'
                  ? 'Automático (Stripe)'
                  : 'Manual'}
              </Text>
            </View>

            {beneficiaryAccount.bank_account_last4 && (
              <>
                <View style={styles.separator} />
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Cuenta Bancaria</Text>
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
                  <Text style={styles.detailLabel}>Banco</Text>
                  <Text style={styles.detailValue}>
                    {beneficiaryAccount.bank_name}
                  </Text>
                </View>
              </>
            )}

            <View style={styles.separator} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Creado</Text>
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
            Campañas donde eres beneficiario ({beneficiaryCampaigns.length})
          </Text>

          <View style={styles.campaignsList}>
            {beneficiaryCampaigns.map((bc) => (
              <View key={bc.id} style={styles.campaignCard}>
                <Text style={styles.campaignTitle}>{bc.campaign.title}</Text>
                <Text style={styles.campaignOwner}>
                  por {bc.campaign.owner.display_name}
                </Text>
                
                <View style={styles.shareInfo}>
                  <Ionicons name="pie-chart-outline" size={16} color="#007AFF" />
                  <Text style={styles.shareText}>
                    {bc.share_type === 'percent'
                      ? `${bc.share_value}% de participación`
                      : `${bc.campaign.currency} ${bc.share_value.toLocaleString('es-CL')} fijo`}
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
          <Text style={styles.infoTitle}>¿Qué es Stripe Connect?</Text>
          <Text style={styles.infoText}>
            Stripe Connect permite recibir pagos automáticamente en tu cuenta bancaria cuando
            se active la causal de la campaña. Es seguro, rápido y está regulado.
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
        <Text style={styles.refreshText}>Actualizar estado</Text>
      </TouchableOpacity>

      {/* Support Button */}
      <TouchableOpacity style={styles.supportButton}>
        <Ionicons name="help-circle-outline" size={20} color="#007AFF" />
        <Text style={styles.supportText}>¿Problemas? Contacta a soporte</Text>
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