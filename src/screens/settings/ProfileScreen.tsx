import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '../../components/AppButton';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { radii, shadows, spacing, ThemeColors, typography } from '../../theme/tokens';
import { UserRole } from '../../types/auth';

interface ProfileScreenProps {
    onAppearancePress: () => void;
    onAboutPress: () => void;
}

const ROLE_LABELS: Record<UserRole, string> = {
    ADMIN_SISTEMA: 'Administrador do sistema',
    ADMIN_CLINICA: 'Administrador da clínica',
    VETERINARIO: 'Veterinário',
    TUTOR: 'Tutor',
};

export function ProfileScreen({ onAppearancePress, onAboutPress }: ProfileScreenProps) {
    const { user, signOut } = useAuth();
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    return (
        <SafeAreaView style={styles.safeArea} edges={['right', 'bottom', 'left']}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.wrapper}>
                    <Text style={styles.eyebrow}>CONTA</Text>
                    <Text style={styles.title}>Perfil</Text>
                    <Text style={styles.description}>
                        Acesse as configurações e informações do aplicativo.
                    </Text>

                    <View style={styles.profileCard}>
                        <View style={styles.avatar}>
                            <Ionicons name="person-outline" size={30} color={colors.primary} />
                        </View>
                        <View style={styles.profileCopy}>
                            <Text style={styles.username}>{user?.username ?? 'Usuário'}</Text>
                            <Text style={styles.role}>
                                {user ? ROLE_LABELS[user.role] : 'Perfil não identificado'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.actions}>
                        <AppButton
                            label="Aparência"
                            onPress={onAppearancePress}
                            variant="secondary"
                        />
                        <AppButton
                            label="Sobre o App"
                            onPress={onAboutPress}
                            variant="secondary"
                        />
                        <AppButton
                            label="Sair"
                            onPress={() => void signOut()}
                            variant="secondary"
                        />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

function createStyles(colors: ThemeColors) {
    return StyleSheet.create({
        safeArea: { flex: 1, backgroundColor: colors.background },
        scrollView: { flex: 1, backgroundColor: colors.background },
        content: { flexGrow: 1, padding: spacing.xl },
        wrapper: { width: '100%', maxWidth: 640, alignSelf: 'center' },
        eyebrow: {
            color: colors.primary,
            fontSize: typography.small,
            fontWeight: '800',
            letterSpacing: 1.4,
        },
        title: {
            marginTop: spacing.sm,
            color: colors.text,
            fontSize: typography.title,
            fontWeight: '800',
        },
        description: {
            marginTop: spacing.sm,
            color: colors.textSecondary,
            fontSize: typography.body,
            lineHeight: 23,
        },
        profileCard: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: spacing.xxl,
            padding: spacing.lg,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.lg,
            backgroundColor: colors.surface,
            ...shadows.card,
        },
        avatar: {
            width: 56,
            height: 56,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: radii.pill,
            backgroundColor: colors.primarySoft,
        },
        profileCopy: { flex: 1, marginLeft: spacing.lg },
        username: { color: colors.text, fontSize: typography.body, fontWeight: '800' },
        role: { marginTop: spacing.xs, color: colors.textSecondary, fontSize: typography.caption },
        actions: { marginTop: spacing.xl, gap: spacing.md },
    });
}
