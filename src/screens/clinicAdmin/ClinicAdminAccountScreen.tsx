import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { radii, spacing, ThemeColors, typography } from '../../theme/tokens';

interface AccountField {
    label: string;
    value: string;
}

const ROLE_LABEL = 'Administrador da clínica';

function isEmail(value: string): boolean {
    return value.includes('@');
}

export function ClinicAdminAccountScreen() {
    const { user } = useAuth();
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const username = user?.username.trim() ?? '';
    const fields = useMemo<AccountField[]>(() => {
        const result: AccountField[] = [];

        if (username) {
            result.push({
                label: isEmail(username) ? 'E-mail' : 'Usuário',
                value: username,
            });
        }

        if (user?.role === 'ADMIN_CLINICA') {
            result.push({ label: 'Perfil', value: ROLE_LABEL });
        }

        return result;
    }, [user?.role, username]);

    return (
        <SafeAreaView style={styles.safeArea} edges={['right', 'bottom', 'left']}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.wrapper}>
                    <Text style={styles.eyebrow}>CONTA ADMINISTRATIVA</Text>
                    <Text style={styles.title}>Dados da conta</Text>
                    <Text style={styles.description}>
                        Informações vinculadas ao seu acesso no PetJourney.
                    </Text>

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

                    <Text style={styles.readOnlyHint}>
                        Os dados da conta são exibidos somente para consulta.
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
        readOnlyHint: {
            marginTop: spacing.lg,
            color: colors.textSecondary,
            fontSize: typography.small,
            lineHeight: 18,
        },
    });
}
