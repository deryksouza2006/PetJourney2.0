import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useMemo } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    ProfileMenuRow,
    ProfileSection,
} from '../../components/profile/ProfileMenuSection';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { usePets } from '../../hooks/pets/usePets';
import { useTutor } from '../../hooks/tutors/useTutor';
import { TutorStackParamList, TutorTabParamList } from '../../navigation/TutorNavigator';
import { radii, shadows, spacing, ThemeColors, typography } from '../../theme/tokens';

type Props = BottomTabScreenProps<TutorTabParamList, 'TutorProfile'>;

const PROFILE_PET_QUERY_SIZE = 100;

function isEmail(value: string): boolean {
    return value.includes('@');
}

function getInitials(name: string): string {
    const words = name.trim().split(/\s+/).filter(Boolean);

    if (words.length === 0 || name === 'Tutor') {
        return 'TU';
    }

    const first = words[0]?.charAt(0) ?? '';
    const last = words.length > 1 ? words[words.length - 1]?.charAt(0) ?? '' : '';

    return `${first}${last}`.toLocaleUpperCase('pt-BR');
}

function formatPetCount(count: number): string {
    return count === 1 ? '1 pet vinculado' : `${count} pets vinculados`;
}

export function TutorProfileScreen({ navigation }: Props) {
    const { user, signOut } = useAuth();
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const tutor = useTutor(user?.tutorId ?? null);
    const pets = usePets(0, PROFILE_PET_QUERY_SIZE);
    const username = user?.username.trim() ?? '';
    const tutorName = tutor.data?.name.trim();
    const displayName = tutorName || (username && !isEmail(username) ? username : 'Tutor');
    const email = tutor.data?.email?.trim() || (isEmail(username) ? username : null);
    const parentNavigation = navigation.getParent<
        NativeStackNavigationProp<TutorStackParamList>
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
                    <Text style={styles.eyebrow}>TUTOR</Text>
                    <Text style={styles.title}>Perfil</Text>

                    <View style={styles.profileCard}>
                        <View style={styles.avatar}>
                            <Text style={styles.initials}>{getInitials(displayName)}</Text>
                        </View>
                        <View style={styles.profileCopy}>
                            <Text style={styles.name}>{displayName}</Text>
                            {email ? <Text style={styles.email}>{email}</Text> : null}
                            {pets.isPending ? (
                                <View style={styles.inlineLoading}>
                                    <ActivityIndicator size="small" color={colors.primary} />
                                    <Text style={styles.supportingText}>Carregando pets...</Text>
                                </View>
                            ) : pets.isError ? (
                                <Text style={styles.supportingText}>
                                    Quantidade de pets indisponível
                                </Text>
                            ) : (
                                <Text style={styles.supportingText}>
                                    {formatPetCount(pets.data.totalElements)}
                                </Text>
                            )}
                        </View>
                    </View>

                    {tutor.isError ? (
                        <Text style={styles.profileWarning}>
                            Alguns dados do perfil não puderam ser carregados.
                        </Text>
                    ) : null}

                    <ProfileSection title="CONTA">
                        <ProfileMenuRow
                            icon="person-outline"
                            title="Dados do perfil"
                            description="Informações da sua conta"
                            onPress={() => parentNavigation?.navigate('TutorProfileDetails')}
                        />
                        <ProfileMenuRow
                            icon="shield-checkmark-outline"
                            title="Privacidade e dados"
                            description="Como o PetJourney utiliza suas informações"
                            showDivider
                            onPress={() => parentNavigation?.navigate('TutorPrivacy')}
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
        email: {
            marginTop: spacing.xs,
            color: colors.textSecondary,
            fontSize: typography.caption,
        },
        supportingText: {
            marginTop: spacing.xs,
            color: colors.textSecondary,
            fontSize: typography.small,
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
