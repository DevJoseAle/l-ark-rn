// src/components/certificate/CertificateGeneratorModal.tsx

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Alert,
  Platform,
} from 'react-native';
import { CertificateTemplate } from './CertificateTemplate';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { CertificateStyle, CertificateTone, CertificateService } from '@/src/services/certificate.service';
import { CampaignDetail } from '@/src/types/campaign.types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CertificateGeneratorModalProps {
  visible: boolean;
  campaign: CampaignDetail;
  onClose: () => void;
}

export const CertificateGeneratorModal: React.FC<CertificateGeneratorModalProps> = ({
  visible,
  campaign,
  onClose,
}) => {
  const [selectedStyle, setSelectedStyle] = useState<CertificateStyle>('elegant');
  const [selectedTone, setSelectedTone] = useState<CertificateTone>('direct');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUri, setGeneratedUri] = useState<string | null>(null);
  
  const certificateRef = useRef<View>(null);
  const platform = Platform.OS
  const styles_data = [
    {
      id: 'elegant' as CertificateStyle,
      name: 'Elegante',
      description: 'Serio y profesional',
      icon: '👔',
      preview: '#1E3A5F',
    },
    {
      id: 'modern' as CertificateStyle,
      name: 'Moderno',
      description: 'Vibrante y tech',
      icon: '⚡',
      preview: '#6366F1',
    },
    {
      id: 'warm' as CertificateStyle,
      name: 'Cálido',
      description: 'Acogedor y familiar',
      icon: '🧡',
      preview: '#F97316',
    },
  ];

  const tones = [
    {
      id: 'inspirational' as CertificateTone,
      name: 'Inspiracional',
      example: 'Escribiendo su legado...',
    },
    {
      id: 'direct' as CertificateTone,
      name: 'Directo',
      example: 'Plan de herencia creado',
    },
    {
      id: 'emotional' as CertificateTone,
      name: 'Emocional',
      example: 'Eligió el amor...',
    },
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      // Esperar un frame para que el componente se renderice
      await new Promise(resolve => setTimeout(resolve, 100));

      // Capturar el componente como imagen
      const uri = await captureRef(certificateRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });

      setGeneratedUri(uri);
    } catch (error) {
      console.error('Error generating certificate:', error);
      Alert.alert('Error', 'No se pudo generar el certificado');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    if (!generatedUri) return;

    try {
      await CertificateService.share(generatedUri, campaign.short_code);
    } catch (error) {
      Alert.alert('Error', 'No se pudo compartir el certificado');
    }
  };

  const handleSave = async () => {
    if (!generatedUri) return;

    try {
      await CertificateService.saveToGallery(generatedUri);
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el certificado');
    }
  };

  const handleReset = () => {
    setGeneratedUri(null);
  };

  return (
    <Modal
    style={{paddingTop: 10}}
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header,{paddingTop: platform === 'android' ? 36 : 16}]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {generatedUri ? 'Tu Certificado' : 'Crear Certificado'}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {!generatedUri ? (
            <>
              {/* Selector de estilo */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Elige el estilo</Text>
                <View style={styles.styleGrid}>
                  {styles_data.map((style) => (
                    <TouchableOpacity
                      key={style.id}
                      style={[
                        styles.styleCard,
                        selectedStyle === style.id && styles.styleCardSelected,
                      ]}
                      onPress={() => setSelectedStyle(style.id)}
                    >
                      <Text style={styles.styleIcon}>{style.icon}</Text>
                      <Text style={styles.styleName}>{style.name}</Text>
                      <Text style={styles.styleDescription}>{style.description}</Text>
                      <View
                        style={[
                          styles.stylePreview,
                          { backgroundColor: style.preview },
                        ]}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Selector de tono */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Tono del mensaje</Text>
                {tones.map((tone) => (
                  <TouchableOpacity
                    key={tone.id}
                    style={[
                      styles.toneOption,
                      selectedTone === tone.id && styles.toneOptionSelected,
                    ]}
                    onPress={() => setSelectedTone(tone.id)}
                  >
                    <View style={styles.toneRadio}>
                      {selectedTone === tone.id && (
                        <View style={styles.toneRadioInner} />
                      )}
                    </View>
                    <View style={styles.toneContent}>
                      <Text style={styles.toneName}>{tone.name}</Text>
                      <Text style={styles.toneExample}>{tone.example}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Preview del certificado (oculto pero renderizado para captura) */}
              <View style={styles.previewSection}>
                <Text style={styles.sectionTitle}>Vista previa</Text>
                <View style={styles.previewContainer}>
                  <View
                    ref={certificateRef}
                    collapsable={false}
                  >
                    <CertificateTemplate
                      ownerName={campaign.owner.display_name}
                      beneficiariesCount={campaign.beneficiaries.length}
                      goalAmount={campaign.goal_amount || 0}
                      currency={campaign.currency}
                      shortCode={campaign.short_code}
                      createdDate={new Date(campaign.created_at).toLocaleDateString('es', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                      style={selectedStyle}
                      tone={selectedTone}
                      includeQR={true}
                    />
                  </View>
                </View>
              </View>

              {/* Botón de generar */}
              <TouchableOpacity
                style={[
                  styles.generateButton,
                  isGenerating && styles.generateButtonDisabled,
                ]}
                onPress={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.generateButtonText}>
                    Generar Certificado ✨
                  </Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Certificado generado */}
              <View style={styles.generatedSection}>
                <View style={styles.generatedContainer}>
                  <View
                    ref={certificateRef}
                    collapsable={false}
                  >
                    <CertificateTemplate
                      ownerName={campaign.owner.display_name}
                      beneficiariesCount={campaign.beneficiaries.length}
                      goalAmount={campaign.goal_amount || 0}
                      currency={campaign.currency}
                      shortCode={campaign.short_code}
                      createdDate={new Date(campaign.created_at).toLocaleDateString('es', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                      style={selectedStyle}
                      tone={selectedTone}
                      includeQR={true}
                    />
                  </View>
                </View>
              </View>

              {/* Acciones */}
              <View style={styles.actionsSection}>
                <TouchableOpacity
                  style={styles.primaryAction}
                  onPress={handleShare}
                >
                  <Text style={styles.primaryActionText}>📱 Compartir</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryAction}
                  onPress={handleSave}
                >
                  <Text style={styles.secondaryActionText}>💾 Guardar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.tertiaryAction}
                  onPress={handleReset}
                >
                  <Text style={styles.tertiaryActionText}>🔄 Regenerar</Text>
                </TouchableOpacity>
              </View>

              {/* Compartir en redes */}
              <View style={styles.socialSection}>
                <Text style={styles.socialTitle}>Compartir en:</Text>
                <View style={styles.socialGrid}>
                  {[
                    { platform: 'instagram', icon: '📷', name: 'Instagram' },
                    { platform: 'facebook', icon: '📘', name: 'Facebook' },
                    { platform: 'twitter', icon: '🐦', name: 'Twitter' },
                    { platform: 'whatsapp', icon: '💬', name: 'WhatsApp' },
                  ].map((social) => (
                    <TouchableOpacity
                      key={social.platform}
                      style={styles.socialButton}
                      onPress={() =>
                        CertificateService.shareToSocial(
                          generatedUri,
                          social.platform as any,
                          campaign.short_code
                        )
                      }
                    >
                      <Text style={styles.socialIcon}>{social.icon}</Text>
                      <Text style={styles.socialName}>{social.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 26,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#007AFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  styleGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  styleCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  styleCardSelected: {
    borderColor: '#007AFF',
  },
  styleIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  styleName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  styleDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
  },
  stylePreview: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  toneOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  toneOptionSelected: {
    borderColor: '#007AFF',
  },
  toneRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  toneRadioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007AFF',
  },
  toneContent: {
    flex: 1,
  },
  toneName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  toneExample: {
    fontSize: 13,
    color: '#666',
  },
  previewSection: {
    padding: 20,
  },
  previewContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  generateButton: {
    backgroundColor: '#007AFF',
    marginHorizontal: 20,
    marginBottom: 40,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },
  generateButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  generatedSection: {
    padding: 20,
    alignItems: 'center',
  },
  generatedContainer: {
    marginBottom: 30,
  },
  actionsSection: {
    padding: 20,
    gap: 12,
  },
  primaryAction: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryActionText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryAction: {
    backgroundColor: '#FFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  secondaryActionText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  tertiaryAction: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  tertiaryActionText: {
    color: '#007AFF',
    fontSize: 16,
  },
  socialSection: {
    padding: 20,
  },
  socialTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  socialGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  socialIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  socialName: {
    fontSize: 14,
    fontWeight: '500',
  },
});