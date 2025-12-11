// app/(auth)/(tabs)/profile/kyc-details.tsx

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useProfileStore } from '../../../../src/stores/profile.store';
import { useTranslation } from 'react-i18next';


export default function KYCDetailsScreen() {
  const router = useRouter();
  const {t:translate} = useTranslation("common");
  const { user, kycDocuments } = useProfileStore();

  const DOCUMENT_LABELS: Record<string, string> = {
    id_front: translate("private.kyc.labelFrontId"),
    id_back: translate("private.kyc.labelBackId"),
    selfie: translate("private.kyc.labelSelfie"),
    proof_of_address: translate("private.kyc.labelPOA"),
  };
  
  const STATUS_CONFIG: Record<string, { color: string; icon: keyof typeof Ionicons.glyphMap; label: string }> = {
    pending: {
      color: '#F59E0B',
      icon: 'hourglass-outline',
      label: translate("common.pending"),
    },
    approved: {
      color: '#10B981',
      icon: 'checkmark-circle',
      label: translate("common.approved"),
    },
    rejected: {
      color: '#DC2626',
      icon: 'close-circle',
      label: translate("common.rejected"),
    },
  };

  const getKYCStatusInfo = () => {
    switch (user?.kyc_status) {
      case 'kyc_verified':
        return {
          color: '#10B981',
          backgroundColor: '#D1FAE5',
          icon: 'checkmark-circle' as const,
          title: translate("private.kyc.statusVerifiedTitle"),
          message: translate("private.kyc.messageVerified"),
        };
      case 'kyc_review':
        return {
          color: '#F59E0B',
          backgroundColor: '#FEF3C7',
          icon: 'time-outline' as const,
          title: translate("private.kyc.statusReviewTitle"),
          message: translate("private.kyc.messageReview"),
        };
      case 'kyc_rejected':
        return {
          color: '#DC2626',
          backgroundColor: '#FEE2E2',
          icon: 'close-circle' as const,
          title: translate("private.kyc.statusRejectedTitle"),
          message: translate("private.kyc.messageRejected"),
        };
      default:
        return {
          color: '#6B7280',
          backgroundColor: '#F3F4F6',
          icon: 'hourglass-outline' as const,
          title: translate("private.kyc.statusPendingTitle"),
          message: translate("private.kyc.messagePending"),
        };
    }
  };

  const statusInfo = getKYCStatusInfo();
  const hasRejectedDocs = kycDocuments.some((doc) => doc.status === 'rejected');

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

      {/* Documents List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {translate("private.kyc.documentsUploaded")}
        </Text>

        {kycDocuments.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>

              {translate("private.kyc.noDocuments")}
            </Text>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => router.push('/(auth)/kyc/welcome')}
            >
              <Text style={styles.uploadButtonText}>
                {translate("private.kyc.uploadDocuments")}
                </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.documentsList}>
            {kycDocuments.map((doc) => {
              const statusConfig = STATUS_CONFIG[doc.status];
              return (
                <View key={doc.id} style={styles.documentCard}>
                  <View style={styles.documentHeader}>
                    <View style={styles.documentInfo}>
                      <Ionicons
                        name="document-text-outline"
                        size={24}
                        color="#1F2937"
                      />
                      <View style={styles.documentTextContainer}>
                        <Text style={styles.documentTitle}>
                          {DOCUMENT_LABELS[doc.document_type] || doc.document_type}
                        </Text>
                        <Text style={styles.documentDate}>
                          Subido el {new Date(doc.created_at).toLocaleDateString('es-CL')}
                        </Text>
                      </View>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: `${statusConfig.color}20` },
                      ]}
                    >
                      <Ionicons
                        name={statusConfig.icon}
                        size={14}
                        color={statusConfig.color}
                      />
                      <Text style={[styles.statusBadgeText, { color: statusConfig.color }]}>
                        {statusConfig.label}
                      </Text>
                    </View>
                  </View>

                  {/* Rejection Reason */}
                  {doc.status === 'rejected' && doc.rejection_reason && (
                    <View style={styles.rejectionBox}>
                      <Ionicons name="warning-outline" size={16} color="#DC2626" />
                      <Text style={styles.rejectionText}>{doc.rejection_reason}</Text>
                    </View>
                  )}

                  {/* Reviewed Info */}
                  {doc.reviewed_at && (
                    <Text style={styles.reviewedText}>
                      Revisado el {new Date(doc.reviewed_at).toLocaleDateString('es-CL')}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* Actions */}
      {user?.kyc_status === 'kyc_pending' && (
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/(auth)/kyc/welcome')}
        >
          <Ionicons name="cloud-upload-outline" size={20} color="#FFF" />
          <Text style={styles.primaryButtonText}>
            {translate("private.kyc.uploadDocuments")}
            
          </Text>
        </TouchableOpacity>
      )}

      {hasRejectedDocs && (
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/(auth)/kyc/welcome')}
        >
          <Ionicons name="refresh-outline" size={20} color="#FFF" />
          <Text style={styles.primaryButtonText}>
            {translate("private.kyc.uploadAgain")}
          </Text>
        </TouchableOpacity>
      )}

      {/* Info Box */}
      <View style={styles.infoBox}>
        <Ionicons name="information-circle-outline" size={24} color="#007AFF" />
        <View style={styles.infoTextContainer}>
          <Text style={styles.infoTitle}>{translate("private.kyc.infoTitle")}</Text>
          <Text style={styles.infoText}>
          {translate("private.kyc.infoText")}
          </Text>
        </View>
      </View>

      {/* Contact Support */}
      <TouchableOpacity style={styles.supportButton}>
        <Ionicons name="help-circle-outline" size={20} color="#007AFF" />
        <Text style={styles.supportText}>
          {translate("private.kyc.supportText")}
        </Text>
      </TouchableOpacity>

      <View style={{ height: 32 }} />
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  emptyState: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 12,
    marginBottom: 20,
  },
  uploadButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  uploadButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
  documentsList: {
    gap: 12,
  },
  documentCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
  },
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  documentInfo: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 12,
  },
  documentTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  documentTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  documentDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  rejectionBox: {
    flexDirection: 'row',
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  rejectionText: {
    flex: 1,
    fontSize: 13,
    color: '#DC2626',
    marginLeft: 8,
    lineHeight: 18,
  },
  reviewedText: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 8,
  },
  primaryButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginLeft: 8,
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