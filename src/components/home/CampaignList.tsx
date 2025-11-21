import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProfileCampaign, ProfileBeneficiaryCampaign } from '../../types/profile.types';
import { Colors } from '@/constants/theme';
import { useTheme } from '@react-navigation/native';
import { useThemeColors } from '@/hooks/use-theme-color';

interface CampaignsListProps {
  type: 'owner' | 'beneficiary';
  campaigns: ProfileCampaign[] | ProfileBeneficiaryCampaign[];
  onCampaignPress?: (campaignId: string) => void;
  onSeeAll?: () => void;
  maxItems?: number;
}

const formatCurrency = (amount: number, currency: string): string => {
  return `${currency} ${amount.toLocaleString('es-CL')}`;
};

const getStatusConfig = (status: string) => {
  const configs: Record<
    string,
    { color: string; label: string; icon: keyof typeof Ionicons.glyphMap }
  > = {
    draft: {
      color: '#6B7280',
      label: 'Borrador',
      icon: 'document-outline',
    },
    active: {
      color: '#10B981',
      label: 'Activa',
      icon: 'checkmark-circle',
    },
    paused: {
      color: '#F59E0B',
      label: 'Pausada',
      icon: 'pause-circle',
    },
    completed: {
      color: '#3B82F6',
      label: 'Completada',
      icon: 'checkmark-done-circle',
    },
    cancelled: {
      color: '#DC2626',
      label: 'Cancelada',
      icon: 'close-circle',
    },
  };
  return configs[status] || configs.draft;
};

const CampaignCard: React.FC<{
  campaign: ProfileCampaign | ProfileBeneficiaryCampaign;
  type: 'owner' | 'beneficiary';
  onPress?: () => void;
}> = ({ campaign, type, onPress }) => {
  // Type guards
  const isOwnerCampaign = (c: any): c is ProfileCampaign => type === 'owner';
  const isBeneficiaryCampaign = (c: any): c is ProfileBeneficiaryCampaign => type === 'beneficiary';

  // ✅ INICIALIZAR VARIABLES CON VALORES POR DEFECTO
  let title: string = '';
  let status: string = 'draft';
  let currentAmount: number = 0;
  let goalAmount: number = 0;
  let currency: string = 'CLP';
  let shareInfo: string | null = null;
  let ownerName: string | null = null;

  // Extract data based on type
  if (isOwnerCampaign(campaign)) {
    title = campaign.title;
    status = campaign.status;
    currentAmount = campaign.total_raised || 0;
    goalAmount = campaign.goal_amount || 0;
    currency = campaign.currency;
  } else if (isBeneficiaryCampaign(campaign)) {
    title = campaign.campaign.title;
    status = campaign.campaign.status;
    currentAmount = campaign.campaign.total_raised || 0;
    goalAmount = campaign.campaign.goal_amount || 0;
    currency = campaign.campaign.currency;
    ownerName = campaign.campaign.owner?.display_name || 'Desconocido';

    // Calculate share info
    if (campaign.share_type === 'percent') {
      shareInfo = `${campaign.share_value}% de participación`;
    } else {
      shareInfo = `${formatCurrency(campaign.share_value, currency)} fijo`;
    }
  }

  const progress = goalAmount > 0 ? (currentAmount / goalAmount) * 100 : 0;
  const statusConfig = getStatusConfig(status);

  return (
    <TouchableOpacity style={styles.campaignCard} onPress={onPress} activeOpacity={0.7}>
      {/* Header */}
      <View style={styles.campaignHeader}>
        <View style={styles.campaignTitleContainer}>
          <Text style={styles.campaignTitle} numberOfLines={1}>
            {title}
          </Text>
          {ownerName && (
            <Text style={styles.ownerName} numberOfLines={1}>
              por {ownerName}
            </Text>
          )}
        </View>

        <View style={[styles.statusBadge, { backgroundColor: `${statusConfig.color}20` }]}>
          <Ionicons name={statusConfig.icon} size={14} color={statusConfig.color} />
          <Text style={[styles.statusText, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
        </View>
      </View>

      {/* Share info for beneficiary */}
      {shareInfo && (
        <View style={styles.shareInfoContainer}>
          <Ionicons name="pie-chart-outline" size={16} color="#007AFF" />
          <Text style={styles.shareInfoText}>{shareInfo}</Text>
        </View>
      )}

      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${Math.min(progress, 100)}%` }]} />
        </View>

        <View style={styles.amountsContainer}>
          <Text style={styles.currentAmount}>{formatCurrency(currentAmount, currency)}</Text>
          <Text style={styles.goalAmount}>de {formatCurrency(goalAmount, currency)}</Text>
        </View>
      </View>

      {/* Progress percentage */}
      <Text style={styles.progressPercentage}>{progress.toFixed(0)}% alcanzado</Text>
    </TouchableOpacity>
  );
};

export const CampaignsList: React.FC<CampaignsListProps> = ({
  type,
  campaigns,
  onCampaignPress,
  onSeeAll,
  maxItems = 3,
}) => {
  const theme = useColorScheme();
  const title = type === 'owner' ? 'Mis Campañas' : 'Soy Beneficiario';
  const emptyMessage =
    type === 'owner'
      ? 'Aún no has creado ninguna campaña'
      : 'No eres beneficiario de ninguna campaña';

  const displayCampaigns = maxItems ? campaigns.slice(0, maxItems) : campaigns;

  const showSeeAll = campaigns.length > maxItems && onSeeAll;
  const titleColor = theme == 'dark' ? Colors.dark.text : Colors.light.text;
  if (campaigns.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>0</Text>
          </View>
        </View>

        <View style={styles.emptyContainer}>
          <Ionicons
            name={type === 'owner' ? 'folder-open-outline' : 'heart-outline'}
            size={48}
            color="#D1D5DB"
          />
          <Text style={styles.emptyText}>{emptyMessage}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{campaigns.length}</Text>
          </View>
        </View>

        {showSeeAll && (
          <TouchableOpacity onPress={onSeeAll} activeOpacity={0.7}>
            <Text style={styles.seeAllText}>Ver todas</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* List */}
      <View style={styles.listContainer}>
        {displayCampaigns.map((campaign) => {
          const campaignId =
            type === 'owner'
              ? (campaign as ProfileCampaign).id
              : (campaign as ProfileBeneficiaryCampaign).campaign.id;

          return (
            <CampaignCard
              key={campaignId}
              campaign={campaign}
              type={type}
              onPress={() => onCampaignPress?.(campaignId)}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginRight: 8,
  },
  countBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center',
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  campaignCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  campaignHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  campaignTitleContainer: {
    flex: 1,
    marginRight: 8,
  },
  campaignTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  ownerName: {
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
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  shareInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  shareInfoText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 6,
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  amountsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  currentAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  goalAmount: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressPercentage: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  emptyContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 40,
    marginHorizontal: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 12,
  },
});
