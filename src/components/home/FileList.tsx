// src/components/home/FileList.tsx
// 🔄 REEMPLAZA COMPLETAMENTE

import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatBytes, formatRelativeDate } from '@/src/utils/vaultUtils';

interface FileListProps {
  files: any[]; // VaultFile[]
  onFilePress?: (file: any) => void;
  onDownload?: (file: any) => void;
  onDelete?: (file: any) => void;
}

/**
 * Lista de archivos de la bóveda con acciones
 */
export function FileList({ files, onFilePress, onDownload, onDelete }: FileListProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Mis archivos ({files.length})</Text>

      <FlatList
        data={files}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FileCard
            file={item}
            onPress={() => onFilePress?.(item)}
            onDownload={() => onDownload?.(item)}
            onDelete={() => onDelete?.(item)}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

/**
 * Card individual de archivo con acciones
 */
interface FileCardProps {
  file: any;
  onPress?: () => void;
  onDownload?: () => void;
  onDelete?: () => void;
}

function FileCard({ file, onPress, onDownload, onDelete }: FileCardProps) {
  const getIconName = (fileType: string) => {
    switch (fileType) {
      case 'image':
        return 'image';
      case 'pdf':
        return 'document-text';
      case 'video':
        return 'videocam';
      case 'audio':
        return 'musical-notes';
      case 'document':
        return 'document';
      default:
        return 'document-outline';
    }
  };

  const getIconColor = (fileType: string) => {
    switch (fileType) {
      case 'image':
        return '#4BA3D9';
      case 'pdf':
        return '#EF4444';
      case 'video':
        return '#8B5CF6';
      case 'audio':
        return '#F59E0B';
      case 'document':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const iconName = getIconName(file.file_type);
  const iconColor = getIconColor(file.file_type);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {/* Icono del archivo */}
      <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
        <Ionicons name={iconName} size={24} color={iconColor} />
      </View>

      {/* Información del archivo */}
      <View style={styles.infoContainer}>
        <Text style={styles.fileName} numberOfLines={1}>
          {file.file_name}
        </Text>
        <View style={styles.metaContainer}>
          <Text style={styles.metaText}>{formatBytes(file.file_size_bytes)}</Text>
          <Text style={styles.metaDot}>•</Text>
          <Text style={styles.metaText}>{formatRelativeDate(file.created_at)}</Text>
        </View>
      </View>

      {/* Botones de acción */}
      <View style={styles.actions}>
        {onDownload && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={(e) => {
              e.stopPropagation();
              onDownload();
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="download-outline" size={20} color="#6B7280" />
          </TouchableOpacity>
        )}

        {onDelete && (
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
  },
  header: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 8,
  },
  separator: {
    height: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContainer: {
    flex: 1,
  },
  fileName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: '#6B7280',
  },
  metaDot: {
    fontSize: 13,
    color: '#6B7280',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
});
