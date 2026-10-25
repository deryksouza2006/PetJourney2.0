import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ProfileMenuRow,
    ProfileSection,
} from '../../components/profile/ProfileMenuSection';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { SystemAdminStackParamList } from '../../navigation/SystemAdminNavigator';
import { radii, shadows, spacing, ThemeColors, typography } from '../../theme/tokens';

type Props = NativeStackScreenProps<SystemAdminStackParamList, 'SystemAdminHome'>;

const ROLE_LABEL = 'Administrador do sistema';

function getInitials(name: string): string {
    const words = name.trim().split(/\s+/).filter(Boolean);

    if (words.length === 0 || name === ROLE_LABEL) {
        return 'AS';
    }

    const first = words[0]?.charAt(0) ?? '';
    const last = words.length > 1 ? words[words.length - 1]?.charAt(0) ?? '' : '';

    return `${first}${last}`.toLocaleUpperCase('pt-BR');
}

export function SystemAdminHomeScreen({ navigation }: Props) {
    const { signOut } = useAuth();
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const displayName = ROLE_LABEL;

    return (
        <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.wrapper}>
                    <Text style={styles.eyebrow}>ADMIN SISTEMA</Text>
                    <Text style={styles.title}>Administração</Text>

                    <View style={styles.profileCard}>
                        <View style={styles.avatar}>
                            <Text style={styles.initials}>{getInitials(displayName)}</Text>
                        </View>
                        <View style={styles.profileCopy}>
                            <Text style={styles.name}>{displayName}</Text>
                        </View>
                    </View>

                    <ProfileSection title="GESTÃO DA PLATAFORMA">
                        <ProfileMenuRow
                            icon="business-outline"
                            title="Clínicas"
                            description="Gerencie as clínicas cadastradas"
                            onPress={() => navigation.navigate('Clinics')}
                        />
                        <ProfileMenuRow
                            icon="add-circle-outline"
                            title="Cadastrar clínica"
                            description="Adicione uma nova clínica à plataforma"
                            showDivider
                            onPress={() => navigation.navigate('CreateClinic')}
                        />
                    </ProfileSection>

                    <ProfileSection title="INFORMAÇÕES">
                        <ProfileMenuRow
                            icon="shield-checkmark-outline"
                            title="Privacidade e dados"
                            description="Como o PetJourney utiliza as informações da plataforma"
                            onPress={() => navigation.navigate('SystemAdminPrivacy')}
                        />
                        <ProfileMenuRow
                            icon="information-circle-outline"
                            title="Sobre o App"
                            description="Versão e informações técnicas"
                            showDivider
                            onPress={() => navigation.navigate('AboutApp')}
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
    });
}
