// src/features/vault/screens/VaultHomeScreen.tsx

import { GradientBackground } from "@/src/components/common/GradiendBackground";
import { EmptyFilesList } from "@/src/components/home/EmptyFileList";
import { FileList } from "@/src/components/home/FileList";
import { NoCampaignState } from "@/src/components/home/NoCampaignState";
import { PlanBadge } from "@/src/components/home/PlanBadge";
import { StorageBar } from "@/src/components/home/StorageBar";
import { useAuthStore } from "@/src/stores/authStore";
import { useVaultStore } from "@/src/stores/vault.store";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import { Alert, View, ActivityIndicator, ScrollView, RefreshControl, TouchableOpacity, Text } from "react-native";

/**
 * Pantalla principal de la Bóveda
 * Maneja 3 estados: sin campaña, FREE, y PRO
 */
export default function VaultHomeScreen() {
  const {
    hasCampaign,
    campaignId,
    subscription,
    files,
    isLoadingFiles,
    isLoadingSubscription,
    error,
    initialize,
    refreshFiles,
    refreshSubscription,
  } = useVaultStore();
  const id = useAuthStore((state) => state.user?.id);
  // TODO: Obtener userId de tu contexto de autenticación
  // Por ahora usamos un placeholder
  const userId = id;

  // Estado de refresh
  const [refreshing, setRefreshing] = React.useState(false);

  /**
   * Inicializar el store al montar la pantalla
   */
  useEffect(() => {
    console.log('📱 VaultHomeScreen montado');
    initialize(userId!);

    // Cleanup al desmontar
    return () => {
      console.log('📱 VaultHomeScreen desmontado');
    };
  }, [userId]);

  /**
   * Pull to refresh
   */
  const onRefresh = async () => {
    setRefreshing(true);
    
    if (hasCampaign && campaignId) {
      await Promise.all([
        refreshFiles(),
        refreshSubscription(),
      ]);
    } else {
      await initialize(userId!);
    }
    
    setRefreshing(false);
  };

  /**
   * Handler para abrir modal de upgrade (se implementará en Fase 6)
   */
  const handleUpgradePress = () => {
    Alert.alert(
      'Actualizar a PRO',
      'El modal de planes se implementará en la Fase 6',
      [{ text: 'OK' }]
    );
  };

  /**
   * Handler para subir archivos (se implementará en Fase 8-9)
   */
  const handleUploadPress = () => {
    Alert.alert(
      'Subir archivo',
      'La funcionalidad de upload se implementará en las Fases 8-9',
      [{ text: 'OK' }]
    );
  };

  /**
   * Loading inicial
   */
  if (isLoadingSubscription && !subscription) {
    return (
      <GradientBackground >
        <ActivityIndicator size="large" color="#4BA3D9" />
        <Text style={styles.loadingText}>Cargando bóveda...</Text>
      </GradientBackground>
    );
  }

  /**
   * Estado: Sin campaña
   */
  if (!hasCampaign || !campaignId) {
    return <NoCampaignState />;
  }

  /**
   * Estados FREE y PRO
   */
  return (
    <GradientBackground >
      {/* Error banner */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Plan Badge */}
        <PlanBadge onUpgradePress={handleUpgradePress} />

        {/* Storage Bar */}
        <StorageBar />

        {/* Lista de archivos o empty state */}
        {isLoadingFiles ? (
          <View style={styles.loadingFiles}>
            <ActivityIndicator size="small" color="#4BA3D9" />
            <Text style={styles.loadingFilesText}>Cargando archivos...</Text>
          </View>
        ) : files.length === 0 ? (
          <EmptyFilesList />
        ) : (
          <FileList files={files} />
        )}
      </ScrollView>

      {/* FAB para subir archivos (sin funcionalidad aún) */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleUploadPress}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100, // Espacio para el FAB
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  loadingFiles: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  loadingFilesText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  errorText: {
    color: '#991B1B',
    fontSize: 14,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4BA3D9',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
});