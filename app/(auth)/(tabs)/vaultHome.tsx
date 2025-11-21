import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { GradientBackground } from '@/src/components/common/GradiendBackground';
import { DeleteConfirmDialog } from '@/src/components/home/DeleteConfirmDialog';
import { EmptyFilesList } from '@/src/components/home/EmptyFileList';
import { FileList } from '@/src/components/home/FileList';
import { FilePickerSheet } from '@/src/components/home/FilePickerSheet';
import { FilePreviewModal } from '@/src/components/home/FilePreviewModal';
import { NoCampaignState } from '@/src/components/home/NoCampaignState';
import { PlanBadge } from '@/src/components/home/PlanBadge';
import { StorageBar } from '@/src/components/home/StorageBar';
import { UpgradeModal } from '@/src/components/home/UpgradeModal';
import { UploadProgressModal } from '@/src/components/home/UploadProgressModal';

import { useFilePicker } from '@/src/features/home/useFilePicker';
import { VaultService } from '@/src/services/vault.service';
import { useAuthStore } from '@/src/stores/authStore';
import { useStorageStatus, useVaultStore } from '@/src/stores/vault.store';
import { FileToUpload } from '@/src/types/vault.types';
import { SafeAreaView } from 'react-native-safe-area-context';

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
    deleteFile: deleteFileFromStore,
  } = useVaultStore();

  const id = useAuthStore((state) => state.user?.id);
  const userId = id;

  // Estados de refresh
  const [refreshing, setRefreshing] = React.useState(false);

  // Estados del modal de upgrade
  const [showUpgradeModal, setShowUpgradeModal] = React.useState(false);

  // Estados del sheet de file picker
  const [showFilePickerSheet, setShowFilePickerSheet] = React.useState(false);

  // Estados del modal de progreso de upload
  const [showUploadProgress, setShowUploadProgress] = React.useState(false);
  const [uploadingFile, setUploadingFile] = React.useState<FileToUpload | null>(null);
  const [uploadSuccess, setUploadSuccess] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);

  // Estados de preview
  const [previewFile, setPreviewFile] = React.useState<any | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = React.useState<string | null>(null);
  const [showPreview, setShowPreview] = React.useState(false);

  // Estados de delete
  const [deleteFile, setDeleteFile] = React.useState<any | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Hook para selección de archivos
  const { pickFromGallery, pickDocument } = useFilePicker();

  // Storage status para validaciones
  const { canUpload, isAtLimit } = useStorageStatus();

  /**
   * Inicializar el store al montar la pantalla
   */
  useEffect(() => {
if (userId) {
      initialize(userId);
    }

    return () => {
};
  }, [userId]);

  /**
   * Pull to refresh
   */
  const onRefresh = async () => {
    setRefreshing(true);

    if (hasCampaign && campaignId) {
      await Promise.all([refreshFiles(), refreshSubscription()]);
    } else if (userId) {
      await initialize(userId);
    }

    setRefreshing(false);
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
    setUploadingFile(file);
    setUploadSuccess(false);
    setUploadError(null);
    setShowUploadProgress(true);

    const result = await uploadFile(file);

    if (result.success) {
setUploadSuccess(true);
    } else {
      console.error('❌ Upload fallido:', result.error);
      setUploadError(result.error || 'Error al subir el archivo');
    }
  };

  /**
   * Handler para seleccionar desde galería
   */
  const handlePickFromGallery = async () => {
    const file = await pickFromGallery();

    if (file) {
      setShowFilePickerSheet(false);
      await handleUploadFile(file);
    }
  };

  /**
   * Handler para seleccionar documento
   */
  const handlePickDocument = async () => {
    const file = await pickDocument();

    if (file) {
      setShowFilePickerSheet(false);
      await handleUploadFile(file);
    }
  };

  /**
   * Handler para abrir preview de un archivo
   */
  const handlePreviewFile = async (file: any) => {
// Si es imagen, obtener URL
    if (file.file_type === 'image') {
      const url = await VaultService.getFilePreviewUrl(file.storage_path);
      setPreviewImageUrl(url);
    }

    setPreviewFile(file);
    setShowPreview(true);
  };

  /**
   * Handler para descargar un archivo
   */
  const handleDownloadFile = async (file: any) => {
const result = await VaultService.downloadFile(file);

    if (result.success && result.localUri) {
      Alert.alert(
        'Descarga completa',
        `El archivo se guardó exitosamente`,
        [
          {
            text: 'Compartir',
            onPress: () => handleShareFile(result.localUri!),
          },
          { text: 'OK' },
        ]
      );
    } else {
      Alert.alert(
        'Error al descargar',
        result.error || 'No se pudo descargar el archivo',
        [{ text: 'OK' }]
      );
    }
  };

  /**
   * Handler para compartir un archivo descargado
   */
  const handleShareFile = async (uri: string) => {
    try {
      await Share.share({
        url: uri,
        message: 'Archivo de mi bóveda',
      });
    } catch (error) {
      console.error('Error compartiendo:', error);
    }
  };

  /**
   * Handler para confirmar eliminación
   */
  const handleDeleteFile = (file: any) => {
    setDeleteFile(file);
    setShowDeleteDialog(true);
  };

  /**
   * Ejecuta la eliminación
   */
  const executeDelete = async () => {
    if (!deleteFile) return;

    setIsDeleting(true);

    const success = await deleteFileFromStore(deleteFile.id, deleteFile.storage_path);

    setIsDeleting(false);
    setShowDeleteDialog(false);
    setDeleteFile(null);

    if (success) {
      Alert.alert(
        'Archivo eliminado',
        'El archivo se eliminó correctamente de tu bóveda.',
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        'Error',
        'No se pudo eliminar el archivo. Intenta nuevamente.',
        [{ text: 'OK' }]
      );
    }
  };

  /**
   * Handler para subir archivos
   */
  const handleUploadPress = () => {
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

    setShowFilePickerSheet(true);
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
   * Estados FREE y PRO con funcionalidades completas
   */
  return (
    <GradientBackground>
      {/* Error banner */}
      <SafeAreaView style={{ flex: 1 }}>

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
        <PlanBadge onUpgradePress={() => setShowUpgradeModal(true)} />

        {/* Storage Bar */}
        <StorageBar />

        {/* Lista de archivos con acciones */}
        {isLoadingFiles ? (
          <View style={styles.loadingFiles}>
            <ActivityIndicator size="small" color="#4BA3D9" />
            <Text style={styles.loadingFilesText}>Cargando archivos...</Text>
          </View>
        ) : files.length === 0 ? (
          <EmptyFilesList />
        ) : (
          <FileList
            files={files}
            onFilePress={handlePreviewFile}
            onDownload={handleDownloadFile}
            onDelete={handleDeleteFile}
          />
        )}
      </ScrollView>

      {/* FAB para subir archivos */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleUploadPress}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Modals */}
      <UpgradeModal
        visible={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />

      <FilePickerSheet
        visible={showFilePickerSheet}
        onClose={() => setShowFilePickerSheet(false)}
        onPickGallery={handlePickFromGallery}
        onPickDocument={handlePickDocument}
      />

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

      <FilePreviewModal
        visible={showPreview}
        file={previewFile}
        imageUrl={previewImageUrl}
        onClose={() => {
          setShowPreview(false);
          setPreviewFile(null);
          setPreviewImageUrl(null);
        }}
        onDownload={() => previewFile && handleDownloadFile(previewFile)}
        onDelete={() => {
          if (previewFile) {
            setShowPreview(false);
            handleDeleteFile(previewFile);
          }
        }}
      />

      <DeleteConfirmDialog
        visible={showDeleteDialog}
        file={deleteFile}
        isDeleting={isDeleting}
        onConfirm={executeDelete}
        onCancel={() => {
          setShowDeleteDialog(false);
          setDeleteFile(null);
        }}
      />
       </SafeAreaView>
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
    paddingBottom: 120,
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
    bottom: 140,
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

