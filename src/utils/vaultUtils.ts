import { StorageQuota, VaultFileType } from '../types/vault.types';
import {
  STORAGE_WARNING_THRESHOLD,
  ACCEPTED_MIME_TYPES,
  VAULT_LIMITS,
  STORAGE_CRITICAL_THRESHOLD,
} from './vaultConstants';

/**
 * Formatea bytes a formato legible (KB, MB, GB)
 */
export const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Calcula la información de cuota de almacenamiento
 */
export const calculateStorageQuota = (usedBytes: number, totalBytes: number): StorageQuota => {
  const percentage = totalBytes > 0 ? (usedBytes / totalBytes) * 100 : 0;
  const remaining = Math.max(0, totalBytes - usedBytes);

  return {
    used: usedBytes,
    total: totalBytes,
    percentage: Math.min(100, percentage),
    remaining,
    isNearLimit: percentage >= STORAGE_WARNING_THRESHOLD * 100,
    isAtLimit: percentage >= 100,
  };
};

/**
 * Determina el tipo de archivo basado en el MIME type
 */
export const getFileTypeFromMimeType = (mimeType: string): VaultFileType => {
  const lowerMime = mimeType.toLowerCase();

  if (ACCEPTED_MIME_TYPES.images.some((type) => lowerMime.includes(type))) {
    return 'image';
  }
  if (lowerMime.includes('pdf')) {
    return 'pdf';
  }
  if (ACCEPTED_MIME_TYPES.videos.some((type) => lowerMime.includes(type))) {
    return 'video';
  }
  if (ACCEPTED_MIME_TYPES.audio.some((type) => lowerMime.includes(type))) {
    return 'audio';
  }
  if (ACCEPTED_MIME_TYPES.documents.some((type) => lowerMime.includes(type))) {
    return 'document';
  }

  return 'other';
};

/**
 * Valida si un archivo puede ser subido (tamaño y cuota)
 */
export const validateFileUpload = (
  fileSizeBytes: number,
  currentUsedBytes: number,
  quotaBytes: number
): { isValid: boolean; error?: string } => {
  // Validar tamaño máximo por archivo
  if (fileSizeBytes > VAULT_LIMITS.MAX_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      error: `El archivo excede el tamaño máximo de ${VAULT_LIMITS.MAX_FILE_SIZE_MB} MB`,
    };
  }

  // Validar cuota disponible
  const newTotalUsed = currentUsedBytes + fileSizeBytes;
  if (newTotalUsed > quotaBytes) {
    const available = formatBytes(quotaBytes - currentUsedBytes);
    return {
      isValid: false,
      error: `No tienes suficiente espacio. Disponible: ${available}`,
    };
  }

  return { isValid: true };
};

/**
 * Valida si un MIME type es aceptado
 */
export const isAcceptedMimeType = (mimeType: string): boolean => {
  const allAcceptedTypes = [
    ...ACCEPTED_MIME_TYPES.images,
    ...ACCEPTED_MIME_TYPES.documents,
    ...ACCEPTED_MIME_TYPES.videos,
    ...ACCEPTED_MIME_TYPES.audio,
  ];

  return allAcceptedTypes.some((type) => mimeType.toLowerCase().includes(type.toLowerCase()));
};

/**
 * Formatea fecha relativa (hace 2 horas, hace 3 días, etc)
 */
export const formatRelativeDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Hace un momento';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays < 7) return `Hace ${diffDays}d`;

  // Si es más de una semana, mostrar fecha exacta
  return date.toLocaleDateString('es-CL', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
};

/**
 * Formatea fecha para suscripción (ej: "Vence el 15 de mayo")
 */
export const formatSubscriptionDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-CL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

/**
 * Genera un path único para almacenar en Supabase Storage
 */
export const generateStoragePath = (
  userId: string,
  campaignId: string,
  fileName: string
): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');

  return `${userId}/${campaignId}/${timestamp}_${random}_${cleanFileName}`;
};

/**
 * Extrae la extensión de un archivo
 */
export const getFileExtension = (fileName: string): string => {
  const parts = fileName.split('.');
  return parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
};

/**
 * Obtiene un nombre corto para mostrar en UI (trunca si es muy largo)
 */
export const truncateFileName = (fileName: string, maxLength: number = 30): string => {
  if (fileName.length <= maxLength) return fileName;

  const extension = getFileExtension(fileName);
  const nameWithoutExt = fileName.slice(0, fileName.lastIndexOf('.'));
  const truncatedName = nameWithoutExt.slice(0, maxLength - extension.length - 4);

  return `${truncatedName}...${extension}`;
};

/**
 * Calcula el color de la barra de progreso según el porcentaje
 */
export const getStorageBarColor = (percentage: number): string => {
  if (percentage < 50) return '#10B981'; // green
  if (percentage < STORAGE_WARNING_THRESHOLD * 100) return '#F59E0B'; // amber
  if (percentage < STORAGE_CRITICAL_THRESHOLD * 100) return '#EF4444'; // red
  return '#DC2626'; // dark red
};

/**
 * Obtiene el mensaje apropiado según el estado de almacenamiento
 */
export const getStorageMessage = (quota: StorageQuota): string | null => {
  if (quota.isAtLimit) {
    return 'Has alcanzado el límite de almacenamiento';
  }
  if (quota.isNearLimit) {
    return `Te quedan ${formatBytes(quota.remaining)} de espacio`;
  }
  return null;
};
