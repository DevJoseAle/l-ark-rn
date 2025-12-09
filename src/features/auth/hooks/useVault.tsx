import VaultService from "@/src/services/vault.service";
import { useAuthStore } from "@/src/stores/authStore";
import { useVaultStore, useStorageStatus } from "@/src/stores/vault.store";
import { FileToUpload } from "@/src/types/vault.types";
import React, { useEffect } from "react";
import { Alert, Share } from "react-native";
import { useFilePicker } from "../../home/useFilePicker";
import { useTranslation } from "react-i18next";


export const useVault = () => {
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
    const { t: translate} = useTranslation("common")
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
        console.log('📱 VaultHomeScreen montado');
        if (userId) {
            initialize(userId);
        }

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
            await Promise.all([refreshFiles(), refreshSubscription()]);
        } else if (userId) {
            await initialize(userId);
        }

        setRefreshing(false);
    };

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
            setShowFilePickerSheet(false);
            await handleUploadFile(file);
        }
    };


    const handlePickDocument = async () => {
        const file = await pickDocument();

        if (file) {
            setShowFilePickerSheet(false);
            await handleUploadFile(file);
        }
    };

    const handlePreviewFile = async (file: any) => {
        console.log('👁️ Abriendo preview:', file.file_name);

        // Si es imagen, obtener URL
        if (file.file_type === 'image') {
            const url = await VaultService.getFilePreviewUrl(file.storage_path);
            setPreviewImageUrl(url);
        }

        setPreviewFile(file);
        setShowPreview(true);
    };

    const handleDownloadFile = async (file: any) => {
        console.log('⬇️ Descargando:', file.file_name);

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

    const handleDeleteFile = (file: any) => {
        setDeleteFile(file);
        setShowDeleteDialog(true);
    };

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


    return {
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
        deleteFileFromStore,
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
        pickFromGallery,
        canUpload,
        setRefreshing,
        setShowUpgradeModal,
        setShowFilePickerSheet,
        setShowUploadProgress,
        setUploadingFile,
        setUploadSuccess,
        setUploadError,
        setPreviewFile,
        setPreviewImageUrl,
        setShowPreview,
        setDeleteFile,
        setShowDeleteDialog,
        setIsDeleting,
        pickDocument,
        isAtLimit,
        onRefresh,
        handleUploadFile,
        handlePickFromGallery,
        handlePickDocument,
        handlePreviewFile,
        handleDownloadFile,
        handleShareFile,
        handleDeleteFile,
        executeDelete,
        handleUploadPress,
        translate,
    }
}