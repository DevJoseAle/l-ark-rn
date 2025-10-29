// src/components/auth/TermsModal.tsx

import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/use-theme-color';
import { ThemeColors } from '@/constants/theme';

interface TermsModalProps {
  visible: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export default function TermsModal({ visible, onAccept, onDecline }: TermsModalProps) {
  const colors = useThemeColors();
  const styles = termsModalStyles(colors);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
    if (isBottom) {
      setHasScrolledToBottom(true);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDecline}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.modal}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Términos y Condiciones</Text>
              <TouchableOpacity onPress={onDecline} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={colors.icon} />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView 
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              showsVerticalScrollIndicator={true}
            >
              <Text style={styles.lastUpdated}>
                Última actualización: 24 de Octubre, 2025
              </Text>

              <Text style={styles.sectionTitle}>1. Aceptación de Términos</Text>
              <Text style={styles.paragraph}>
                Al crear una cuenta en L-ark, aceptas estos Términos y Condiciones. 
                Si no estás de acuerdo, no podrás usar la plataforma.
              </Text>

              <Text style={styles.sectionTitle}>2. Descripción del Servicio</Text>
              <Text style={styles.paragraph}>
                L-ark es una plataforma de herencia digital que permite crear campañas 
                de recaudación de fondos que se activan automáticamente cuando se detecta 
                la causal (fallecimiento o inactividad prolongada).
              </Text>

              <Text style={styles.sectionTitle}>3. Responsabilidades del Usuario</Text>
              <Text style={styles.paragraph}>
                • Proporcionar información veraz y actualizada{'\n'}
                • Mantener la confidencialidad de tu cuenta{'\n'}
                • No usar la plataforma para actividades ilegales{'\n'}
                • Cumplir con las leyes aplicables en tu jurisdicción
              </Text>

              <Text style={styles.sectionTitle}>4. Donaciones y Pagos</Text>
              <Text style={styles.paragraph}>
                • Las donaciones se procesan a través de Stripe{'\n'}
                • L-ark cobra una comisión del 8% sobre cada donación{'\n'}
                • El 92% restante se distribuye entre los beneficiarios{'\n'}
                • Las donaciones no son reembolsables salvo error comprobable
              </Text>

              <Text style={styles.sectionTitle}>5. KYC y Verificación</Text>
              <Text style={styles.paragraph}>
                Los beneficiarios deben completar un proceso de Know Your Customer (KYC) 
                para recibir fondos. Esto incluye verificación de identidad y datos bancarios.
              </Text>

              <Text style={styles.sectionTitle}>6. Distribución de Fondos</Text>
              <Text style={styles.paragraph}>
                Los fondos se distribuyen automáticamente cuando:{'\n'}
                • Se activa la causal de la campaña{'\n'}
                • Los beneficiarios han completado su verificación{'\n'}
                • La campaña cumple con todos los requisitos legales
              </Text>

              <Text style={styles.sectionTitle}>7. Privacidad de Datos</Text>
              <Text style={styles.paragraph}>
                Consulta nuestra Política de Privacidad para información sobre cómo 
                recopilamos, usamos y protegemos tus datos personales.
              </Text>

              <Text style={styles.sectionTitle}>8. Limitación de Responsabilidad</Text>
              <Text style={styles.paragraph}>
                L-ark no se hace responsable por:{'\n'}
                • Pérdidas derivadas de información incorrecta proporcionada por usuarios{'\n'}
                • Fallos en servicios de terceros (Stripe, proveedores de pago){'\n'}
                • Acceso no autorizado a cuentas por negligencia del usuario
              </Text>

              <Text style={styles.sectionTitle}>9. Modificaciones</Text>
              <Text style={styles.paragraph}>
                Nos reservamos el derecho de modificar estos términos. Te notificaremos 
                por email de cambios significativos.
              </Text>

              <Text style={styles.sectionTitle}>10. Ley Aplicable</Text>
              <Text style={styles.paragraph}>
                Estos términos se rigen por las leyes de [TU JURISDICCIÓN]. 
                Cualquier disputa se resolverá en los tribunales de [TU CIUDAD].
              </Text>

              <Text style={styles.footer}>
                Al hacer clic en "Aceptar y Continuar", confirmas que has leído y 
                aceptas estos Términos y Condiciones.
              </Text>
            </ScrollView>

            {/* Actions */}
            <View style={styles.actions}>
              {!hasScrolledToBottom && (
                <View style={styles.scrollHint}>
                  <Ionicons name="arrow-down" size={16} color={colors.primary} />
                  <Text style={styles.scrollHintText}>
                    Desplázate para leer todo
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.acceptBtn,
                  !hasScrolledToBottom && styles.acceptBtnDisabled
                ]}
                onPress={onAccept}
                disabled={!hasScrolledToBottom}
                activeOpacity={0.8}
              >
                <Text style={styles.acceptBtnText}>Aceptar y Continuar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.declineBtn}
                onPress={onDecline}
                activeOpacity={0.8}
              >
                <Text style={styles.declineBtnText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const termsModalStyles = (colors: ThemeColors) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
  },
  safeArea: {
    flex: 1,
  },
  modal: {
    flex: 1,
    backgroundColor: colors.background,
    marginTop: 50,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.separator,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  lastUpdated: {
    fontSize: 12,
    color: colors.secondaryText,
    marginBottom: 24,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: 20,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 24,
    marginBottom: 16,
  },
  footer: {
    fontSize: 14,
    color: colors.secondaryText,
    lineHeight: 22,
    marginTop: 24,
    fontStyle: 'italic',
  },
  actions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  scrollHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  scrollHintText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  acceptBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  acceptBtnDisabled: {
    backgroundColor: colors.icon,
    opacity: 0.5,
  },
  acceptBtnText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.customWhite,
  },
  declineBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  declineBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.secondaryText,
  },
});