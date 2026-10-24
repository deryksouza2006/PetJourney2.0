import { useMemo } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '../../components/AppButton';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useTutor } from '../../hooks/tutors/useTutor';
import { radii, spacing, ThemeColors, typography } from '../../theme/tokens';

interface ProfileField {
    label: string;
    value: string;
}

function isEmail(value: string): boolean {
    return value.includes('@');
}

export function TutorProfileDetailsScreen() {
    const { user } = useAuth();
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const tutor = useTutor(user?.tutorId ?? null);
    const username = user?.username.trim() ?? '';
    const isTutorLoading = user?.tutorId != null && tutor.isPending;
    const fields = useMemo<ProfileField[]>(() => {
        const result: ProfileField[] = [];
        const name = tutor.data?.name.trim();
        const email = tutor.data?.email?.trim() || (isEmail(username) ? username : '');
        const phone = tutor.data?.phone?.trim();

        if (name) {
            result.push({ label: 'Nome', value: name });
        }

        if (email) {
            result.push({ label: 'E-mail', value: email });
        }

        if (phone) {
            result.push({ label: 'Telefone', value: phone });
        }

        return result;
    }, [tutor.data, username]);

    return (
        <SafeAreaView style={styles.safeArea} edges={['right', 'bottom', 'left']}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.wrapper}>
                    <Text style={styles.eyebrow}>CONTA</Text>
                    <Text style={styles.title}>Dados do perfil</Text>
                    <Text style={styles.description}>
                        Informações vinculadas à sua conta no PetJourney.
                    </Text>

                    {isTutorLoading ? (
                        <View style={styles.state}>
                            <ActivityIndicator color={colors.primary} />
                            <Text style={styles.stateText}>Carregando dados...</Text>
                        </View>
                    ) : fields.length > 0 ? (
                        <View style={styles.card}>
                            {fields.map((field, index) => (
                                <View
                                    key={field.label}
                                    style={[styles.field, index > 0 && styles.fieldDivider]}
                                >
                                    <Text style={styles.label}>{field.label}</Text>
                                    <Text style={styles.value} selectable>{field.value}</Text>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <View style={styles.state}>
                            <Text style={styles.stateTitle}>Dados indisponíveis</Text>
                            <Text style={styles.stateText}>
                                Não foi possível exibir informações da sua conta agora.
                            </Text>
                            <AppButton
                                label="Tentar novamente"
                                variant="secondary"
                                size="small"
                                onPress={() => void tutor.refetch()}
                                style={styles.retryButton}
                            />
                        </View>
                    )}

                    <Text style={styles.readOnlyHint}>
                        Para manter seus dados atualizados, entre em contato com a clínica vinculada.
                    </Text>
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
            letterSpacing: 1.3,
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
        card: {
            overflow: 'hidden',
            marginTop: spacing.xl,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.lg,
            backgroundColor: colors.surface,
        },
        field: { padding: spacing.lg },
        fieldDivider: {
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: colors.border,
        },
        label: {
            color: colors.textSecondary,
            fontSize: typography.small,
            fontWeight: '700',
        },
        value: {
            marginTop: spacing.xs,
            color: colors.text,
            fontSize: typography.body,
            lineHeight: 23,
        },
        state: {
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.sm,
            minHeight: 160,
            marginTop: spacing.xl,
            padding: spacing.xl,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.lg,
            backgroundColor: colors.surface,
        },
        stateTitle: {
            color: colors.text,
            fontSize: typography.body,
            fontWeight: '800',
            textAlign: 'center',
        },
        stateText: {
            color: colors.textSecondary,
            fontSize: typography.caption,
            lineHeight: 20,
            textAlign: 'center',
        },
        retryButton: { marginTop: spacing.sm },
        readOnlyHint: {
            marginTop: spacing.lg,
            color: colors.textSecondary,
            fontSize: typography.small,
            lineHeight: 18,
        },
    });
}
