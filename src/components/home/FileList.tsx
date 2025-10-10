// src/features/vault/components/FileList.tsx

import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { VaultFile } from '@/src/types/vault.types';
import { FILE_TYPE_ICONS, FILE_TYPE_COLORS } from '@/src/utils/vaultConstants';
import { truncateFileName, formatBytes, formatRelativeDate } from '@/src/utils/vaultUtils';


interface FileListProps {
  files: VaultFile[];
}

/**
 * Lista de archivos de la bóveda
 * (Acciones de gestión se agregarán en Fase 11)
 */
export function FileList({ files }: FileListProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        Mis archivos ({files.length})
      </Text>

      <FlatList
        data={files}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <FileCard file={item} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

/**
 * Card individual de archivo
 */
function FileCard({ file }: { file: VaultFile }) {
  const iconName = FILE_TYPE_ICONS[file.file_type] || FILE_TYPE_ICONS.other;
  const iconColor = FILE_TYPE_COLORS[file.file_type] || FILE_TYPE_COLORS.other;

  return (
    <View style={styles.card}>
      {/* Icono del archivo */}
      <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
        <Ionicons name={iconName} size={24} color={iconColor} />
      </View>

      {/* Información del archivo */}
      <View style={styles.infoContainer}>
        <Text style={styles.fileName} numberOfLines={1}>
          {truncateFileName(file.file_name, 35)}
        </Text>
        <View style={styles.metaContainer}>
          <Text style={styles.metaText}>
            {formatBytes(file.file_size_bytes)}
          </Text>
          <Text style={styles.metaDot}>•</Text>
          <Text style={styles.metaText}>
            {formatRelativeDate(file.created_at)}
          </Text>
        </View>
      </View>

      {/* Indicador de más opciones (por ahora solo visual) */}
      <View style={styles.moreButton}>
        <Ionicons name="ellipsis-vertical" size={20} color="#9CA3AF" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
  },
  header: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100, // Espacio para el FAB
  },
  separator: {
    height: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
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
  },
  metaText: {
    fontSize: 13,
    color: '#6B7280',
  },
  metaDot: {
    fontSize: 13,
    color: '#9CA3AF',
    marginHorizontal: 6,
  },
  moreButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});