// src/components/certificate/CertificateTemplate.tsx

import { CertificateStyle, CertificateTone, CertificateService } from '@/src/services/certificate.service';
import React from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Rect,
  Circle,
  Path,
  G,
} from 'react-native-svg';


const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CERT_WIDTH = SCREEN_WIDTH - 40;
const CERT_HEIGHT = CERT_WIDTH * 2; // Ratio 1:1.4

interface CertificateTemplateProps {
  ownerName: string;
  beneficiariesCount: number;
  goalAmount: number;
  currency: string;
  shortCode: string;
  createdDate: string;
  style: CertificateStyle;
  tone: CertificateTone;
  includeQR?: boolean;
}

export const CertificateTemplate: React.FC<CertificateTemplateProps> = ({
  ownerName,
  beneficiariesCount,
  goalAmount,
  currency,
  shortCode,
  createdDate,
  style,
  tone,
  includeQR = true,
}) => {
  const colors = CertificateService.getStyleConfig(style);
  const message = CertificateService.getMessage(
    tone,
    ownerName,
    beneficiariesCount,
    goalAmount,
    currency
  );

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
  }).format(goalAmount);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Background decorativo según estilo */}
      {style === 'elegant' && <ElegantBackground colors={colors} />}
      {style === 'modern' && <ModernBackground colors={colors} />}
      {style === 'warm' && <WarmBackground colors={colors} />}

      {/* Contenido */}
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={[styles.logo, { color: colors.primary }]}>L-ark</Text>
        </View>

        {/* Título */}
        <Text style={[styles.title, { color: colors.primary }]}>
          CERTIFICADO DE{'\n'}LEGADO DIGITAL
        </Text>

        {/* Decorador */}
        <View style={styles.divider}>
          <View style={[styles.dividerLine, { backgroundColor: colors.secondary }]} />
          <View style={[styles.dividerDot, { backgroundColor: colors.secondary }]} />
          <View style={[styles.dividerLine, { backgroundColor: colors.secondary }]} />
        </View>

        {/* Nombre del owner */}
        <Text style={[styles.ownerName, { color: colors.text }]}>
          {ownerName}
        </Text>

        {/* Mensaje personalizado */}
        <Text style={[styles.message, { color: colors.text }]}>
          {message}
        </Text>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={[styles.statIcon, { color: colors.accent }]}>👥</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {beneficiariesCount}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text }]}>
              {beneficiariesCount === 1 ? 'Beneficiario' : 'Beneficiarios'}
            </Text>
          </View>

          <View style={[styles.statDivider, { backgroundColor: colors.accent }]} />

          <View style={styles.statItem}>
            <Text style={[styles.statIcon, { color: colors.accent }]}>💰</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {formattedAmount}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text }]}>
              Objetivo
            </Text>
          </View>
        </View>

        {/* Metadata */}
        <View style={styles.metadata}>
          <Text style={[styles.metaItem, { color: colors.text }]}>
            📅 {createdDate}
          </Text>
          <Text style={[styles.metaItem, { color: colors.text }]}>
            🔗 #{shortCode}
          </Text>
        </View>

        {/* Frase inspiracional */}
        <Text style={[styles.quote, { color: colors.accent }]}>
          "Un legado bien planeado es amor eterno"
        </Text>

        {/* QR Code */}
        {includeQR && (
          <View style={styles.qrContainer}>
            <Image
              source={{
                uri: CertificateService.getQRCodeUrl(shortCode, 180),
              }}
              style={styles.qrCode}
            />
            <Text style={[styles.qrLabel, { color: colors.text }]}>
              Escanea para crear el tuyo
            </Text>
          </View>
        )}

        {/* Footer */}
        <Text style={[styles.footer, { color: colors.accent }]}>
          lark.app
        </Text>
      </View>
    </View>
  );
};

// ========================================
// BACKGROUNDS DECORATIVOS
// ========================================

const ElegantBackground: React.FC<{ colors: any }> = ({ colors }) => (
  <Svg
    width={CERT_WIDTH}
    height={CERT_HEIGHT}
    style={StyleSheet.absoluteFill}
  >
    <Defs>
      <LinearGradient id="elegantGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor={colors.gradient[0]} stopOpacity="0.05" />
        <Stop offset="100%" stopColor={colors.gradient[1]} stopOpacity="0.1" />
      </LinearGradient>
    </Defs>
    
    {/* Frame decorativo */}
    <Rect
      x="20"
      y="20"
      width={CERT_WIDTH - 40}
      height={CERT_HEIGHT - 40}
      stroke={colors.secondary}
      strokeWidth="2"
      fill="none"
      opacity="0.3"
    />
    <Rect
      x="30"
      y="30"
      width={CERT_WIDTH - 60}
      height={CERT_HEIGHT - 60}
      stroke={colors.secondary}
      strokeWidth="1"
      fill="none"
      opacity="0.2"
    />

    {/* Ornamentos en esquinas */}
    {[
      { x: 40, y: 40 },
      { x: CERT_WIDTH - 60, y: 40 },
      { x: 40, y: CERT_HEIGHT - 60 },
      { x: CERT_WIDTH - 60, y: CERT_HEIGHT - 60 },
    ].map((pos, i) => (
      <Circle
        key={i}
        cx={pos.x}
        cy={pos.y}
        r="4"
        fill={colors.secondary}
        opacity="0.4"
      />
    ))}
  </Svg>
);

const ModernBackground: React.FC<{ colors: any }> = ({ colors }) => (
  <Svg
    width={CERT_WIDTH}
    height={CERT_HEIGHT}
    style={StyleSheet.absoluteFill}
  >
    <Defs>
      <LinearGradient id="modernGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor={colors.gradient[0]} stopOpacity="0.8" />
        <Stop offset="100%" stopColor={colors.gradient[1]} stopOpacity="0.6" />
      </LinearGradient>
    </Defs>
    
    {/* Gradiente de fondo */}
    <Rect
      width={CERT_WIDTH}
      height={CERT_HEIGHT}
      fill="url(#modernGradient)"
    />

    {/* Formas geométricas abstractas */}
    <Circle
      cx={CERT_WIDTH * 0.2}
      cy={CERT_HEIGHT * 0.15}
      r="100"
      fill={colors.accent}
      opacity="0.1"
    />
    <Circle
      cx={CERT_WIDTH * 0.8}
      cy={CERT_HEIGHT * 0.85}
      r="120"
      fill={colors.secondary}
      opacity="0.1"
    />

    {/* Líneas diagonales */}
    <Path
      d={`M 0 ${CERT_HEIGHT * 0.3} L ${CERT_WIDTH} ${CERT_HEIGHT * 0.35}`}
      stroke={colors.accent}
      strokeWidth="1"
      opacity="0.2"
    />
    <Path
      d={`M 0 ${CERT_HEIGHT * 0.7} L ${CERT_WIDTH} ${CERT_HEIGHT * 0.65}`}
      stroke={colors.secondary}
      strokeWidth="1"
      opacity="0.2"
    />
  </Svg>
);

const WarmBackground: React.FC<{ colors: any }> = ({ colors }) => (
  <Svg
    width={CERT_WIDTH}
    height={CERT_HEIGHT}
    style={StyleSheet.absoluteFill}
  >
    <Defs>
      <LinearGradient id="warmGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor={colors.gradient[0]} stopOpacity="0.05" />
        <Stop offset="100%" stopColor={colors.gradient[1]} stopOpacity="0.1" />
      </LinearGradient>
    </Defs>
    
    <Rect
      width={CERT_WIDTH}
      height={CERT_HEIGHT}
      fill="url(#warmGradient)"
    />

    {/* Círculos orgánicos */}
    {[
      { cx: CERT_WIDTH * 0.15, cy: CERT_HEIGHT * 0.2, r: 80 },
      { cx: CERT_WIDTH * 0.85, cy: CERT_HEIGHT * 0.4, r: 60 },
      { cx: CERT_WIDTH * 0.3, cy: CERT_HEIGHT * 0.8, r: 70 },
    ].map((circle, i) => (
      <Circle
        key={i}
        {...circle}
        fill={colors.accent}
        opacity="0.08"
      />
    ))}
  </Svg>
);

// ========================================
// STYLES
// ========================================

const styles = StyleSheet.create({
  container: {
    width: CERT_WIDTH,
    height: CERT_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  content: {
    flex: 1,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoContainer: {
    marginTop: 20,
  },
  logo: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 1,
    marginTop: 10,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    width: 60,
    height: 1,
  },
  dividerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 10,
  },
  ownerName: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
  },
  message: {
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    opacity: 0.7,
  },
  statDivider: {
    width: 1,
    height: 60,
    opacity: 0.3,
  },
  metadata: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  metaItem: {
    fontSize: 13,
    marginHorizontal: 12,
    opacity: 0.7,
  },
  quote: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 30,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  qrCode: {
    width: 140,
    height: 140,
    marginBottom: 12,
  },
  qrLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  footer: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  },
});