// src/components/campaign/ImagePickerSection.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '@/constants/theme';
import { ImageUploadService } from '@/src/services/imageUpload.service';
import { LocalImage } from '@/src/types/campaign-create.types';

interface ImagePickerSectionProps {
  title: string;
  images: LocalImage[];
  maxImages?: number;
  onAddImage: (image: LocalImage) => void;
  onRemoveImage: (imageId: string) => void;
  required?: boolean;
}

export const ImagePickerSection: React.FC<ImagePickerSectionProps> = ({
  title,
  images,
  maxImages = 3,
  onAddImage,
  onRemoveImage,
  required = false,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [isLoading, setIsLoading] = useState(false);

  // Solicitar permisos
  const requestPermissions = async (): Promise<boolean> => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permisos necesarios',
          'Necesitamos acceso a tu galería para subir imágenes.',
          [{ text: 'OK' }]
        );
        return false;
      }
    }
    return true;
  };

  // Seleccionar imagen
  const pickImage = async () => {
    try {
      // Verificar permisos
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      // Verificar límite
      if (images.length >= maxImages) {
        Alert.alert('Límite alcanzado', `Solo puedes agregar ${maxImages} imágenes.`);
        return;
      }

      setIsLoading(true);

      // Abrir image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (result.canceled) {
        setIsLoading(false);
        return;
      }

      const asset = result.assets[0];

      // Obtener tamaño del archivo
      const fileSize = await ImageUploadService.getFileSize(asset.uri);

      // Crear objeto LocalImage
      const localImage: LocalImage = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        uri: asset.uri,
        name: asset.fileName || `image_${Date.now()}.jpg`,
        type: asset.mimeType || 'image/jpeg',
        size: fileSize,
        width: asset.width,
        height: asset.height,
      };

      // Validar imagen
      const validation = ImageUploadService.validateImage(localImage);
      if (!validation.valid) {
        Alert.alert('Error', validation.error || 'Imagen inválida');
        setIsLoading(false);
        return;
      }

      // Agregar imagen
      onAddImage(localImage);
      setIsLoading(false);
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'No se pudo cargar la imagen. Intenta nuevamente.');
      setIsLoading(false);
    }
  };

  // Confirmar eliminación
  const handleRemoveImage = (imageId: string) => {
    Alert.alert(
      'Eliminar imagen',
      '¿Estás seguro de eliminar esta imagen?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => onRemoveImage(imageId),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.card,
          {
            backgroundColor:
              colorScheme === 'dark'
                ? 'rgba(30, 42, 54, 0.7)'
                : 'rgba(251, 252, 251, 0.7)',
            borderColor:
              colorScheme === 'dark'
                ? 'rgba(42, 63, 84, 0.5)'
                : 'rgba(172, 202, 231, 0.3)',
          },
        ]}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            {required && (
              <Text style={[styles.required, { color: colors.error }]}> *</Text>
            )}
          </View>
          <Text style={[styles.counter, { color: colors.secondaryText }]}>
            {images.length}/{maxImages}
          </Text>
        </View>

        {/* BOTÓN AGREGAR */}
        {images.length < maxImages && (
          <TouchableOpacity
            style={[
              styles.addButton,
              {
                backgroundColor:
                  colorScheme === 'dark'
                    ? 'rgba(34, 51, 68, 0.5)'
                    : 'rgba(214, 228, 245, 0.3)',
                borderColor:
                  colorScheme === 'dark'
                    ? 'rgba(42, 63, 84, 0.5)'
                    : 'rgba(172, 202, 231, 0.5)',
              },
            ]}
            onPress={pickImage}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <>
                <Ionicons name="image-outline" size={32} color={colors.icon} />
                <Text style={[styles.addButtonText, { color: colors.text }]}>
                  Agregar
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* GRID DE IMÁGENES */}
        {images.length > 0 && (
          <View style={styles.imageGrid}>
            {images.map((image, index) => (
              <View key={image.id} style={styles.imageCard}>
                <Image source={{ uri: image.uri }} style={styles.image} />
                
                {/* Badge de orden */}
                <View
                  style={[
                    styles.orderBadge,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <Text style={[styles.orderText, { color: colors.customWhite }]}>
                    {index + 1}
                  </Text>
                </View>

                {/* Botón eliminar */}
                <TouchableOpacity
                  style={[styles.removeButton, { backgroundColor: colors.error }]}
                  onPress={() => handleRemoveImage(image.id)}
                >
                  <Ionicons name="close" size={16} color={colors.customWhite} />
                </TouchableOpacity>

                {/* Badge de imagen principal */}
                {index === 0 && (
                  <View
                    style={[
                      styles.primaryBadge,
                      { backgroundColor: colors.success },
                    ]}
                  >
                    <Text
                      style={[styles.primaryText, { color: colors.customWhite }]}
                    >
                      Principal
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* HINT TEXT */}
        {images.length === 0 && (
          <Text style={[styles.hintText, { color: colors.secondaryText }]}>
            La primera imagen será la portada de tu campaña
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
  },
  required: {
    fontSize: 15,
    fontWeight: '600',
  },
  counter: {
    fontSize: 14,
    fontWeight: '500',
  },
  addButton: {
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    minHeight: 100,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '500',
    marginTop: 8,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  imageCard: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  orderBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderText: {
    fontSize: 12,
    fontWeight: '700',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 4,
    alignItems: 'center',
  },
  primaryText: {
    fontSize: 10,
    fontWeight: '600',
  },
  hintText: {
    fontSize: 13,
    marginTop: 12,
    textAlign: 'center',
  },
});