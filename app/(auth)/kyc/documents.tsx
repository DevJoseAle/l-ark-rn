import React, { useState, useRef, useEffect, use } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '@/constants/theme';
import { KYCService } from '@/src/services/kyc.service';
import { KYCDocumentType, KYCDocument } from '@/src/types/kyc.types';
import { useHomeData } from '@/src/features/home/useHomeData';
import { useAuthStore } from '@/src/stores/authStore';

const STEPS_CONFIG = {
  id_front: {
    title: 'Documento Frontal',
    instruction: 'Coloca tu cédula en el marco y asegúrate de que se vea clara',
    icon: 'card-outline' as const,
  },
  id_back: {
    title: 'Documento Reverso',
    instruction: 'Ahora fotografía el reverso de tu cédula',
    icon: 'card-outline' as const,
  },
  selfie: {
    title: 'Selfie',
    instruction: 'Toma una foto de tu rostro. Asegúrate de tener buena iluminación',
    icon: 'person-circle-outline' as const,
  },
};

export default function KYCCaptureScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const cameraRef = useRef<CameraView>(null);
  const { loadData } = useHomeData();
  const initialize = useAuthStore((state) => state.initialize);
  const [permission, requestPermission] = useCameraPermissions();
  const [currentStep, setCurrentStep] = useState<KYCDocumentType>('id_front');
  const [documents, setDocuments] = useState<Partial<Record<KYCDocumentType, KYCDocument>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState({ step: '', progress: 0 });

  useEffect(() => {
    requestPermission();
  }, []);

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });

      if (!photo) return;

      const document: KYCDocument = {
        id: `${currentStep}_${Date.now()}`,
        uri: photo.uri,
        type: currentStep,
        name: `${currentStep}_${Date.now()}.jpg`,
        size: 0,
      };

      setDocuments((prev) => ({ ...prev, [currentStep]: document }));

      // Move to next step
      if (currentStep === 'id_front') {
        setCurrentStep('id_back');
      } else if (currentStep === 'id_back') {
        setCurrentStep('selfie');
      } else {
        // All photos captured, submit
        handleSubmit({ ...documents, [currentStep]: document });
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'No se pudo tomar la foto');
    }
  };

  const pickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      const document: KYCDocument = {
        id: `${currentStep}_${Date.now()}`,
        uri: asset.uri,
        type: currentStep,
        name: `${currentStep}_${Date.now()}.jpg`,
        size: 0,
      };

      setDocuments((prev) => ({ ...prev, [currentStep]: document }));

      // Move to next step
      if (currentStep === 'id_front') {
        setCurrentStep('id_back');
      } else if (currentStep === 'id_back') {
        setCurrentStep('selfie');
      } else {
        // All photos captured, submit
        handleSubmit({ ...documents, [currentStep]: document });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const handleSubmit = async (allDocuments: Partial<Record<KYCDocumentType, KYCDocument>>) => {
    if (!allDocuments.id_front || !allDocuments.id_back || !allDocuments.selfie) {
      Alert.alert('Error', 'Faltan documentos por capturar');
      return;
    }

    try {
      setIsSubmitting(true);

      await KYCService.submitKYCVerification(
        {
          id_front: allDocuments.id_front,
          id_back: allDocuments.id_back,
          selfie: allDocuments.selfie,
        },
        (step, progress) => {
          setSubmitProgress({ step, progress });
        }
      );

      Alert.alert(
        '¡Verificación enviada!',
        'Tu solicitud está en revisión. Te notificaremos cuando esté aprobada.',
        [
          {
            text: 'Entendido',
            onPress: () => router.replace('/(auth)/(tabs)/arkHome'),
          },
        ]
      );
      loadData();
      initialize();
    } catch (error: any) {
      console.error('Error submitting KYC:', error);
      Alert.alert('Error', error?.message || 'No se pudo enviar la verificación');
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    if (currentStep === 'id_front') {
      router.back();
    } else if (currentStep === 'id_back') {
      setCurrentStep('id_front');
    } else {
      setCurrentStep('id_back');
    }
  };

  if (!permission) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centerContainer}>
        <Text style={[styles.permissionText, { color: colors.text }]}>
          Necesitamos permiso para acceder a la cámara
        </Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={requestPermission}
        >
          <Text style={[styles.buttonText, { color: colors.customWhite }]}>Otorgar permiso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isSubmitting) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.submitText, { color: colors.text }]}>{submitProgress.step}</Text>
        <Text style={[styles.submitProgress, { color: colors.secondaryText }]}>
          {submitProgress.progress}%
        </Text>
      </View>
    );
  }

  const stepConfig = STEPS_CONFIG[currentStep];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Camera */}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={currentStep === 'selfie' ? 'front' : 'back'}
      />

      {/* Overlay - ABSOLUTE POSITIONING */}
      <View style={styles.overlay}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.iconButton} onPress={goBack}>
            <Ionicons name="arrow-back" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.stepIndicator}>
            <View style={[styles.stepDot, currentStep === 'id_front' && styles.stepDotActive]} />
            <View style={[styles.stepDot, currentStep === 'id_back' && styles.stepDotActive]} />
            <View style={[styles.stepDot, currentStep === 'selfie' && styles.stepDotActive]} />
          </View>

          <View style={{ width: 48 }} />
        </View>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Ionicons name={stepConfig.icon} size={48} color="#FFFFFF" />
          <Text style={styles.instructionTitle}>{stepConfig.title}</Text>
          <Text style={styles.instructionText}>{stepConfig.instruction}</Text>
        </View>

        {/* Frame */}
        <View style={styles.frameContainer}>
          <View style={[styles.frame, currentStep === 'selfie' && styles.frameCircle]} />
        </View>

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          <TouchableOpacity style={styles.galleryButton} onPress={pickFromGallery}>
            <Ionicons name="images-outline" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>

          <View style={{ width: 60 }} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
  },
  submitProgress: {
    fontSize: 16,
    marginTop: 8,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIndicator: {
    flexDirection: 'row',
    gap: 8,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  stepDotActive: {
    backgroundColor: '#FFFFFF',
    width: 24,
  },
  instructionsContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
    marginTop: 20,
  },
  instructionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 15,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
  },
  frameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  frame: {
    width: '100%',
    aspectRatio: 1.6,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    borderRadius: 20,
  },
  frameCircle: {
    width: 280,
    height: 280,
    aspectRatio: 1,
    borderRadius: 140,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  galleryButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#4BA3D9',
  },
});
