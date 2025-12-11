import { supabase } from "@/src/lib/supabaseClient";
import { useProfileStore, profileSelectors } from "@/src/stores/profile.store";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Linking } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const useProfile = () => {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [showDeleteModal, setShowDeleteModal] = useState
    (false); // ✅ Estado del modal
    const { t: translate } = useTranslation("common")
    const [isDeleting, setIsDeleting] = useState(false); // ✅ Estado de carga

    // Store state
    const {
        user,
        kycDocuments,
        beneficiaryAccount,
        ownedCampaigns,
        beneficiaryCampaigns,
        alerts,
        stats,
        isLoading,
        isRefreshing,
        error,
        fetchProfile,
        refreshCampaigns,
        logout,
        clearError,
    } = useProfileStore();


    const needsConnect = useProfileStore(profileSelectors.needsConnect);
    const isBeneficiary = useProfileStore(profileSelectors.isBeneficiary);
    const countrySupportsConnect = useProfileStore(profileSelectors.countrySupportsConnect);

    // Load profile on mount
    useEffect(() => {
        fetchProfile();
    }, []);

    // Handle refresh
    const handleRefresh = async () => {
        await refreshCampaigns();
    };
    const handleLogout = () => {
        Alert.alert(
            translate("alert.profile.logoutTitle"),
            translate("alert.profile.logoutMessage"),
            [
                {
                    text: translate("alert.profile.logoutCancel"),
                    style: 'cancel',
                },
                {
                    text: translate("alert.profile.logoutConfirm"),
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                        router.replace('/(public)/welcome');
                    },
                },
            ]
        );
    };

    // Get Connect status details
    const getConnectDetails = () => {
        if (!beneficiaryAccount) return undefined;

        const details: string[] = [];

        if (beneficiaryAccount.bank_account_last4) {
            details.push(`Cuenta / Account: ****${beneficiaryAccount.bank_account_last4}`);
        }

        if (beneficiaryAccount.bank_name) {
            details.push(`Banco / Bank: ${beneficiaryAccount.bank_name}`);
        }

        return details.length > 0 ? details : undefined;
    };

    // Get Connect subtitle
    const getConnectSubtitle = () => {
        translate("alert.profile.logoutMessage")
        if (!isBeneficiary) {
            return translate("alert.profile.noBeneficiary");
        }

        if (!countrySupportsConnect) {
            return translate("alert.profile.manualTransfers");
        }

        const status = beneficiaryAccount?.connect_status;

        switch (status) {
            case 'verified':
            case 'active':
                return translate("alert.profile.automaticPay");
            case 'pending':
            case 'onboarding':
                return translate("alert.profile.pendingVerification");
            case 'rejected':
                return translate("alert.profile.rejectedVerification");
            default:
                return translate("alert.profile.verifyAccount");
        }
    };

    const handleContactSupport = async (userId: string, activeCampaignsCount: number) => {
        const email = translate("alert.profile.emailToSend");
        const subject = translate("alert.profile.subjectToSend");
        const body = translate("alert.profile.bodyToSend",{
            userId: userId,
            activeCampaignsCount: activeCampaignsCount.toString()
        });

        const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        try {
            // Verificar si puede abrir el URL
            const canOpen = await Linking.canOpenURL(mailtoUrl);

            if (canOpen) {
                await Linking.openURL(mailtoUrl);
            } else {
                // Si no puede abrir mailto, mostrar alternativas
                Alert.alert(
                    translate("alert.profile.contactSupport"),
                    translate("alert.profile.contactSupportMessage",{email, userId}),
                    [
                        {
                            text: translate("alert.profile.copyEmail"),
                            onPress: () => {
                                // Si tienes expo-clipboard instalado:
                                // Clipboard.setStringAsync(email);
                                Alert.alert(translate("alert.profile.copyAlert"), email);
                            }
                        },
                        { text: translate("alert.profile.closeAlert"), style: 'cancel' }
                    ]
                );
            }
        } catch (error) {
            console.error('Error abriendo soporte:', error);
            Alert.alert(
                translate("alert.profile.contactSupport"),
                translate("alert.profile.contactSupportMessage2",{email, userId}),
                [
                    { text: 'OK' }
                ]
            );
        }
    };

    const handleDeleteAccount = async () => {
        if (!user?.id) {
            Alert.alert(
                translate("common.errorTitle"), 
                translate("alert.profile.deleteAccountError")
            );
            return;
        }

        setIsDeleting(true);

        try {
            console.log('🔍 Verificando si la cuenta puede ser eliminada...');

            // 1. Verificar si tiene campañas activas con fondos
            const { data: activeCampaigns, error: campaignsError } = await supabase
                .from('campaigns')
                .select('id, title, total_raised, status')
                .eq('owner_user_id', user.id)
                .in('status', ['active', 'triggered'])
                .gt('total_raised', 0);

            if (campaignsError) {
                console.error('Error verificando campañas:', campaignsError);
                throw new Error('No se pudo verificar el estado de tus campañas');
            }

            console.log('Campañas activas con fondos:', activeCampaigns?.length || 0);

            if (activeCampaigns && activeCampaigns.length > 0) {
                // 🚫 No puede eliminar
                setIsDeleting(false);

                const campaignsList = activeCampaigns
                    .map(c => `• ${c.title}: $${c.total_raised}`)
                    .join('\n');

                Alert.alert(
                    translate("alert.profile.cantDeleteTitle"),
                    translate("alert.profile.cantDeleteMessage",{
                        activeCampaigns: activeCampaigns.length.toString(),
                        campaignsList: campaignsList
                    }),
                    
                    [
                        {
                            text: translate("alert.profile.contactSupport"),
                            onPress: () => {
                                // ✅ Usar la nueva función helper
                                handleContactSupport(user.id, activeCampaigns.length);
                            }
                        },
                        { text: 'OK', style: 'cancel' }
                    ]
                );
                return;
            }

            // 2. Si puede eliminar, mostrar modal de razones
            setIsDeleting(false);
            setShowDeleteModal(true);

        } catch (error: any) {
            setIsDeleting(false);
            console.error('Error en handleDeleteAccount:', error);
            Alert.alert('Error', error.message || translate("alert.profile.cantVerifyAccount"));
        }
    };

    const confirmDeletion = async (reason: string) => {
        if (!user?.id) return;

        try {
            console.log('🗑️ Eliminando cuenta con razón:', reason);

            // Llamar a Edge Function
            const { data, error } = await supabase.functions.invoke('delete-user-account', {
                body: {
                    userId: user.id,
                    reason: reason
                }
            });

            console.log('Respuesta de función:', { data, error });

            if (error) {
                console.error('Error de función:', error);
                throw new Error(error.message || 'Error al eliminar la cuenta');
            }

            if (data?.error) {
                console.error('Error en data:', data.error);
                Alert.alert(translate("alert.profile.cantDelete"), data.error);
                setShowDeleteModal(false);
                return;
            }

            console.log('✅ Cuenta eliminada exitosamente');

            // Cerrar modal
            setShowDeleteModal(false);

            // Cerrar sesión
            await supabase.auth.signOut();

            // Mostrar confirmación y redirigir
            Alert.alert(
                translate("alert.profile.deleteSuccess"),
                translate("alert.profile.deleteSuccessMessage"),
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            router.replace('/(public)/welcome');
                        }
                    }
                ],
                { cancelable: false }
            );

        } catch (error: any) {
            console.error('Error en confirmDeletion:', error);
            setShowDeleteModal(false);
            Alert.alert(
                'Error',
                error.message || translate("common.errorSupport")
            );
        }
    };

    const getKYCSubtitle = () => {
        switch (user?.kyc_status) {
            case 'kyc_verified':
                return translate("alert.profile.kycVerified");
            case 'kyc_review':
                return translate("alert.profile.kycReview");
            case 'kyc_rejected':
                return translate("alert.profile.kycRejected");
            case 'kyc_pending':
            default:
                return translate("alert.profile.kycPending");
        }
    };

    const shouldShowKYCAlert = () => {
        if (!user) return false;

        const hasActivities = ownedCampaigns.length > 0 || beneficiaryCampaigns.length > 0;

        // Solo mostrar alert si tiene actividades Y está pending o rejected
        return hasActivities && (user.kyc_status === 'kyc_pending' || user.kyc_status === 'kyc_rejected');
    };




    return {
        user,
        kycDocuments,
        beneficiaryAccount,
        ownedCampaigns,
        beneficiaryCampaigns,
        alerts,
        stats,
        isLoading,
        isRefreshing,
        error,
        fetchProfile,
        refreshCampaigns,
        logout,
        clearError,
        router,
        insets,
        showDeleteModal,
        setShowDeleteModal,
        isDeleting,
        setIsDeleting,
        needsConnect,
        isBeneficiary,
        countrySupportsConnect,
        handleRefresh,
        handleLogout,
        getConnectDetails,
        getConnectSubtitle,
        handleContactSupport,
        handleDeleteAccount,
        confirmDeletion,
        getKYCSubtitle,
        shouldShowKYCAlert,
        translate
    }
}