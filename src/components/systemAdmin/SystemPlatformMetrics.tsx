import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { radii, shadows, spacing, ThemeColors, typography } from '../../theme/tokens';

interface SystemPlatformMetricsProps {
    clinicTotal: number | null;
    isLoading: boolean;
    isError: boolean;
}

export function SystemPlatformMetrics({
    clinicTotal,
    isLoading,
    isError,
}: SystemPlatformMetricsProps) {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const accessibilityValue = isLoading
        ? 'carregando'
        : isError
            ? 'indisponível'
            : String(clinicTotal ?? 0);

    return (
        <View style={styles.grid}>
            <View
                accessible
                accessibilityLabel={`Clínicas: ${accessibilityValue}`}
                style={styles.card}
            >
                <View style={styles.cardHeader}>
                    <Text style={styles.label}>CLÍNICAS</Text>
                    <View style={styles.iconContainer}>
                        <Ionicons name="business" size={19} color={colors.primary} />
                    </View>
                </View>
                {isLoading ? (
                    <ActivityIndicator size="small" color={colors.primary} style={styles.loader} />
                ) : isError ? (
                    <>
                        <Text style={styles.errorValue}>--</Text>
                        <Text style={styles.caption}>Indisponível</Text>
                    </>
                ) : (
                    <Text style={styles.value}>{clinicTotal ?? 0}</Text>
                )}
            </View>
        </View>
    );
}

function createStyles(colors: ThemeColors) {
    return StyleSheet.create({
        grid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginBottom: spacing.xxl,
        },
        card: {
            width: '48%',
            minWidth: 128,
            minHeight: 126,
            padding: spacing.lg,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.lg,
            backgroundColor: colors.card,
            ...shadows.card,
        },
        cardHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: spacing.sm,
        },
        label: {
            color: colors.textSecondary,
            fontSize: typography.small,
            fontWeight: '800',
            letterSpacing: 0.8,
        },
        iconContainer: {
            width: 34,
            height: 34,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: radii.md,
            backgroundColor: colors.primarySoft,
        },
        value: {
            marginTop: spacing.md,
            color: colors.text,
            fontSize: typography.title,
            fontWeight: '800',
        },
        errorValue: {
            marginTop: spacing.md,
            color: colors.danger,
            fontSize: typography.title,
            fontWeight: '800',
        },
        loader: { alignSelf: 'flex-start', marginTop: spacing.lg },
        caption: { marginTop: spacing.xs, color: colors.textSecondary, fontSize: 10 },
    });
}
