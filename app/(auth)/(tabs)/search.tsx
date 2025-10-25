// app/(auth)/(tabs)/search.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GradientBackground } from '@/src/components/common/GradiendBackground';
import { useThemeColors } from '@/hooks/use-theme-color';
import { ThemeColors } from '@/constants/theme';
import { CampaignSearchResult } from '@/src/types/campaign.types';
import { CampaignService } from '@/src/services/campaign.service';

export default function SearchScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const styles = searchStyles(colors);

  const [searchMode, setSearchMode] = useState<'code' | 'text'>('code');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CampaignSearchResult | null>(null);
  const [results, setResults] = useState<CampaignSearchResult[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [featured, setFeatured] = useState<CampaignSearchResult[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFeatured();
  }, []);

  const loadFeatured = async () => {
    const campaigns = await CampaignService.getFeaturedCampaigns();
    setFeatured(campaigns);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadFeatured();
      if (query.trim()) {
        await handleSearch();
      }
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setNotFound(false);
    setResult(null);
    setResults([]);

    try {
      if (searchMode === 'code') {
        const campaign = await CampaignService.searchByCode(query);
        if (campaign) {
          setResult(campaign);
        } else {
          setNotFound(true);
        }
      } else {
        const campaigns = await CampaignService.searchByText(query);
        if (campaigns.length > 0) {
          setResults(campaigns);
        } else {
          setNotFound(true);
        }
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setResult(null);
    setResults([]);
    setNotFound(false);
  };

  const renderCampaignCard = (campaign: CampaignSearchResult) => {
    const progress = (campaign.total_raised / campaign.goal_amount) * 100;
    const mainImage = campaign.images?.find(img => img.image_type === 'campaign')?.image_url;

    return (
      <TouchableOpacity
        key={campaign.id}
        style={styles.campaignCard}
        onPress={() => router.push(`/(auth)/campaign/${campaign.id}`)}
        activeOpacity={0.7}
      >
        {mainImage && (
          <Image source={{ uri: mainImage }} style={styles.campaignImage} />
        )}

        <View style={styles.campaignContent}>
          <View style={styles.codeTag}>
            <Ionicons name="qr-code-outline" size={12} color={colors.primary} />
            <Text style={styles.codeText}>{campaign.short_code}</Text>
          </View>

          <Text style={styles.campaignTitle} numberOfLines={2}>
            {campaign.title}
          </Text>

          <Text style={styles.campaignDescription} numberOfLines={2}>
            {campaign.description}
          </Text>

          {/* Progress bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${Math.min(progress, 100)}%` }]} />
            </View>
            <Text style={styles.progressText}>{Math.round(progress)}%</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>
                ${campaign.total_raised.toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>recaudado</Text>
            </View>

            <View style={styles.stat}>
              <Text style={styles.statValue}>
                ${campaign.goal_amount.toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>meta</Text>
            </View>

            <View style={styles.stat}>
              <Text style={styles.statValue}>{campaign.country}</Text>
              <Text style={styles.statLabel}>país</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Buscar</Text>
            
            <View style={styles.modeSwitcher}>
              <TouchableOpacity
                style={[styles.modeBtn, searchMode === 'code' && styles.modeBtnActive]}
                onPress={() => {
                  setSearchMode('code');
                  handleClear();
                }}
              >
                <Ionicons 
                  name="qr-code-outline" 
                  size={18} 
                  color={searchMode === 'code' ? colors.customWhite : colors.secondaryText} 
                />
                <Text style={[
                  styles.modeBtnText, 
                  searchMode === 'code' && styles.modeBtnTextActive
                ]}>
                  Por Código
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modeBtn, searchMode === 'text' && styles.modeBtnActive]}
                onPress={() => {
                  setSearchMode('text');
                  handleClear();
                }}
              >
                <Ionicons 
                  name="search-outline" 
                  size={18} 
                  color={searchMode === 'text' ? colors.customWhite : colors.secondaryText} 
                />
                <Text style={[
                  styles.modeBtnText, 
                  searchMode === 'text' && styles.modeBtnTextActive
                ]}>
                  Por Texto
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBox}>
              <Ionicons name="search" size={20} color={colors.icon} />
              
              <TextInput
                style={styles.searchInput}
                value={query}
                onChangeText={setQuery}
                placeholder={
                  searchMode === 'code' 
                    ? 'Ej: abc1234' 
                    : 'Buscar por título...'
                }
                placeholderTextColor={colors.icon}
                autoCapitalize={searchMode === 'code' ? 'none' : 'sentences'}
                autoCorrect={false}
                returnKeyType="search"
                onSubmitEditing={handleSearch}
              />

              {query.length > 0 && (
                <TouchableOpacity onPress={handleClear}>
                  <Ionicons name="close-circle" size={20} color={colors.icon} />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={[styles.searchBtn, !query.trim() && styles.searchBtnDisabled]}
              onPress={handleSearch}
              disabled={!query.trim() || loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={colors.customWhite} />
              ) : (
                <Ionicons name="search" size={20} color={colors.customWhite} />
              )}
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.text}
                colors={[colors.text]}
              />
            }
          >
            {/* Estado inicial - Info + Destacadas */}
            {!loading && !result && !notFound && results.length === 0 && (
              <>
                {searchMode === 'code' && (
                  <View style={styles.infoCard}>
                    <Ionicons name="information-circle-outline" size={24} color={colors.primary} />
                    <Text style={styles.infoText}>
                      Ingresa el código de 7 caracteres de la campaña
                    </Text>
                  </View>
                )}

                {featured.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Campañas Destacadas</Text>
                    {featured.map(renderCampaignCard)}
                  </View>
                )}

                {featured.length === 0 && !loading && (
                  <View style={styles.emptyState}>
                    <Ionicons name="planet-outline" size={80} color={colors.icon} />
                    <Text style={styles.emptyTitle}>Aún no hay campañas</Text>
                    <Text style={styles.emptyText}>
                      Las campañas destacadas aparecerán aquí
                    </Text>
                  </View>
                )}
              </>
            )}

            {/* No encontrado */}
            {notFound && (
              <View style={styles.emptyState}>
                <Ionicons name="sad-outline" size={80} color={colors.error} />
                <Text style={styles.emptyTitle}>No se encontraron resultados</Text>
                <Text style={styles.emptyText}>
                  {searchMode === 'code' 
                    ? 'Verifica que el código sea correcto' 
                    : 'Intenta con otras palabras clave'}
                </Text>
              </View>
            )}

            {/* Resultado único (búsqueda por código) */}
            {result && renderCampaignCard(result)}

            {/* Múltiples resultados (búsqueda por texto) */}
            {results.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  {results.length} resultado{results.length !== 1 ? 's' : ''}
                </Text>
                {results.map(renderCampaignCard)}
              </View>
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const searchStyles = (colors: ThemeColors) => StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  modeSwitcher: {
    flexDirection: 'row',
    gap: 12,
  },
  modeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modeBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  modeBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.secondaryText,
  },
  modeBtnTextActive: {
    color: colors.customWhite,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  searchBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBtnDisabled: {
    backgroundColor: colors.icon,
    opacity: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.cardBackground,
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.primary,
    opacity: 0.9,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  campaignCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: colors.customBlack,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: colors.border,
  },
  campaignImage: {
    width: '100%',
    height: 200,
    backgroundColor: colors.separator,
  },
  campaignContent: {
    padding: 16,
  },
  codeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: `${colors.primary}20`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  codeText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
    fontFamily: 'monospace',
  },
  campaignTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    lineHeight: 26,
  },
  campaignDescription: {
    fontSize: 15,
    color: colors.secondaryText,
    marginBottom: 16,
    lineHeight: 22,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.separator,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    minWidth: 45,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  stat: {
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 16,
    color: colors.secondaryText,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
    lineHeight: 24,
  },
});