import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { radii, spacing, ThemeColors, typography } from '../../theme/tokens';
import { SmartCarePriority, SmartCareRankingItem } from '../../types/smartCare';

interface ClinicSmartCareSummaryProps {
    alerts: SmartCareRankingItem[];
    isLoading: boolean;
    isError: boolean;
    onRetry: () => void;
    onOpenSmartCare: () => void;
}

function formatPriority(priority: SmartCarePriority): string {
    return priority === 'MEDIA' ? 'MÉDIA' : priority;
}

export function ClinicSmartCareSummary({
    alerts,
    isLoading,
    isError,
    onRetry,
    onOpenSmartCare,
}: ClinicSmartCareSummaryProps) {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const visibleAlerts = alerts.slice(0, 3);

    return (
        <View>
            <View style={styles.heading}>
                <View style={styles.headingIcon}>
                    <Ionicons name="pulse" size={19} color={colors.primary} />
                </View>
                <Text style={styles.headingText}>ALERTAS SMARTCARE</Text>
            </View>

            {isLoading ? (
                <View style={styles.stateCard}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={styles.stateText}>Carregando alertas...</Text>
                </View>
            ) : isError ? (
                <View style={styles.stateCard}>
                    <Text style={styles.errorText}>SmartCare indisponível no momento.</Text>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Tentar carregar os alertas SmartCare novamente"
                        style={({ pressed }) => [styles.retry, pressed && styles.pressed]}
                        onPress={onRetry}
                    >
                        <Text style={styles.retryText}>Tentar novamente</Text>
                    </Pressable>
                </View>
            ) : visibleAlerts.length === 0 ? (
                <View style={styles.positiveCard}>
                    <Ionicons name="checkmark-circle" size={22} color={colors.success} />
                    <Text style={styles.positiveText}>
                        Nenhum paciente com prioridade elevada no momento.
                    </Text>
                </View>
            ) : (
                <View style={styles.listCard}>
                    {visibleAlerts.map((alert, index) => (
                        <Pressable
                            key={alert.petId}
                            accessibilityRole="button"
                            accessibilityLabel={`Abrir SmartCare de ${alert.petName}, prioridade ${formatPriority(alert.prioridade)}, score ${alert.score}`}
                            style={({ pressed }) => [
                                styles.alertRow,
                                index > 0 && styles.rowSeparator,
                                pressed && styles.rowPressed,
                            ]}
                            onPress={onOpenSmartCare}
                        >
                            <View style={styles.petIcon}>
                                <Ionicons name="paw" size={18} color={colors.primary} />
                            </View>
                            <View style={styles.alertCopy}>
                                <View style={styles.alertTitleRow}>
                                    <Text style={styles.petName}>{alert.petName}</Text>
                                    <View style={[
                                        styles.priorityBadge,
                                        alert.prioridade === 'ALTA'
                                            ? styles.highPriorityBadge
                                            : styles.mediumPriorityBadge,
                                    ]}>
                                        <Text style={[
                                            styles.priorityText,
                                            alert.prioridade === 'ALTA'
                                                ? styles.highPriorityText
                                                : styles.mediumPriorityText,
                                        ]}>
                                            {formatPriority(alert.prioridade)}
                                        </Text>
                                    </View>
                                </View>
                                {alert.motivos[0] ? (
                                    <Text style={styles.reason} numberOfLines={2}>
                                        {alert.motivos[0]}
                                    </Text>
                                ) : null}
                            </View>
                            <View style={styles.scoreBlock}>
                                <Text style={styles.score}>{alert.score}</Text>
                                <Text style={styles.scoreLabel}>SCORE</Text>
                            </View>
                        </Pressable>
                    ))}
                </View>
            )}

            {!isError ? (
                <Text style={styles.disclaimer}>
                    SmartCare é um apoio à decisão clínica e não substitui avaliação profissional.
                </Text>
            ) : null}
        </View>
    );
}

function createStyles(colors: ThemeColors) {
    return StyleSheet.create({
        heading: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
        headingIcon: {
            width: 34,
            height: 34,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: spacing.sm,
            borderRadius: radii.md,
            backgroundColor: colors.primarySoft,
        },
        headingText: {
            color: colors.text,
            fontSize: typography.small,
            fontWeight: '800',
            letterSpacing: 1.2,
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
        stateText: { color: colors.textSecondary, fontSize: typography.caption },
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
        positiveCard: {
            minHeight: 84,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.md,
            padding: spacing.lg,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.lg,
            backgroundColor: colors.successSurface,
        },
        positiveText: {
            flex: 1,
            color: colors.text,
            fontSize: typography.caption,
            lineHeight: 20,
        },
        listCard: {
            overflow: 'hidden',
            paddingHorizontal: spacing.lg,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.lg,
            backgroundColor: colors.card,
        },
        alertRow: {
            minHeight: 86,
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: spacing.md,
        },
        rowSeparator: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
        rowPressed: { opacity: 0.7 },
        petIcon: {
            width: 38,
            height: 38,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: radii.pill,
            backgroundColor: colors.primarySoft,
        },
        alertCopy: { flex: 1, marginHorizontal: spacing.md },
        alertTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
        petName: { flexShrink: 1, color: colors.text, fontSize: typography.caption, fontWeight: '800' },
        priorityBadge: {
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs,
            borderRadius: radii.pill,
        },
        highPriorityBadge: { backgroundColor: colors.errorSurface },
        mediumPriorityBadge: { backgroundColor: colors.warningSurface },
        priorityText: { fontSize: 10, fontWeight: '800' },
        highPriorityText: { color: colors.danger },
        mediumPriorityText: { color: colors.warningText },
        reason: {
            marginTop: spacing.xs,
            color: colors.textSecondary,
            fontSize: typography.small,
            lineHeight: 17,
        },
        scoreBlock: { alignItems: 'flex-end' },
        score: { color: colors.text, fontSize: typography.heading, fontWeight: '800' },
        scoreLabel: {
            marginTop: spacing.xs,
            color: colors.textSecondary,
            fontSize: 9,
            fontWeight: '700',
        },
        disclaimer: {
            marginTop: spacing.md,
            color: colors.textSecondary,
            fontSize: typography.small,
            lineHeight: 17,
        },
    });
}
