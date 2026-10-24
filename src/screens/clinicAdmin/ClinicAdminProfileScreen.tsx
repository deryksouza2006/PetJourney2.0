import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    ProfileMenuRow,
    ProfileSection,
} from '../../components/profile/ProfileMenuSection';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useClinic } from '../../hooks/clinics/useClinic';
import {
    ClinicAdminStackParamList,
    ClinicAdminTabParamList,
} from '../../navigation/ClinicAdminNavigator';
import { radii, shadows, spacing, ThemeColors, typography } from '../../theme/tokens';

type Props = BottomTabScreenProps<ClinicAdminTabParamList, 'ClinicProfile'>;

const ROLE_LABEL = 'Administrador da clínica';

function isEmail(value: string): boolean {
    return value.includes('@');
}

function getInitials(name: string): string {
    const words = name.trim().split(/\s+/).filter(Boolean);

    if (words.length === 0 || name === ROLE_LABEL) {
        return 'AC';
    }

    const first = words[0]?.charAt(0) ?? '';
    const last = words.length > 1 ? words[words.length - 1]?.charAt(0) ?? '' : '';

    return `${first}${last}`.toLocaleUpperCase('pt-BR');
}

export function ClinicAdminProfileScreen({ navigation }: Props) {
    const { user, signOut } = useAuth();
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const clinic = useClinic(user?.clinicId ?? null);
    const username = user?.username.trim() ?? '';
    const displayName = username && !isEmail(username) ? username : ROLE_LABEL;
    const email = isEmail(username) ? username : null;
    const clinicName = clinic.data?.name.trim();
    const parentNavigation = navigation.getParent<
        NativeStackNavigationProp<ClinicAdminStackParamList>
    >();

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
                    <Text style={styles.eyebrow}>ADMIN CLÍNICA</Text>
                    <Text style={styles.title}>Perfil</Text>

                    <View style={styles.profileCard}>
                        <View style={styles.avatar}>
                            <Text style={styles.initials}>{getInitials(displayName)}</Text>
                        </View>
                        <View style={styles.profileCopy}>
                            <Text style={styles.name}>{displayName}</Text>
                            {clinicName ? (
                                <Text style={styles.primaryDetail}>{clinicName}</Text>
                            ) : null}
                            {email ? <Text style={styles.secondaryDetail}>{email}</Text> : null}
                            {displayName !== ROLE_LABEL ? (
                                <Text style={styles.secondaryDetail}>{ROLE_LABEL}</Text>
                            ) : null}
                            {user?.clinicId != null && clinic.isPending ? (
                                <View style={styles.inlineLoading}>
                                    <ActivityIndicator size="small" color={colors.primary} />
                                    <Text style={styles.secondaryDetail}>
                                        Carregando clínica...
                                    </Text>
                                </View>
                            ) : null}
                        </View>
                    </View>

                    {clinic.isError ? (
                        <Text style={styles.profileWarning}>
                            Os dados da clínica não puderam ser carregados.
                        </Text>
                    ) : null}
                    {user?.clinicId == null ? (
                        <Text style={styles.profileWarning}>
                            Nenhuma clínica foi identificada na sessão atual.
                        </Text>
                    ) : null}

                    <ProfileSection title="CONTA ADMINISTRATIVA">
                        <ProfileMenuRow
                            icon="person-outline"
                            title="Dados da conta"
                            description="Informações do administrador"
                            onPress={() => parentNavigation?.navigate('ClinicAdminAccount')}
                        />
                        <ProfileMenuRow
                            icon="business-outline"
                            title="Dados da clínica"
                            description="Informações da clínica vinculada"
                            showDivider
                            onPress={() => parentNavigation?.navigate('ClinicProfileDetails')}
                        />
                        <ProfileMenuRow
                            icon="shield-checkmark-outline"
                            title="Privacidade e dados"
                            description="Como o PetJourney utiliza suas informações"
                            showDivider
                            onPress={() => parentNavigation?.navigate('ClinicAdminPrivacy')}
                        />
                        <ProfileMenuRow
                            icon="information-circle-outline"
                            title="Sobre o App"
                            description="Versão e informações técnicas"
                            showDivider
                            onPress={() => parentNavigation?.navigate('AboutApp')}
                        />
                    </ProfileSection>

                    <ProfileSection>
                        <ProfileMenuRow
                            icon="log-out-outline"
                            title="Sair"
                            destructive
                            showChevron={false}
                            onPress={() => void signOut()}
                        />
                    </ProfileSection>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

function createStyles(colors: ThemeColors) {
    return StyleSheet.create({
        safeArea: { flex: 1, backgroundColor: colors.background },
        scrollView: { flex: 1, backgroundColor: colors.background },
        content: { flexGrow: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.xl },
        wrapper: { width: '100%', maxWidth: 640, alignSelf: 'center' },
        eyebrow: {
            color: colors.primary,
            fontSize: typography.small,
            fontWeight: '800',
            letterSpacing: 1.4,
        },
        title: {
            marginTop: spacing.xs,
            color: colors.text,
            fontSize: typography.title,
            fontWeight: '800',
            letterSpacing: -0.5,
        },
        profileCard: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: spacing.xl,
            padding: spacing.lg,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.lg,
            backgroundColor: colors.card,
            ...shadows.card,
        },
        avatar: {
            width: 64,
            height: 64,
            flexShrink: 0,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: radii.pill,
            backgroundColor: colors.primarySoft,
        },
        initials: {
            color: colors.primaryDark,
            fontSize: typography.heading,
            fontWeight: '800',
            letterSpacing: 0.5,
        },
        profileCopy: { minWidth: 0, flex: 1, marginLeft: spacing.lg },
        name: { color: colors.text, fontSize: typography.heading, fontWeight: '800' },
        primaryDetail: {
            marginTop: spacing.xs,
            color: colors.text,
            fontSize: typography.caption,
            fontWeight: '700',
        },
        secondaryDetail: {
            marginTop: spacing.xs,
            color: colors.textSecondary,
            fontSize: typography.small,
            lineHeight: 17,
        },
        inlineLoading: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
        profileWarning: {
            marginTop: spacing.sm,
            color: colors.textSecondary,
            fontSize: typography.small,
            lineHeight: 18,
        },
    });
}
