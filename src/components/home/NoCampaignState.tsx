import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { GradientBackground } from '../common/GradiendBackground';

export function NoCampaignState() {
  const router = useRouter();

  const handleGoToCreateCampaign = () => {
    // Navegar a la pantalla de home donde está el botón de crear campaña
    // Ajusta la ruta según tu estructura de navegación
    router.push('/(auth)/(tabs)/arkHome'); // O la ruta que corresponda
  };

  return (
    <GradientBackground>
      <View style={styles.content}>
        {/* Icono ilustrativo */}
        <View style={styles.iconContainer}>
          <Ionicons name="folder-open-outline" size={80} color="#D1D5DB" />
        </View>

        {/* Título */}
        <Text style={styles.title}>Tu bóveda está esperando</Text>

        {/* Descripción */}
        <Text style={styles.description}>
          Para acceder a tu bóveda digital y almacenar archivos importantes, primero necesitas crear
          una campaña.
        </Text>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <FeatureItem icon="shield-checkmark" text="Almacenamiento seguro en la nube" />
          <FeatureItem icon="lock-closed" text="Acceso privado y encriptado" />
          <FeatureItem icon="people" text="Documentos para tus beneficiarios" />
        </View>

        {/* Botón CTA */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleGoToCreateCampaign}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Ir a crear campaña</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Texto de ayuda */}
        <Text style={styles.helpText}>
          Las campañas te permiten recaudar fondos y crear un legado digital para tus seres queridos
        </Text>
      </View>
    </GradientBackground>
  );
}

/**
 * Item de feature con icono y texto
 */
function FeatureItem({ icon, text }: { icon: any; text: string }) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIconContainer}>
        <Ionicons name={icon} size={20} color="#4BA3D9" />
      </View>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
    lineHeight: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4BA3D9',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  helpText: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },
});
