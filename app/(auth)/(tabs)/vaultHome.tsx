import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVault } from '@/src/features/auth/hooks/useVault';


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
        refreshing,
        showUpgradeModal,
        showFilePickerSheet,
        showUploadProgress,
        uploadingFile,
        uploadSuccess,
        uploadError,
        previewFile,
        previewImageUrl,
        showPreview,
        deleteFile,
        showDeleteDialog,
        isDeleting,
        setShowUpgradeModal,
        setShowFilePickerSheet,
        setPreviewFile,
        setPreviewImageUrl,
        setShowPreview,
        setDeleteFile,
        setShowDeleteDialog,
        onRefresh,
        handlePickFromGallery,
        handlePickDocument,
        handlePreviewFile,
        handleDownloadFile,
        handleDeleteFile,
        executeDelete,
        handleUploadPress,
        translate, 

    } = useVault();
  if (isLoadingSubscription && !subscription) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4BA3D9" />
        <Text style={styles.loadingText}>{translate("private.vault.loading")}</Text>
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
            <Text style={styles.loadingFilesText}>{translate("private.vault.uploading")}</Text>
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

