import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { GradientBackground } from '@/src/components/common/GradiendBackground';
import { EmptyFilesList } from '@/src/components/home/EmptyFileList';
import { FilePickerSheet } from '@/src/components/home/FilePickerSheet';
import { NoCampaignState } from '@/src/components/home/NoCampaignState';
import { PlanBadge } from '@/src/components/home/PlanBadge';
import { StorageBar } from '@/src/components/home/StorageBar';
import { UpgradeModal } from '@/src/components/home/UpgradeModal';
import { UploadProgressModal } from '@/src/components/home/UploadProgressModal';
import { useFilePicker } from '@/src/features/home/useFilePicker';
import { useVaultStore, useStorageStatus } from '@/src/stores/vault.store';
import { FileToUpload } from '@/src/types/vault.types';
import { FileList } from '@/src/components/home/FileList';
import { useAuthStore } from '@/src/stores/authStore';

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
    isUploading,
    error,
    initialize,
    refreshFiles,
    refreshSubscription,
    uploadFile,
  } = useVaultStore();

  const id = useAuthStore((state) => state.user?.id);
  // TODO: Obtener userId de tu contexto de autenticación
  // Por ahora usamos un placeholder
  const userId = id; // REEMPLAZAR con: const { user } = useAuth();// REEMPLAZAR con: const { user } = useAuth();

  // Estado de refresh
  const [refreshing, setRefreshing] = React.useState(false);

  // Estado del modal de upgrade
  const [showUpgradeModal, setShowUpgradeModal] = React.useState(false);

  // Estado del sheet de file picker
  const [showFilePickerSheet, setShowFilePickerSheet] = React.useState(false);

  // Estados del modal de progreso de upload
  const [showUploadProgress, setShowUploadProgress] = React.useState(false);
  const [uploadingFile, setUploadingFile] = React.useState<FileToUpload | null>(null);
  const [uploadSuccess, setUploadSuccess] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);

  // Hook para selección de archivos
  const { pickFromGallery, pickDocument } = useFilePicker();

  // Storage status para validaciones
  const { canUpload, isAtLimit } = useStorageStatus();

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
   * Handler para abrir modal de upgrade
   */
  const handleUpgradePress = () => {
    setShowUpgradeModal(true);
  };

  /**
   * Handler para subir archivos
   * Abre el sheet si hay espacio disponible
   */
  const handleUploadPress = () => {
    // Validar que no esté al límite
    if (isAtLimit) {
      Alert.alert(
        'Sin espacio disponible',
        'Has alcanzado el límite de almacenamiento. Actualiza a PRO para obtener más espacio.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Ver planes', onPress: () => setShowUpgradeModal(true) },
        ]
      );
      return;
    }

    // Abrir sheet de selección
    setShowFilePickerSheet(true);
  };

  /**
   * Cierra el modal de progreso después de mostrar el resultado
   */
  React.useEffect(() => {
    if (uploadSuccess || uploadError) {
      const timer = setTimeout(() => {
        setShowUploadProgress(false);
        setUploadingFile(null);
        setUploadSuccess(false);
        setUploadError(null);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [uploadSuccess, uploadError]);

  /**
   * Handler para procesar el upload de un archivo
   */
  const handleUploadFile = async (file: FileToUpload) => {
    // Preparar modal de progreso
    setUploadingFile(file);
    setUploadSuccess(false);
    setUploadError(null);
    setShowUploadProgress(true);

    // Ejecutar upload
    const result = await uploadFile(file);

    // Mostrar resultado
    if (result.success) {
      console.log('✅ Upload exitoso');
      setUploadSuccess(true);
    } else {
      console.error('❌ Upload fallido:', result.error);
      setUploadError(result.error || 'Error al subir el archivo');
    }
  };
  const handlePickFromGallery = async () => {
    const file = await pickFromGallery();

    if (file) {
      // ✅ Cerrar el sheet
      setShowFilePickerSheet(false);

      // ✅ Llamar al upload real (NO más Alert placeholder)
      await handleUploadFile(file);
    }
  };


  /**
   * Handler para seleccionar documento
   */
  const handlePickDocument = async () => {
    const file = await pickDocument();

    if (file) {
      // ✅ Cerrar el sheet
      setShowFilePickerSheet(false);

      // ✅ Llamar al upload real (NO más Alert placeholder)
      await handleUploadFile(file);
    }
  };

  /**
   * Loading inicial
   */
  if (isLoadingSubscription && !subscription) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4BA3D9" />
        <Text style={styles.loadingText}>Cargando bóveda...</Text>
      </View>
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
    <GradientBackground>
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

      {/* Modal de upgrade */}
      <UpgradeModal
        visible={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />

      {/* Sheet de file picker */}
      <FilePickerSheet
        visible={showFilePickerSheet}
        onClose={() => setShowFilePickerSheet(false)}
        onPickGallery={handlePickFromGallery}
        onPickDocument={handlePickDocument}
      />

      {/* Modal de progreso de upload */}
      {uploadingFile && (
        <UploadProgressModal
          visible={showUploadProgress}
          fileName={uploadingFile.name}
          fileSize={uploadingFile.size}
          isUploading={isUploading}
          isSuccess={uploadSuccess}
          isError={!!uploadError}
          errorMessage={uploadError || undefined}
        />
      )}
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
    paddingBottom: 120, // Espacio para el FAB y el tabbar flotante
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
    bottom: 100, // Ajustado para estar por encima del tabbar flotante
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

