import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ProfileMenuRow,
    ProfileSection,
} from '../../components/profile/ProfileMenuSection';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useVeterinarians } from '../../hooks/veterinarians/useVeterinarians';
import {
    VeterinarianStackParamList,
    VeterinarianTabParamList,
} from '../../navigation/VeterinarianNavigator';
import { radii, shadows, spacing, ThemeColors, typography } from '../../theme/tokens';

type Props = BottomTabScreenProps<VeterinarianTabParamList, 'VeterinarianProfile'>;

const PROFILE_VETERINARIAN_QUERY_SIZE = 100;

function isEmail(value: string): boolean {
    return value.includes('@');
}

function getInitials(name: string): string {
    const words = name.trim().split(/\s+/).filter(Boolean);

    if (words.length === 0 || name === 'Veterinário') {
        return 'V';
    }

    const first = words[0]?.charAt(0) ?? '';
    const last = words.length > 1 ? words[words.length - 1]?.charAt(0) ?? '' : '';

    return `${first}${last}`.toLocaleUpperCase('pt-BR');
}

export function VeterinarianProfileScreen({ navigation }: Props) {
    const { user, signOut } = useAuth();
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const veterinarians = useVeterinarians(0, PROFILE_VETERINARIAN_QUERY_SIZE);
    const veterinarian = veterinarians.data?.content.find(
        (item) => item.id === user?.veterinarianId,
    );
    const username = user?.username.trim() ?? '';
    const veterinarianName = veterinarian?.name.trim();
    const displayName = veterinarianName
        || (username && !isEmail(username) ? username : 'Veterinário');
    const parentNavigation = navigation.getParent<
        NativeStackNavigationProp<VeterinarianStackParamList>
    >();

    return (
        <SafeAreaView style={styles.safeArea} edges={['right', 'bottom', 'left']}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.wrapper}>
                    <Text style={styles.eyebrow}>VETERINÁRIO</Text>
                    <Text style={styles.title}>Perfil</Text>

                    <View style={styles.profileCard}>
                        <View style={styles.avatar}>
                            <Text style={styles.initials}>{getInitials(displayName)}</Text>
                        </View>
                        <View style={styles.profileCopy}>
                            <Text style={styles.name}>{displayName}</Text>
                        </View>
                    </View>

                    {veterinarians.isError ? (
                        <Text style={styles.profileWarning}>
                            Alguns dados profissionais não puderam ser carregados.
                        </Text>
                    ) : null}

                    <ProfileSection title="CONTA PROFISSIONAL">
                        <ProfileMenuRow
                            icon="medkit-outline"
                            title="Dados profissionais"
                            description="Informações do seu cadastro profissional"
                            onPress={() => parentNavigation?.navigate('VeterinarianProfileDetails')}
                        />
                        <ProfileMenuRow
                            icon="shield-checkmark-outline"
                            title="Privacidade e dados"
                            description="Como o PetJourney utiliza suas informações"
                            showDivider
                            onPress={() => parentNavigation?.navigate('VeterinarianPrivacy')}
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
        content: {
            flexGrow: 1,
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.xl,
            paddingBottom: spacing.lg,
        },
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
        profileWarning: {
            marginTop: spacing.sm,
            color: colors.textSecondary,
            fontSize: typography.small,
            lineHeight: 18,
        },
    });
}
