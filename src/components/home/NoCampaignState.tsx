import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { GradientBackground } from "../common/GradiendBackground";
import ButtonXL from "../common/ButtonXL";
import { useThemeColors } from "@/hooks/use-theme-color";
import { useTranslation } from "react-i18next";

export function NoCampaignState() {
  const router = useRouter();
  const colors = useThemeColors()
  const {t:translate} = useTranslation("common")
  const handleGoToCreateCampaign = () => {
    router.push('/(auth)/(tabs)/arkHome'); 
  };

  return (
    <GradientBackground>
      <View style={styles.content}>
        {/* Icono ilustrativo */}
        <View style={styles.iconContainer}>
          <Ionicons name="folder-open-outline" size={80} color="#D1D5DB" />
        </View>

        {/* Título */}
        <Text style={[styles.title,{color: colors.text}]}>
          {translate("private.vault.noCampaignStateTitle")}
        </Text>

        {/* Descripción */}
        <Text style={[styles.description,{color: colors.text}]}>
          {translate("private.vault.noCampaignStateMessage")}
        </Text>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <FeatureItem
            icon="shield-checkmark"
            text={translate("private.vault.featButton1")}
            color={colors.text}

          />
          <FeatureItem
            icon="lock-closed"
           text={translate("private.vault.featButton2")}
            color={colors.text}
          />
          <FeatureItem
            icon="people"
            text={translate("private.vault.featButton3")}
            color={colors.text}
          />
        </View>

        {/* Botón CTA */}
       <ButtonXL
       title={translate("private.vault.createCampaignButton")}
       action={handleGoToCreateCampaign}
       mode='default' />

        {/* Texto de ayuda */}
        <Text style={styles.helpText}>
          {translate("private.vault.noCampaignStateText")}
        </Text>
      </View>
    </GradientBackground>
  );
}

/**
 * Item de feature con icono y texto
 */
function FeatureItem({ icon, text, color }: { icon: any; text: string, color:string }) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIconContainer}>
        <Ionicons name={icon} size={20} color="#4BA3D9" />
      </View>
      <Text style={[styles.featureText, {color: color}]}>{text}</Text>
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