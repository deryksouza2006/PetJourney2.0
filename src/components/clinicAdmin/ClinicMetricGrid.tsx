import Ionicons from '@expo/vector-icons/Ionicons';
import { ComponentProps, useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { radii, shadows, spacing, ThemeColors, typography } from '../../theme/tokens';

interface MetricState {
    value: number | null;
    isLoading?: boolean;
    isError?: boolean;
}

interface ClinicMetricGridProps {
    patients: MetricState;
    veterinarians: MetricState;
    alerts: MetricState;
}

type IoniconName = ComponentProps<typeof Ionicons>['name'];

interface MetricCardProps extends MetricState {
    label: string;
    icon: IoniconName;
    unavailableLabel?: string;
    colors: ThemeColors;
    styles: ReturnType<typeof createStyles>;
}

export function ClinicMetricGrid({
    patients,
    veterinarians,
    alerts,
}: ClinicMetricGridProps) {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    return (
        <View style={styles.grid}>
            <MetricCard
                label="PACIENTES"
                icon="paw"
                {...patients}
                colors={colors}
                styles={styles}
            />
            <MetricCard
                label="VETERINÁRIOS"
                icon="people"
                {...veterinarians}
                colors={colors}
                styles={styles}
            />
            <MetricCard
                label="HOJE"
                icon="calendar"
                value={null}
                unavailableLabel="Agenda sem resumo"
                colors={colors}
                styles={styles}
            />
            <MetricCard
                label="ALERTAS"
                icon="warning"
                {...alerts}
                colors={colors}
                styles={styles}
            />
        </View>
    );
}

function MetricCard({
    label,
    icon,
    value,
    isLoading = false,
    isError = false,
    unavailableLabel,
    colors,
    styles,
}: MetricCardProps) {
    const displayedValue = value === null ? '--' : String(value);
    const accessibilityValue = isLoading
        ? 'carregando'
        : isError
            ? 'indisponível'
            : value === null
                ? 'sem dado disponível'
                : displayedValue;

    return (
        <View
            accessible
            accessibilityLabel={`${label}: ${accessibilityValue}`}
            style={styles.card}
        >
            <View style={styles.cardHeader}>
                <Text style={styles.label}>{label}</Text>
                <View style={styles.iconContainer}>
                    <Ionicons name={icon} size={18} color={colors.primary} />
                </View>
            </View>
            {isLoading ? (
                <ActivityIndicator size="small" color={colors.primary} style={styles.loader} />
            ) : isError ? (
                <Text style={styles.errorValue}>--</Text>
            ) : (
                <Text style={styles.value}>{displayedValue}</Text>
            )}
            {isError ? (
                <Text style={styles.caption}>Indisponível</Text>
            ) : unavailableLabel ? (
                <Text style={styles.caption}>{unavailableLabel}</Text>
            ) : null}
        </View>
    );
}

function createStyles(colors: ThemeColors) {
    return StyleSheet.create({
        grid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: spacing.md,
            marginBottom: spacing.xxl,
        },
        card: {
            flexGrow: 1,
            flexBasis: '45%',
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
            flex: 1,
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
        caption: {
            marginTop: spacing.xs,
            color: colors.textSecondary,
            fontSize: 10,
            lineHeight: 14,
        },
    });
}
