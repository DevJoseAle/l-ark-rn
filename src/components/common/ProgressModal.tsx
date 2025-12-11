// src/components/campaign/ProgressModal.tsx
import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useTranslation } from 'react-i18next';

interface ProgressStep {
  labelKey: string;
  progress: number;
  icon: keyof typeof Ionicons.glyphMap;
}

interface ProgressModalProps {
  visible: boolean;
  progress: number;
  currentStep: string;
  error: string | null;
  onRetry?: () => void;
  onCancel?: () => void;
}

export const ProgressModal: React.FC<ProgressModalProps> = ({
  visible,
  progress,
  currentStep,
  error,
  onRetry,
  onCancel,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t: translate } = useTranslation("common");

  const STEPS: ProgressStep[] = [
    { labelKey: 'private.createCampaign.progressStep1', progress: 10, icon: 'person-outline' },
    { labelKey: 'private.createCampaign.progressStep2', progress: 20, icon: 'create-outline' },
    { labelKey: 'private.createCampaign.progressStep3', progress: 30, icon: 'images-outline' },
    { labelKey: 'private.createCampaign.progressStep4', progress: 50, icon: 'save-outline' },
    { labelKey: 'private.createCampaign.progressStep5', progress: 60, icon: 'medical-outline' },
    { labelKey: 'private.createCampaign.progressStep6', progress: 70, icon: 'people-outline' },
    { labelKey: 'private.createCampaign.progressStep7', progress: 100, icon: 'checkmark-circle-outline' },
  ];

  const getCurrentStepIndex = () => {
    return STEPS.findIndex((step) => step.progress >= progress);
  };

  const currentStepIndex = getCurrentStepIndex();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.container,
            {
              backgroundColor:
                colorScheme === 'dark' ? colors.cardBackground : colors.background,
            },
          ]}
        >
          {/* HEADER */}
          {!error ? (
            <View style={styles.header}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
              <Text style={[styles.title, { color: colors.text }]}>
                {translate("private.createCampaign.progressModalTitle")}
              </Text>
              <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
                {translate("private.createCampaign.progressModalSubtitle")}
              </Text>
            </View>
          ) : (
            <View style={styles.header}>
              <View style={[styles.iconContainer, { backgroundColor: colors.error + '20' }]}>
                <Ionicons name="alert-circle" size={48} color={colors.error} />
              </View>
              <Text style={[styles.title, { color: colors.text }]}>
                {translate("private.createCampaign.progressModalErrorTitle")}
              </Text>
              <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
                {error}
              </Text>
            </View>
          )}

          {/* PROGRESS BAR */}
          {!error && (
            <View style={styles.progressSection}>
              <View
                style={[
                  styles.progressBarBackground,
                  { backgroundColor: colors.separator },
                ]}
              >
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${progress}%`,
                      backgroundColor: colors.primary,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.progressText, { color: colors.text }]}>
                {progress}%
              </Text>
            </View>
          )}

          {/* STEPS LIST */}
          <View style={styles.stepsList}>
            {STEPS.map((step, index) => {
              const isCompleted = progress > step.progress;
              const isCurrent = index === currentStepIndex;
              const isPending = progress < step.progress;

              return (
                <View key={step.labelKey} style={styles.stepItem}>
                  {/* Icon */}
                  <View
                    style={[
                      styles.stepIcon,
                      {
                        backgroundColor: isCompleted
                          ? colors.success + '20'
                          : isCurrent
                          ? colors.primary + '20'
                          : colors.separator,
                      },
                    ]}
                  >
                    {isCompleted ? (
                      <Ionicons name="checkmark" size={16} color={colors.success} />
                    ) : (
                      <Ionicons
                        name={step.icon}
                        size={16}
                        color={
                          isCurrent
                            ? colors.primary
                            : isPending
                            ? colors.secondaryText
                            : colors.icon
                        }
                      />
                    )}
                  </View>

                  {/* Label */}
                  <Text
                    style={[
                      styles.stepLabel,
                      {
                        color: isCompleted
                          ? colors.success
                          : isCurrent
                          ? colors.text
                          : colors.secondaryText,
                        fontWeight: isCurrent ? '600' : '400',
                      },
                    ]}
                  >
                    {translate(step.labelKey)}
                  </Text>

                  {/* Loading indicator for current step */}
                  {isCurrent && !error && (
                    <ActivityIndicator size="small" color={colors.primary} />
                  )}
                </View>
              );
            })}
          </View>

          {/* ERROR ACTIONS */}
          {error && (
            <View style={styles.actions}>
              {onCancel && (
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.buttonSecondary,
                    { borderColor: colors.border },
                  ]}
                  onPress={onCancel}
                >
                  <Text style={[styles.buttonText, { color: colors.text }]}>
                    {translate("private.createCampaign.progressModalCancelButton")}
                  </Text>
                </TouchableOpacity>
              )}
              {onRetry && (
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: colors.primary }]}
                  onPress={onRetry}
                >
                  <Text style={[styles.buttonText, { color: colors.customWhite }]}>
                    {translate("private.createCampaign.progressModalRetryButton")}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  progressSection: {
    marginBottom: 24,
  },
  progressBarBackground: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  stepsList: {
    gap: 12,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLabel: {
    flex: 1,
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonSecondary: {
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});