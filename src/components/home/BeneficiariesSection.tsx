// src/components/home/BeneficiariesSection.tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    useColorScheme,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useDebounce } from '@/src/features/home/useDebounce';
import { supabase } from '@/src/lib/supabaseClient';
import { UserSearchService } from '@/src/services/searchUsers.service';
import { useCreateCampaignStore } from '@/src/stores/createCampaign.store';
import {
    BeneficiaryShareType,
    BeneficiaryUser,
    CampaignBeneficiary,
    COUNTRIES,
    CountryCode,
    getPayoutMode // 👈 Importar helper
} from '@/src/types/campaign-create.types';
import { BeneficiaryCard } from './BeneficiaryCard';
import { useTranslation } from 'react-i18next';



export const BeneficiariesSection = () => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const { t: translate } = useTranslation("common");

    const { formData, addBeneficiary, errors, setCountry, resetAmounts } = useCreateCampaignStore();

    // Estados de búsqueda
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<BeneficiaryUser[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string>('');

    const debouncedSearch = useDebounce(searchQuery, 300);
    const selectedCountry = formData.country;
    const payoutMode = selectedCountry ? getPayoutMode(selectedCountry) : null;

    const handleChangeCountry = (code: CountryCode) => {
        setCountry(code);
        resetAmounts();
    }

    useEffect(() => {
        const fetchCurrentUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setCurrentUserId(user.id);
            }
        };
        fetchCurrentUser();
    }, []);

    // Buscar usuarios
    useEffect(() => {
        const searchUsers = async () => {
            if (debouncedSearch.trim().length < 2) {
                setSearchResults([]);
                return;
            }

            setIsSearching(true);
            try {
                const results = await UserSearchService.searchUsers(
                    debouncedSearch,
                    currentUserId
                );
                setSearchResults(results);
            } catch (error) {
                console.error('Error searching users:', error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        };

        searchUsers();
    }, [debouncedSearch, currentUserId]);

    // Handler para agregar beneficiario
    const handleAddBeneficiary = (user: BeneficiaryUser) => {
        const isAlreadyAdded = formData.beneficiaries.some(
            (b) => b.user.id === user.id
        );

        if (isAlreadyAdded) {
            Alert.alert(
                translate("alert.createCampaign.beneficiaryAlreadyAddedTitle"),
                translate("alert.createCampaign.beneficiaryAlreadyAddedMessage")
            );
            return;
        }

        // Calcular porcentaje automático
        const currentCount = formData.beneficiaries.length;
        const newShareValue = currentCount === 0
            ? 100
            : Math.floor(100 / (currentCount + 1));

        const newBeneficiary: CampaignBeneficiary = {
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            user: user,
            shareType: 'percent' as BeneficiaryShareType,
            shareValue: newShareValue,
            documents: [],
        };

        addBeneficiary(newBeneficiary);
        setSearchQuery('');
        setSearchResults([]);
    };

    const totalPercentage = formData.beneficiaries.reduce(
        (sum, b) => sum + b.shareValue,
        0
    );

    const beneficiariesError = errors.find((e) => e.field === 'beneficiaries');
    const countryError = errors.find((e) => e.field === 'country');

    return (
        <View style={styles.container}>
            <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.separator }]}>
                {/* HEADER */}
                <View style={styles.header}>
                    <View style={styles.titleContainer}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            {translate("private.createCampaign.beneficiariesSectionTitle")}
                        </Text>
                        <Text style={[styles.required, { color: colors.error }]}> *</Text>
                    </View>

                    {formData.beneficiaries.length > 0 && (
                        <View
                            style={[
                                styles.percentageBadge,
                                {
                                    backgroundColor:
                                        totalPercentage === 100
                                            ? colors.success + '20'
                                            : colors.warning + '20',
                                },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.percentageText,
                                    { color: totalPercentage === 100 ? colors.success : colors.warning },
                                ]}
                            >
                                {totalPercentage}%
                            </Text>
                        </View>
                    )}
                </View>

                {/* SELECTOR DE PAÍS */}
                <View style={styles.countrySection}>
                    <Text style={[styles.countryTitle, { color: colors.text }]}>
                        {translate("private.createCampaign.countryTitle")}
                    </Text>
                    <Text style={[styles.countrySubtitle, { color: colors.secondaryText }]}>
                        {translate("private.createCampaign.countrySubtitle")}
                    </Text>

                    <View style={styles.countriesRow}>
                        {COUNTRIES.map((cty) => (
                            <CountryButton
                                fn={() => handleChangeCountry(cty.code)}
                                key={cty.code}
                                country={`${cty.flag} ${cty.code}`}
                                isSelected={selectedCountry === cty.code}
                            />
                        ))}
                    </View>

                    {/* Badge de modo de pago */}
                    {selectedCountry && payoutMode && (
                        <View style={styles.payoutInfo}>
                            {payoutMode === 'connect' ? (
                                <View style={[styles.payoutBadge, { backgroundColor: colors.success + '20' }]}>
                                    <Text style={styles.badgeIcon}>✓</Text>
                                    <Text style={[styles.badgeText, { color: colors.success }]}>
                                        {translate("private.createCampaign.payoutAutomatic")}
                                    </Text>
                                </View>
                            ) : (
                                <View style={[styles.payoutBadge, { backgroundColor: colors.warning + '20' }]}>
                                    <Text style={styles.badgeIcon}>⚠️</Text>
                                    <Text style={[styles.badgeText, { color: colors.warning }]}>
                                        {translate("private.createCampaign.payoutManual")}
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}

                    {/* Error de país */}
                    {countryError && (
                        <Text style={[styles.errorText, { color: colors.error }]}>
                            {countryError.message}
                        </Text>
                    )}
                </View>

                {/* SEARCH BAR */}
                <View
                    style={[
                        styles.searchBar,
                        {
                            backgroundColor:
                                colorScheme === 'dark'
                                    ? 'rgba(10, 21, 33, 0.5)'
                                    : 'rgba(10, 21, 33, 0.8)',
                        },
                    ]}
                >
                    <Ionicons name="search" size={20} color="rgba(255, 255, 255, 0.6)" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder={translate("private.createCampaign.searchPlaceholder")}
                        placeholderTextColor="rgba(255, 255, 255, 0.5)"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    {isSearching && <ActivityIndicator size="small" color="rgba(255, 255, 255, 0.8)" />}
                    {searchQuery.length > 0 && !isSearching && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color="rgba(255, 255, 255, 0.6)" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* SEARCH RESULTS */}
                {searchResults.length > 0 && (
                    <View style={styles.searchResults}>
                        {searchResults.map((user) => (
                            <TouchableOpacity
                                key={user.id}
                                style={[
                                    styles.resultCard,
                                    {
                                        backgroundColor:
                                            colorScheme === 'dark'
                                                ? 'rgba(10, 21, 33, 0.5)'
                                                : 'rgba(10, 21, 33, 0.8)',
                                    },
                                ]}
                                onPress={() => handleAddBeneficiary(user)}
                            >
                                <View
                                    style={[
                                        styles.avatar,
                                        { backgroundColor: colors.primary },
                                    ]}
                                >
                                    <Text style={[styles.avatarText, { color: colors.customWhite }]}>
                                        {user.display_name.substring(0, 2).toUpperCase()}
                                    </Text>
                                </View>

                                <View style={styles.resultInfo}>
                                    <View style={styles.nameContainer}>
                                        <Text style={styles.resultName}>{user.display_name}</Text>
                                        {user.kyc_status === 'kyc_verified' && (
                                            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                                        )}
                                    </View>
                                    <Text style={styles.resultEmail}>{user.email}</Text>
                                </View>

                                <View style={[styles.addButton, { backgroundColor: colors.primary }]}>
                                    <Ionicons name="add" size={20} color={colors.customWhite} />
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* NO RESULTS */}
                {debouncedSearch.length >= 2 && searchResults.length === 0 && !isSearching && (
                    <View style={styles.noResults}>
                        <Ionicons name="search-outline" size={32} color={colors.secondaryText} />
                        <Text style={[styles.noResultsText, { color: colors.secondaryText }]}>
                            {translate("private.createCampaign.noUsersFound")}
                        </Text>
                    </View>
                )}

                {/* ERROR */}
                {beneficiariesError && (
                    <Text style={[styles.errorText, { color: colors.error }]}>
                        {beneficiariesError.message}
                    </Text>
                )}

                {/* LISTA DE BENEFICIARIOS */}
                {formData.beneficiaries.length > 0 && (
                    <View style={styles.beneficiariesList}>
                        {formData.beneficiaries.map((beneficiary) => (
                            <BeneficiaryCard key={beneficiary.id} beneficiary={beneficiary} />
                        ))}
                    </View>
                )}
            </View>
        </View>
    );
};

export const CountryButton = ({
    country,
    isSelected,
    fn,
}: {
    country: string;
    isSelected: boolean;
    fn: (cty: any) => void;
}) => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    return (
        <TouchableOpacity
            onPress={() => fn(country)}
            style={{
                width: 70,
                height: 44,
                borderColor: colors.separator,
                borderWidth: 1,
                borderRadius: 22,
                justifyContent: 'center',
                alignItems: 'center',
                marginVertical: 10,
                backgroundColor: isSelected ? colors.success : colors.background,
                opacity: isSelected ? 0.9 : 1,
            }}
        >
            <Text style={{ color: isSelected ? colors.customWhite : colors.text, fontSize: 13 }}>
                {country}
            </Text>
        </TouchableOpacity>
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
    sectionTitle: {
        fontSize: 17,
        fontWeight: '600',
    },
    required: {
        fontSize: 17,
        fontWeight: '600',
    },
    percentageBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    percentageText: {
        fontSize: 14,
        fontWeight: '700',
    },
    // 👇 NUEVOS ESTILOS PARA PAÍS
    countrySection: {
        marginBottom: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    countryTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 4,
    },
    countrySubtitle: {
        fontSize: 13,
        marginBottom: 12,
    },
    countriesRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    payoutInfo: {
        marginTop: 8,
    },
    payoutBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 10,
    },
    badgeIcon: {
        fontSize: 16,
        marginRight: 8,
    },
    badgeText: {
        flex: 1,
        fontSize: 13,
        fontWeight: '500',
    },
    // Resto de estilos (sin cambios)
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        gap: 10,
        marginBottom: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: 'rgba(255, 255, 255, 0.9)',
    },
    searchResults: {
        marginTop: 12,
        gap: 8,
    },
    resultCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        gap: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 14,
        fontWeight: '700',
    },
    resultInfo: {
        flex: 1,
    },
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    resultName: {
        fontSize: 15,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.9)',
    },
    resultEmail: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.6)',
        marginTop: 2,
    },
    addButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    noResults: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    noResultsText: {
        fontSize: 14,
        marginTop: 8,
    },
    errorText: {
        fontSize: 13,
        marginTop: 12,
        fontWeight: '500',
    },
    beneficiariesList: {
        marginTop: 16,
        gap: 12,
    },
});
