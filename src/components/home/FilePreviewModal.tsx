// src/components/home/FilePreviewModal.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatBytes, formatRelativeDate } from '@/src/utils/vaultUtils';
import { GradientBackground } from '@/src/components/common/GradiendBackground';

const { width, height } = Dimensions.get('window');

interface FilePreviewModalProps {
  visible: boolean;
  file: any | null; // VaultFile
  imageUrl: string | null;
  onClose: () => void;
  onDownload: () => void;
  onDelete: () => void;
}

export function FilePreviewModal({
  visible,
  file,
  imageUrl,
  onClose,
  onDownload,
  onDelete,
}: FilePreviewModalProps) {
  const [imageLoading, setImageLoading] = React.useState(true);

  if (!file) return null;

  const isImage = file.file_type === 'image';
  const isPDF = file.file_type === 'pdf';

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      onRequestClose={onClose}
    >
      <GradientBackground>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>

          <View style={styles.headerTitle}>
            <Text style={styles.fileName} numberOfLines={1}>
              {file.file_name}
            </Text>
            <Text style={styles.fileInfo}>
              {formatBytes(file.file_size_bytes)} • {formatRelativeDate(file.created_at)}
            </Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onDownload}
              activeOpacity={0.7}
            >
              <Ionicons name="download-outline" size={24} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={onDelete}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={24} color="#ff4444" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {isImage && imageUrl ? (
            <View style={styles.imageContainer}>
              {imageLoading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="white" />
                  <Text style={styles.loadingText}>Cargando imagen...</Text>
                </View>
              )}
              
              <Image
                source={{ uri: imageUrl }}
                style={styles.image}
                resizeMode="contain"
                onLoadStart={() => setImageLoading(true)}
                onLoadEnd={() => setImageLoading(false)}
                onError={() => setImageLoading(false)}
              />
            </View>
          ) : isPDF ? (
            <View style={styles.pdfContainer}>
              <Ionicons name="document-text" size={80} color="rgba(255,255,255,0.3)" />
              <Text style={styles.pdfTitle}>Documento PDF</Text>
              <Text style={styles.pdfSubtitle}>
                Presiona el botón de descarga para abrir este archivo
              </Text>
            </View>
          ) : (
            <View style={styles.unsupportedContainer}>
              <Ionicons name="document" size={80} color="rgba(255,255,255,0.3)" />
              <Text style={styles.unsupportedTitle}>
                {file.file_type.toUpperCase()}
              </Text>
              <Text style={styles.unsupportedSubtitle}>
                Vista previa no disponible para este tipo de archivo
              </Text>
            </View>
          )}
        </View>

        {/* File details */}
        <View style={styles.details}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Nombre:</Text>
              <Text style={styles.detailValue}>{file.file_name}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tipo:</Text>
              <Text style={styles.detailValue}>{file.mime_type}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tamaño:</Text>
              <Text style={styles.detailValue}>
                {formatBytes(file.file_size_bytes)}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Subido:</Text>
              <Text style={styles.detailValue}>
                {formatRelativeDate(file.created_at)}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>ID:</Text>
              <Text style={[styles.detailValue, styles.idText]} numberOfLines={1}>
                {file.id}
              </Text>
            </View>
          </ScrollView>
        </View>
      </GradientBackground>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    gap: 12,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 2,
  },
  fileInfo: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    backgroundColor: 'rgba(255,68,68,0.15)',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    width: width,
    height: height * 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  pdfContainer: {
    alignItems: 'center',
    padding: 40,
  },
  pdfTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginTop: 16,
    marginBottom: 8,
  },
  pdfSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
  unsupportedContainer: {
    alignItems: 'center',
    padding: 40,
  },
  unsupportedTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginTop: 16,
    marginBottom: 8,
  },
  unsupportedSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
  details: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    paddingHorizontal: 20,
    paddingVertical: 20,
    maxHeight: 200,
    backgroundColor: 'rgba(30, 30, 30, 0.9)', // Fondo semi-transparente
  },
  detailRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  detailLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    width: 80,
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  idText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
});