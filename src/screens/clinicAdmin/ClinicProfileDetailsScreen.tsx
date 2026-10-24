import Ionicons from '@expo/vector-icons/Ionicons';
import { ComponentProps } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppButton } from '../../components/AppButton';
import { useAuth } from '../../contexts/AuthContext';
import { useClinic } from '../../hooks/clinics/useClinic';
import { colors, createThemedStyles, radii, spacing, typography } from '../../theme/tokens';

type IconName = ComponentProps<typeof Ionicons>['name'];

interface ClinicInformationRowProps {
    icon: IconName;
    label: string;
    value: string;
    showDivider?: boolean;
}

function ClinicInformationRow({
    icon,
    label,
    value,
    showDivider = false,
}: ClinicInformationRowProps) {
    return (
        <>
            {showDivider ? <View style={styles.divider} /> : null}
            <View style={styles.informationRow}>
                <View style={styles.iconContainer}>
                    <Ionicons name={icon} size={20} color={colors.primary} />
                </View>
                <View style={styles.informationCopy}>
                    <Text style={styles.informationLabel}>{label}</Text>
                    <Text style={styles.informationValue} selectable>{value}</Text>
                </View>
            </View>
        </>
    );
}

export function ClinicProfileDetailsScreen() {
    const { user } = useAuth();
    const insets = useSafeAreaInsets();
    const clinic = useClinic(user?.clinicId ?? null);

    if (user?.clinicId == null) {
        return (
            <SafeAreaView style={styles.centeredState} edges={['right', 'bottom', 'left']}>
                <View style={styles.stateIcon}>
                    <Ionicons name="alert-circle-outline" size={24} color={colors.danger} />
                </View>
                <Text style={styles.stateTitle}>Clínica não identificada.</Text>
                <Text style={styles.stateMessage}>
                    Não foi possível identificar a clínica vinculada à sessão.
                </Text>
            </SafeAreaView>
        );
    }

    if (clinic.isPending) {
        return (
            <SafeAreaView style={styles.centeredState} edges={['right', 'bottom', 'left']}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.stateMessage}>Carregando perfil da clínica...</Text>
            </SafeAreaView>
        );
    }

    if (clinic.isError) {
        return (
            <SafeAreaView style={styles.centeredState} edges={['right', 'bottom', 'left']}>
                <View style={styles.stateIcon}>
                    <Ionicons name="alert-circle-outline" size={24} color={colors.danger} />
                </View>
                <Text style={styles.stateTitle}>Não foi possível carregar a clínica.</Text>
                <Text style={styles.stateMessage}>Verifique sua conexão e tente novamente.</Text>
                <AppButton
                    label="Tentar novamente"
                    variant="secondary"
                    size="small"
                    onPress={() => void clinic.refetch()}
                />
            </SafeAreaView>
        );
    }

    const phone = clinic.data.phone?.trim();
    const email = clinic.data.email?.trim();
    const address = clinic.data.address?.trim();

    return (
        <SafeAreaView style={styles.safeArea} edges={['right', 'bottom', 'left']}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.content,
                    { paddingBottom: spacing.xxl + insets.bottom },
                ]}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.wrapper}>
                    <View style={styles.profileHeader}>
                        <View style={styles.profileIcon}>
                            <Ionicons name="business" size={30} color={colors.primary} />
                        </View>
                        <Text style={styles.title}>{clinic.data.name}</Text>
                        <Text style={styles.subtitle}>Perfil da clínica</Text>
                    </View>

                    <Text style={styles.sectionTitle}>INFORMAÇÕES CADASTRAIS</Text>
                    <View style={styles.surface}>
                        <ClinicInformationRow
                            icon="business-outline"
                            label="Nome"
                            value={clinic.data.name}
                        />
                        <ClinicInformationRow
                            icon="document-text-outline"
                            label="CNPJ"
                            value={clinic.data.cnpj}
                            showDivider
                        />
                        {email ? (
                            <ClinicInformationRow
                                icon="mail-outline"
                                label="E-mail"
                                value={email}
                                showDivider
                            />
                        ) : null}
                        {phone ? (
                            <ClinicInformationRow
                                icon="call-outline"
                                label="Telefone"
                                value={phone}
                                showDivider
                            />
                        ) : null}
                        {address ? (
                            <ClinicInformationRow
                                icon="location-outline"
                                label="Endereço"
                                value={address}
                                showDivider
                            />
                        ) : null}
                    </View>

                    <View style={styles.readOnlyNotice}>
                        <Ionicons name="lock-closed-outline" size={18} color={colors.textSecondary} />
                        <Text style={styles.readOnlyText}>
                            Os dados cadastrais são gerenciados pela administração do sistema.
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = createThemedStyles((themeColors) => ({
    safeArea: { flex: 1, backgroundColor: themeColors.background },
    scrollView: { flex: 1, backgroundColor: themeColors.background },
    content: { flexGrow: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.xl },
    wrapper: { width: '100%', maxWidth: 760, alignSelf: 'center' },
    profileHeader: {
        alignItems: 'center',
        marginBottom: spacing.xxl,
        padding: spacing.xl,
        borderWidth: 1,
        borderColor: themeColors.border,
        borderRadius: radii.lg,
        backgroundColor: themeColors.surface,
    },
    profileIcon: {
        width: 64,
        height: 64,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
        borderRadius: radii.pill,
        backgroundColor: themeColors.primarySoft,
    },
    title: {
        color: themeColors.text,
        fontSize: typography.title,
        fontWeight: '800',
        textAlign: 'center',
    },
    subtitle: {
        marginTop: spacing.xs,
        color: themeColors.textSecondary,
        fontSize: typography.caption,
    },
    sectionTitle: {
        marginBottom: spacing.md,
        color: themeColors.text,
        fontSize: typography.small,
        fontWeight: '800',
        letterSpacing: 1.2,
    },
    surface: {
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: themeColors.border,
        borderRadius: radii.lg,
        backgroundColor: themeColors.surface,
    },
    informationRow: {
        minHeight: 74,
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
    },
    iconContainer: {
        width: 40,
        height: 40,
        flexShrink: 0,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: radii.md,
        backgroundColor: themeColors.primarySoft,
    },
    informationCopy: { minWidth: 0, flex: 1, marginLeft: spacing.md },
    informationLabel: {
        color: themeColors.textSecondary,
        fontSize: typography.small,
        fontWeight: '700',
    },
    informationValue: {
        marginTop: spacing.xs,
        color: themeColors.text,
        fontSize: typography.caption,
        fontWeight: '700',
        lineHeight: 20,
    },
    divider: {
        height: 1,
        marginLeft: 40 + spacing.lg + spacing.md,
        backgroundColor: themeColors.border,
    },
    readOnlyNotice: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.sm,
        marginTop: spacing.lg,
        padding: spacing.md,
    },
    readOnlyText: {
        minWidth: 0,
        flex: 1,
        color: themeColors.textSecondary,
        fontSize: typography.small,
        lineHeight: 18,
    },
    centeredState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.md,
        padding: spacing.xl,
        backgroundColor: themeColors.background,
    },
    stateIcon: {
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: radii.pill,
        backgroundColor: themeColors.primarySoft,
    },
    stateTitle: {
        color: themeColors.text,
        fontSize: typography.body,
        fontWeight: '800',
        textAlign: 'center',
    },
    stateMessage: {
        color: themeColors.textSecondary,
        fontSize: typography.caption,
        lineHeight: 20,
        textAlign: 'center',
    },
}));
