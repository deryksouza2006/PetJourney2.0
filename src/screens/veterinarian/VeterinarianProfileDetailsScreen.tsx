import { useMemo } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '../../components/AppButton';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useVeterinarians } from '../../hooks/veterinarians/useVeterinarians';
import { radii, spacing, ThemeColors, typography } from '../../theme/tokens';

interface ProfileField {
    label: string;
    value: string;
}

const PROFILE_VETERINARIAN_QUERY_SIZE = 100;

function isEmail(value: string): boolean {
    return value.includes('@');
}

export function VeterinarianProfileDetailsScreen() {
    const { user } = useAuth();
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const veterinarians = useVeterinarians(0, PROFILE_VETERINARIAN_QUERY_SIZE);
    const veterinarian = veterinarians.data?.content.find(
        (item) => item.id === user?.veterinarianId,
    );
    const username = user?.username.trim() ?? '';
    const isLoading = user?.veterinarianId != null && veterinarians.isPending;
    const fields = useMemo<ProfileField[]>(() => {
        const result: ProfileField[] = [];
        const values = [
            { label: 'Nome', value: veterinarian?.name.trim() },
            { label: 'CRMV', value: veterinarian?.crmv.trim() },
            { label: 'Especialidade', value: veterinarian?.specialty?.trim() },
            {
                label: 'E-mail',
                value: veterinarian?.email?.trim() || (isEmail(username) ? username : ''),
            },
            { label: 'Telefone', value: veterinarian?.phone?.trim() },
            { label: 'Clínica', value: veterinarian?.clinicName?.trim() },
        ];

        for (const field of values) {
            if (field.value) {
                result.push({ label: field.label, value: field.value });
            }
        }

        return result;
    }, [username, veterinarian]);

    return (
        <SafeAreaView style={styles.safeArea} edges={['right', 'bottom', 'left']}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.wrapper}>
                    <Text style={styles.eyebrow}>CONTA PROFISSIONAL</Text>
                    <Text style={styles.title}>Dados profissionais</Text>
                    <Text style={styles.description}>
                        Informações vinculadas ao seu cadastro no PetJourney.
                    </Text>

                    {isLoading ? (
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
                                Não foi possível exibir seu cadastro profissional agora.
                            </Text>
                            <AppButton
                                label="Tentar novamente"
                                variant="secondary"
                                size="small"
                                onPress={() => void veterinarians.refetch()}
                                style={styles.retryButton}
                            />
                        </View>
                    )}

                    <Text style={styles.readOnlyHint}>
                        Para atualizar esses dados, entre em contato com a administração da clínica.
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
