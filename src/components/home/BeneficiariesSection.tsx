// src/components/campaign/BeneficiariesSection.tsx
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
import { BeneficiaryShareType, BeneficiaryUser, CampaignBeneficiary } from '@/src/types/campaign-create.types';
import { BeneficiaryCard } from './BeneficiaryCard';

export const BeneficiariesSection = () => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    const { formData, addBeneficiary, errors } = useCreateCampaignStore();

    // Estados de búsqueda
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<BeneficiaryUser[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string>('');

    const debouncedSearch = useDebounce(searchQuery, 300);

    // Obtener usuario actual
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
        // Verificar si ya está agregado
        const isAlreadyAdded = formData.beneficiaries.some(
            (b) => b.user.id === user.id
        );

        if (isAlreadyAdded) {
            Alert.alert('Ya agregado', 'Este usuario ya es beneficiario de la campaña.');
            return;
        }

        // Verificar límite
        if (formData.beneficiaries.length >= 3) {
            Alert.alert('Límite alcanzado', 'Solo puedes agregar hasta 3 beneficiarios.');
            return;
        }

        // Calcular share inicial
        const shareValue =
            formData.distributionRule === 'percentage'
                ? Math.floor(100 / (formData.beneficiaries.length + 1))
                : 1;


                
        const shareType: 'percent' | 'fixed_amount' =
            formData.distributionRule === 'percentage' ? 'percent' : 'fixed_amount';


              console.log('🔍 DEBUG shareType:', shareType); // 👈 Agrega esto
  console.log('🔍 DEBUG distributionRule:', formData.distributionRule); 
        const newBeneficiary: CampaignBeneficiary = {
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            user: user,
            shareType: shareType, // Ahora usa el tipo correcto
            shareValue: shareValue,
            documents: [],
        };

        addBeneficiary(newBeneficiary);
        setSearchQuery('');
        setSearchResults([]);
    };

    // Calcular porcentaje total
    const totalPercentage = formData.beneficiaries.reduce(
        (sum, b) => sum + (b.shareValue || 0),
        0
    );

    const beneficiariesError = errors.find((e) => e.field === 'beneficiaries');

    return (
        <View style={styles.container}>
            <View
                style={[
                    styles.card,
                    {
                        backgroundColor:
                            colorScheme === 'dark'
                                ? 'rgba(30, 42, 54, 0.7)'
                                : 'rgba(251, 252, 251, 0.7)',
                        borderColor:
                            colorScheme === 'dark'
                                ? 'rgba(42, 63, 84, 0.5)'
                                : 'rgba(172, 202, 231, 0.3)',
                    },
                ]}
            >
                {/* HEADER */}
                <View style={styles.header}>
                    <View style={styles.titleContainer}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            Beneficiarios
                        </Text>
                        <Text style={[styles.required, { color: colors.error }]}> *</Text>
                    </View>

                    {/* Badge de porcentaje */}
                    {formData.distributionRule === 'percentage' && formData.beneficiaries.length > 0 && (
                        <View
                            style={[
                                styles.percentageBadge,
                                {
                                    backgroundColor:
                                        totalPercentage === 100 ? colors.success + '20' : colors.warning + '20',
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
                        placeholder="Buscar por email del beneficiario"
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
                                {/* Avatar */}
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

                                {/* Info */}
                                <View style={styles.resultInfo}>
                                    <View style={styles.nameContainer}>
                                        <Text style={styles.resultName}>{user.display_name}</Text>
                                        {user.kyc_status === 'kyc_verified' && (
                                            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                                        )}
                                    </View>
                                    <Text style={styles.resultEmail}>{user.email}</Text>
                                </View>

                                {/* Add Button */}
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
                            No se encontraron usuarios
                        </Text>
                    </View>
                )}

                {/* ERROR */}
                {beneficiariesError && (
                    <Text style={[styles.errorText, { color: colors.error }]}>
                        {beneficiariesError.message}
                    </Text>
                )}


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
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        gap: 10,
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
        marginTop: 8,
    },
});