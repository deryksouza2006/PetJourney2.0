import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { radii, spacing, ThemeColors, typography } from '../../theme/tokens';
import { Clinic } from '../../types/clinic';

interface SystemClinicSummaryListProps {
    clinics: Clinic[];
    isLoading: boolean;
    isError: boolean;
    onRetry: () => void;
}

export function SystemClinicSummaryList({
    clinics,
    isLoading,
    isError,
    onRetry,
}: SystemClinicSummaryListProps) {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    return (
        <View>
            <Text style={styles.sectionTitle}>CLÍNICAS</Text>
            <Text style={styles.sectionDescription}>
                Primeiros registros na ordem retornada pela plataforma.
            </Text>

            {isLoading ? (
                <View style={styles.stateCard}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={styles.stateText}>Carregando clínicas...</Text>
                </View>
            ) : isError ? (
                <View style={styles.stateCard}>
                    <Text style={styles.errorText}>Não foi possível carregar as clínicas.</Text>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Tentar carregar as clínicas novamente"
                        style={({ pressed }) => [styles.retry, pressed && styles.pressed]}
                        onPress={onRetry}
                    >
                        <Text style={styles.retryText}>Tentar novamente</Text>
                    </Pressable>
                </View>
            ) : clinics.length === 0 ? (
                <View style={styles.stateCard}>
                    <Ionicons name="business-outline" size={23} color={colors.primary} />
                    <Text style={styles.stateText}>Nenhuma clínica cadastrada.</Text>
                </View>
            ) : (
                <View style={styles.listCard}>
                    {clinics.map((clinic, index) => (
                        <View
                            key={clinic.id}
                            accessible
                            accessibilityLabel={`${clinic.name}, CNPJ ${clinic.cnpj}`}
                            style={[styles.row, index > 0 && styles.rowSeparator]}
                        >
                            <View style={styles.iconContainer}>
                                <Ionicons name="business" size={19} color={colors.primary} />
                            </View>
                            <View style={styles.copy}>
                                <Text style={styles.clinicName}>{clinic.name}</Text>
                                <Text style={styles.cnpj}>CNPJ {clinic.cnpj}</Text>
                                {clinic.email?.trim() ? (
                                    <Text style={styles.contact} numberOfLines={1}>
                                        {clinic.email}
                                    </Text>
                                ) : clinic.phone?.trim() ? (
                                    <Text style={styles.contact} numberOfLines={1}>
                                        {clinic.phone}
                                    </Text>
                                ) : null}
                            </View>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
}

function createStyles(colors: ThemeColors) {
    return StyleSheet.create({
        sectionTitle: {
            color: colors.text,
            fontSize: typography.small,
            fontWeight: '800',
            letterSpacing: 1.2,
        },
        sectionDescription: {
            marginTop: spacing.xs,
            marginBottom: spacing.md,
            color: colors.textSecondary,
            fontSize: typography.small,
            lineHeight: 18,
        },
        stateCard: {
            minHeight: 108,
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.sm,
            padding: spacing.lg,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.lg,
            backgroundColor: colors.card,
        },
        stateText: { color: colors.textSecondary, fontSize: typography.caption, textAlign: 'center' },
        errorText: { color: colors.danger, fontSize: typography.caption, textAlign: 'center' },
        retry: {
            minHeight: 44,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: spacing.lg,
            borderWidth: 1,
            borderColor: colors.primary,
            borderRadius: radii.md,
            backgroundColor: colors.primarySoft,
        },
        retryText: { color: colors.primary, fontSize: typography.caption, fontWeight: '800' },
        pressed: { opacity: 0.7 },
        listCard: {
            overflow: 'hidden',
            paddingHorizontal: spacing.lg,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.lg,
            backgroundColor: colors.card,
        },
        row: {
            minHeight: 84,
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: spacing.md,
        },
        rowSeparator: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
        iconContainer: {
            width: 40,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: radii.md,
            backgroundColor: colors.primarySoft,
        },
        copy: { flex: 1, marginLeft: spacing.md },
        clinicName: { color: colors.text, fontSize: typography.caption, fontWeight: '800' },
        cnpj: {
            marginTop: spacing.xs,
            color: colors.textSecondary,
            fontSize: typography.small,
        },
        contact: {
            marginTop: spacing.xs,
            color: colors.textSecondary,
            fontSize: 10,
        },
    });
}
