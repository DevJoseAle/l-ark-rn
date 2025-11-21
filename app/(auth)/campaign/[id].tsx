// app/(auth)/campaign/[id].tsx
import { Colors } from '@/constants/theme';
import DonateModal from '@/src/components/common/DonateModal';
import FloatingDonateButton from '@/src/components/common/FloatingDonatingButton';
import { GradientBackground } from '@/src/components/common/GradiendBackground';
import { ImageGalleryViewer, ImageGridViewer } from '@/src/components/common/ImageGalleryViewer';
import { CampaignService } from '@/src/services/campaign.service';
import { SharingService } from '@/src/services/share.service';
import { useAuthStore } from '@/src/stores/authStore';
import { CampaignDetail } from '@/src/types/campaign.types';
import { Formatters } from '@/src/utils/formatters';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const STATUS_CONFIG = {
  draft: { label: 'Borrador', color: '#FF9800', icon: 'create-outline' as const },
  active: { label: 'Activa', color: '#4CAF50', icon: 'checkmark-circle-outline' as const },
  paused: { label: 'Pausada', color: '#9E9E9E', icon: 'pause-circle-outline' as const },
  completed: { label: 'Completada', color: '#2196F3', icon: 'trophy-outline' as const },
  cancelled: { label: 'Cancelada', color: '#F44336', icon: 'close-circle-outline' as const },
};

export default function CampaignDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuthStore();
  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const isOwnCampaign = campaign?.owner_user_id === user?.id;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDonateModal, setShowDonateModal] = useState(false);

  const campaignId = params.id as string;
  const handleBackPress = () => {
      router.replace('/(auth)/(tabs)/arkHome');
  };

  // Determinar si es campaña propia
  const canDonate = campaign?.status === 'active' && !isOwnCampaign;
  useEffect(() => {
    loadCampaign();
  }, [campaignId]);

  const loadCampaign = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = campaignId
        ? await CampaignService.getCampaignById(campaignId)
        : await CampaignService.getCurrentUserCampaign();

      if (!data) {
        setError('Campaña no encontrada');
        return;
      }

      setCampaign(data);
    } catch (err: any) {
      console.error('Error loading campaign:', err);
      setError(err?.message || 'Error al cargar la campaña');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (!campaign) return;
    try {
      await SharingService.shareCampaign(campaign);
    } catch (error) {
      Alert.alert('Error', 'No se pudo compartir la campaña');
    }
  };
  
  if (isLoading) {
    return (
      <GradientBackground>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </GradientBackground>
    );
  }

  if (error || !campaign) {
    return (
      <GradientBackground>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.text }]}>
            {error || 'Campaña no encontrada'}
          </Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.buttonText, { color: colors.customWhite }]}>
              Volver
            </Text>
          </TouchableOpacity>
        </View>
      </GradientBackground>
    );
  }

  const mainImage = CampaignService.getMainImage(campaign.images);
  const progress = CampaignService.getProgressPercentage(
    campaign.total_raised,
    campaign.goal_amount ?? 0
  );
  const daysRemaining = CampaignService.getDaysRemaining(campaign.end_at ?? '');
  const statusConfig = STATUS_CONFIG[campaign.status];

  const campaignImages = campaign.images.filter(
    img => img.image_type === 'campaign' || img.image_type === 'main'
  );
  const diagnosisImages = campaign.images.filter(
    img => img.image_type === 'diagnosis'
  );

  const handleOpenDonateModal = () => {
    setShowDonateModal(true);
  };

  const handleCloseDonateModal = () => {
    setShowDonateModal(false);
  };
  return (
    <GradientBackground>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HERO IMAGE */}
        <ImageGalleryViewer
          images={mainImage ? [{ uri: mainImage }] : []}
          style={[styles.heroContainer,]}
        >
          <View style={styles.heroContainer}>
            {mainImage ? (
              <Image source={{ uri: mainImage }} style={styles.heroImage} />
            ) : (
              <View style={[styles.heroPlaceholder, { backgroundColor: colors.separator }]}>
                <Ionicons name="image-outline" size={64} color={colors.icon} />
              </View>
            )}

            {/* Gradient Overlay */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.heroGradient}
            />

            {/* Header Buttons */}
            <View style={styles.headerButtons}>
              <TouchableOpacity
                style={[styles.headerButton, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
                onPress={handleBackPress}
              >
                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>

              <View style={styles.headerRight}>
                <TouchableOpacity
                  style={[styles.headerButton, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
                  onPress={handleShare}
                >
                  <Ionicons name="share-outline" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Status Badge */}
            <View style={styles.statusBadgeContainer}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: statusConfig.color },
                ]}
              >
                <Ionicons name={statusConfig.icon} size={16} color="#FFFFFF" />
                <Text style={styles.statusText}>{statusConfig.label}</Text>
              </View>
            </View>
          </View>
        </ImageGalleryViewer>

        {/* CONTENT */}
        <View style={styles.content}>
          {/* Title & Owner */}
          <View style={styles.titleSection}>
            <Text style={[styles.title, { color: colors.text }]}>
              {campaign.title}
            </Text>
            <Text style={[styles.owner, { color: colors.secondaryText }]}>
              por @{campaign.owner.display_name}
            </Text>
          </View>

          {/* Progress Card */}
          <View
            style={[
              styles.card,
              {
                backgroundColor:
                  colorScheme === 'dark'
                    ? 'rgba(30, 42, 54, 0.7)'
                    : 'rgba(251, 252, 251, 0.7)',
                borderColor:
                  colorScheme === 'dark'
                    ? 'rgba(42, 63, 84, 0.5)'
                    : 'rgba(172, 202, 231, 0.3)',
              },
            ]}
          >
            <View style={styles.progressHeader}>
              <Text style={[styles.progressPercentage, { color: colors.primary }]}>
                {progress}%
              </Text>
              <View style={styles.daysContainer}>
                <Ionicons name="time-outline" size={16} color={colors.secondaryText} />
                <Text style={[styles.daysText, { color: colors.secondaryText }]}>
                  {daysRemaining} días restantes
                </Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={[styles.progressBarBg, { backgroundColor: colors.separator }]}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${progress}%`,
                    backgroundColor: colors.primary,
                  },
                ]}
              />
            </View>

            {/* Amounts */}
            <View style={styles.amountsRow}>
              <View>
                <Text style={[styles.amountLabel, { color: colors.secondaryText }]}>
                  Recaudado
                </Text>
                <Text style={[styles.amountValue, { color: colors.text }]}>
                  {Formatters.formatCLP(campaign.total_raised)}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.amountLabel, { color: colors.secondaryText }]}>
                  Meta
                </Text>
                <Text style={[styles.amountValue, { color: colors.text }]}>
                  {Formatters.formatCLP(campaign.goal_amount ?? 0)}
                </Text>
              </View>
            </View>
          </View>

          {/* Description Card */}
          <View
            style={[
              styles.card,
              {
                backgroundColor:
                  colorScheme === 'dark'
                    ? 'rgba(30, 42, 54, 0.7)'
                    : 'rgba(251, 252, 251, 0.7)',
                borderColor:
                  colorScheme === 'dark'
                    ? 'rgba(42, 63, 84, 0.5)'
                    : 'rgba(172, 202, 231, 0.3)',
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <Ionicons name="document-text-outline" size={24} color={colors.primary} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Descripción
              </Text>
            </View>
            <Text style={[styles.description, { color: colors.text }]}>
              {campaign.description}
            </Text>
          </View>

          {/* Goals Card */}
          <View
            style={[
              styles.card,
              {
                backgroundColor:
                  colorScheme === 'dark'
                    ? 'rgba(30, 42, 54, 0.7)'
                    : 'rgba(251, 252, 251, 0.7)',
                borderColor:
                  colorScheme === 'dark'
                    ? 'rgba(42, 63, 84, 0.5)'
                    : 'rgba(172, 202, 231, 0.3)',
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <Ionicons name="flag-outline" size={24} color={colors.primary} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>Metas</Text>
            </View>

            <View style={styles.goalItem}>
              <View style={[styles.goalIcon, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="trophy" size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.goalLabel, { color: colors.secondaryText }]}>
                  Meta total
                </Text>
                <Text style={[styles.goalValue, { color: colors.text }]}>
                  {Formatters.formatCLP(campaign.goal_amount ?? 0)}
                </Text>
              </View>
            </View>

            <View style={styles.goalItem}>
              <View style={[styles.goalIcon, { backgroundColor: colors.warning + '20' }]}>
                <Ionicons name="shield" size={20} color={colors.warning} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.goalLabel, { color: colors.secondaryText }]}>
                  Meta mínima
                </Text>
                <Text style={[styles.goalValue, { color: colors.text }]}>
                  {Formatters.formatCLP(campaign.soft_cap ?? 0)}
                </Text>
              </View>
            </View>

            {campaign.hard_cap && (
              <View style={styles.goalItem}>
                <View style={[styles.goalIcon, { backgroundColor: colors.success + '20' }]}>
                  <Ionicons name="rocket" size={20} color={colors.success} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.goalLabel, { color: colors.secondaryText }]}>
                    Meta media
                  </Text>
                  <Text style={[styles.goalValue, { color: colors.text }]}>
                    {Formatters.formatCLP(campaign.hard_cap)}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Beneficiaries Card */}
          {campaign.beneficiaries.length > 0 && (
            <View
              style={[
                styles.card,
                {
                  backgroundColor:
                    colorScheme === 'dark'
                      ? 'rgba(30, 42, 54, 0.7)'
                      : 'rgba(251, 252, 251, 0.7)',
                  borderColor:
                    colorScheme === 'dark'
                      ? 'rgba(42, 63, 84, 0.5)'
                      : 'rgba(172, 202, 231, 0.3)',
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <Ionicons name="people-outline" size={24} color={colors.primary} />
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  Beneficiarios
                </Text>
              </View>

              {campaign.beneficiaries.map((beneficiary) => (
                <View key={beneficiary.id} style={styles.beneficiaryItem}>
                  <View
                    style={[styles.beneficiaryAvatar, { backgroundColor: colors.primary }]}
                  >
                    <Text style={[styles.beneficiaryAvatarText, { color: colors.customWhite }]}>
                      {beneficiary.user.display_name.substring(0, 2).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.beneficiaryNameRow}>
                      <Text style={[styles.beneficiaryName, { color: colors.text }]}>
                        {beneficiary.user.display_name}
                      </Text>
                      {beneficiary.user.kyc_status === 'kyc_verified' && (
                        <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                      )}
                    </View>
                    <Text style={[styles.beneficiaryEmail, { color: colors.secondaryText }]}>
                      {beneficiary.user.email}
                    </Text>
                  </View>
                  <View style={[styles.shareBadge, { backgroundColor: colors.primary + '20' }]}>
                    <Text style={[styles.shareText, { color: colors.primary }]}>
                      {beneficiary.share_value}
                      {beneficiary.share_type === 'percent' ? '%' : ''}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Campaign Images Gallery */}
          {/* Campaign Images Gallery */}
          {campaignImages.length > 0 && (
            <View
              style={[
                styles.card,
                {
                  backgroundColor:
                    colorScheme === 'dark'
                      ? 'rgba(30, 42, 54, 0.7)'
                      : 'rgba(251, 252, 251, 0.7)',
                  borderColor:
                    colorScheme === 'dark'
                      ? 'rgba(42, 63, 84, 0.5)'
                      : 'rgba(172, 202, 231, 0.3)',
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <Ionicons name="images-outline" size={24} color={colors.primary} />
                <Text style={[styles.cardTitle, { color: colors.text }]}>Galería</Text>
              </View>

              <View style={styles.galleryGrid}>
                <ImageGridViewer
                  images={campaignImages.map(img => ({ uri: img.image_url }))}
                  renderItem={(image, index) => (
                    <Image
                      key={index}
                      source={{ uri: image.uri }}
                      style={styles.galleryImage}
                    />
                  )}
                />
              </View>
            </View>
          )}

          {/* Diagnosis Images */}
          {/* Diagnosis Images */}
          {campaign.has_diagnosis && diagnosisImages.length > 0 && (
            <View
              style={[
                styles.card,
                {
                  backgroundColor:
                    colorScheme === 'dark'
                      ? 'rgba(30, 42, 54, 0.7)'
                      : 'rgba(251, 252, 251, 0.7)',
                  borderColor:
                    colorScheme === 'dark'
                      ? 'rgba(42, 63, 84, 0.5)'
                      : 'rgba(172, 202, 231, 0.3)',
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <Ionicons name="medical-outline" size={24} color={colors.error} />
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  Diagnóstico Médico
                </Text>
              </View>

              <View style={styles.galleryGrid}>
                <ImageGridViewer
                  images={diagnosisImages.map(img => ({ uri: img.image_url }))}
                  renderItem={(image, index) => (
                    <Image
                      key={index}
                      source={{ uri: image.uri }}
                      style={styles.galleryImage}
                    />
                  )}
                />
              </View>
            </View>
          )}

          {/* Spacer */}
          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
      {canDonate && (
        <FloatingDonateButton
          onPress={handleOpenDonateModal}
          disabled={campaign?.status !== 'active'}
        />
      )}
       <DonateModal
            visible={showDonateModal}
            onClose={handleCloseDonateModal}
            campaignId={campaign.id}
            campaignTitle={campaign.title}
            shortCode={campaign.short_code}
          />
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },

  // Hero Section
  heroContainer: {
    width: SCREEN_WIDTH,
    height: 320,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  headerButtons: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  statusBadgeContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },

  // Content
  content: {
    paddingHorizontal: 16,
    marginTop: 10,
  },
  titleSection: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 6,
    lineHeight: 34,
  },
  owner: {
    fontSize: 15,
  },

  // Cards
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },

  // Progress
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressPercentage: {
    fontSize: 32,
    fontWeight: '700',
  },
  daysContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  daysText: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressBarBg: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  amountsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  amountLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 18,
    fontWeight: '700',
  },

  // Description
  description: {
    fontSize: 15,
    lineHeight: 22,
  },

  // Goals
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  goalIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalLabel: {
    fontSize: 13,
    marginBottom: 2,
  },
  goalValue: {
    fontSize: 16,
    fontWeight: '700',
  },

  // Beneficiaries
  beneficiaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  beneficiaryAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  beneficiaryAvatarText: {
    fontSize: 16,
    fontWeight: '700',
  },
  beneficiaryNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  beneficiaryName: {
    fontSize: 16,
    fontWeight: '600',
  },
  beneficiaryEmail: {
    fontSize: 13,
    marginTop: 2,
  },
  shareBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  shareText: {
    fontSize: 14,
    fontWeight: '700',
  },

  // Gallery
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  galleryImage: {
    width: (SCREEN_WIDTH - 32 - 40 - 24) / 3,
    height: (SCREEN_WIDTH - 32 - 40 - 24) / 3,
    borderRadius: 12,
    resizeMode: 'cover',
  },
});