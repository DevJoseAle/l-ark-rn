import { useCreateCampaignStore } from "@/src/stores/createCampaign.store";
import { getPayoutMode, COUNTRIES } from "@/src/types/campaign-create.types";
import { View, ScrollView, Text, StyleSheet } from "react-native";
import { CountryButton } from "./BeneficiariesSection";

export const CountrySelector: React.FC = () => {
  const country = useCreateCampaignStore((state) => state.formData.country);
  const setCountry = useCreateCampaignStore((state) => state.setCountry);
  const errors = useCreateCampaignStore((state) => state.errors);

  const countryError = errors.find((e) => e.field === 'country');
  const payoutMode = country ? getPayoutMode(country) : null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>País de la campaña *</Text>
      <Text style={styles.subtitle}>
        Todos los beneficiarios deben estar en el mismo país
      </Text>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.countriesScroll}
      >
        {COUNTRIES.map((c) => (
          <View key={c.code} style={styles.countryItem}>
            <CountryButton
              country={`${c.flag} ${c.name}`}
              isSelected={country === c.code}
              fn={() => setCountry(c.code)}
            />
          </View>
        ))}
      </ScrollView>

      {/* Badge de modo de pago */}
      {country && payoutMode && (
        <View style={styles.payoutBadge}>
          {payoutMode === 'connect' ? (
            <View style={styles.badge}>
              <Text style={styles.badgeIcon}>✓</Text>
              <Text style={styles.badgeText}>
                Pago automático vía Stripe Connect
              </Text>
            </View>
          ) : (
            <View style={[styles.badge, styles.badgeWarning]}>
              <Text style={styles.badgeIcon}>⚠️</Text>
              <Text style={styles.badgeTextWarning}>
                Pago manual requerido (transferencia bancaria)
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Error */}
      {countryError && (
        <Text style={styles.error}>{countryError.message}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 12,
  },
  countriesScroll: {
    marginVertical: 8,
  },
  countryItem: {
    marginRight: 12,
  },
  payoutBadge: {
    marginTop: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  badgeWarning: {
    backgroundColor: '#FFF3E0',
  },
  badgeIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 13,
    color: '#2E7D32',
    fontWeight: '500',
  },
  badgeTextWarning: {
    fontSize: 13,
    color: '#E65100',
    fontWeight: '500',
  },
  error: {
    fontSize: 13,
    color: '#FF3B30',
    marginTop: 8,
  },
});