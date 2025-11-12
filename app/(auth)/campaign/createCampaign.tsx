// app/(auth)/(tabs)/createCampaign.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '@/constants/theme';
import { GradientBackground } from '@/src/components/common/GradiendBackground';
import { BasicInfoSection } from '@/src/components/home/BasicInfoSection';
import { useCreateCampaignStore } from '@/src/stores/createCampaign.store';
import { ImagePickerSection } from '@/src/components/home/ImagePickerSection';
import { AmountsSection } from '@/src/components/common/AmountSection';
import { DatesSection } from '@/src/components/common/DatesSection';
import { Formatters } from '@/src/utils/formatters';
import { ConfigurationSection } from '@/src/components/common/ConfigurationSection';
import { BeneficiariesSection } from '@/src/components/home/BeneficiariesSection';
import { ProgressModal } from '@/src/components/common/ProgressModal';

export default function CreateCampaignScreen() {
 const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const {
    formData,
    addCampaignImage,
    removeCampaignImage,
    addDiagnosisImage,
    removeDiagnosisImage,
    validateForm,
    submitCampaign,
    isSubmitting,
    progress,
    currentStep,
    reset,
  } = useCreateCampaignStore();

  const [submitError, setSubmitError] = useState<string | null>(null);

const handleCancel = () => {
  if (formData.title || formData.description || formData.campaignImages.length > 0) {
    Alert.alert(
      '¿Cancelar creación?',
      'Perderás todos los cambios realizados.',
      [
        { text: 'Continuar editando', style: 'cancel' },
        {
          text: 'Cancelar',
          style: 'destructive',
          onPress: () => {
            reset(); // 👈 Debe estar aquí
            router.back();
          },
        },
      ]
    );
  } else {
    reset(); // 👈 Y aquí también
    router.back();
  }
};

  const handleSubmit = async () => {
      console.log('🔍 Beneficiarios en store:', 
    formData.beneficiaries.map(b => ({
      name: b.user.display_name,
      shareType: b.shareType, // 👈 Debe ser 'percent' o 'fixed_amount'
    }))
  );
    // Validar formulario
    const isValid = validateForm();
    if (!isValid) {
      Alert.alert(
        'Formulario incompleto',
        'Por favor completa todos los campos requeridos antes de continuar.'
      );
      return;
    }

    // Confirmar envío
    Alert.alert(
      'Crear campaña',
      '¿Estás seguro de crear esta campaña? Una vez creada, no podrás editarla.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Crear',
          onPress: async () => {
            try {
              setSubmitError(null);
              await submitCampaign();
              
              // Success - navegar a home o a la campaña
              Alert.alert(
                '¡Campaña creada!',
                'Tu campaña ha sido creada exitosamente.',
                [
                  {
                    text: 'Ver campaña',
                    onPress: () => {
                      reset();
                      router.replace('/(auth)/(tabs)/arkHome');
                    },
                  },
                ]
              );
            } catch (error: any) {
              console.error('Error creating campaign:', error);
              setSubmitError(
                error?.message || 'Ocurrió un error al crear la campaña. Intenta nuevamente.'
              );
            }
          },
        },
      ]
    );
  };

  const handleRetry = () => {
    setSubmitError(null);
    handleSubmit();
  };

  const handleCancelSubmit = () => {
    setSubmitError(null);
  };
  return (
    <GradientBackground>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* HEADER FIJO */}
        <View style={[styles.header, { borderBottomColor: colors.separator }]}>
          <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
            <Text style={[styles.cancelText, { color: colors.primary }]}>
              Cancelar
            </Text>
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Crear Campaña
          </Text>

          <View style={styles.headerSpacer} />
        </View>

        {/* CONTENIDO SCROLLABLE */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ETAPA 1: Info Básica */}
          <BasicInfoSection />

          {/* ETAPA 2: Imágenes de Campaña */}
          <View style={styles.section}>
            <ImagePickerSection
              title="Imágenes de la Campaña (máx. 3)"
              images={formData.campaignImages}
              maxImages={3}
              onAddImage={addCampaignImage}
              onRemoveImage={removeCampaignImage}
              required
            />
          </View>

          {/* ETAPA 2: Imágenes de Diagnóstico */}
          {formData.hasDiagnosis && (
            <View style={styles.section}>
              <ImagePickerSection
                title="Imágenes del Diagnóstico (máx. 3)"
                images={formData.diagnosisImages}
                maxImages={3}
                onAddImage={addDiagnosisImage}
                onRemoveImage={removeDiagnosisImage}
                required
              />
            </View>
          )}

   
          {/* ETAPA 3: Fechas */}
          <View style={styles.section}>
            <DatesSection />
          </View>
          {/* ETAPA 4: Configuración */}
          <View style={styles.section}>
            <ConfigurationSection />
          </View>
          {/* ETAPA 5: Beneficiarios */}
          <View style={styles.section}>
            <BeneficiariesSection />
          </View>

                 {/* ETAPA 3: Montos */}
          <View style={styles.section}>
            <AmountsSection />
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
        {/* BOTÓN DE SUBMIT FIJO */}
        <View
          style={[
            styles.submitContainer,
            {
              backgroundColor:
                colorScheme === 'dark'
                  ? colors.cardBackground + 'F0'
                  : colors.background + 'F0',
              borderTopColor: colors.separator,
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.submitButton,
              {
                backgroundColor: colors.primary,
                opacity: isSubmitting ? 0.6 : 1,
              },
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={[styles.submitButtonText, { color: colors.customWhite }]}>
              Crear Campaña
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
        {/* PROGRESS MODAL */}
      <ProgressModal
        visible={isSubmitting || submitError !== null}
        progress={progress}
        currentStep={currentStep}
        error={submitError}
        onRetry={handleRetry}
        onCancel={handleCancelSubmit}
      />
      {/* {__DEV__ && (
  <TouchableOpacity 
    onPress={() => {
      reset();
      Alert.alert('Reset', 'Formulario reseteado');
    }}
    style={styles.cancelButton}
  >
    <Text style={[styles.cancelText, { color: colors.error }]}>
      Reset
    </Text>
  </TouchableOpacity>
)} */}
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  cancelButton: {
    padding: 4,
    minWidth: 80,
  },
  cancelText: {
    fontSize: 17,
    fontWeight: '400',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  headerSpacer: {
    minWidth: 80,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 24,
    paddingBottom: 32,
  },
  section: {
    marginTop: 16,
  },
  submitContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    borderTopWidth: 1,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: '700',
  },
});