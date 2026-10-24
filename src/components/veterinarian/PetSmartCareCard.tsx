import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { radii, spacing, ThemeColors, typography } from '../../theme/tokens';
import { SmartCareRankingItem } from '../../types/smartCare';
import { AppButton } from '../AppButton';
import { SmartCarePriorityBadge } from './SmartCarePriorityBadge';

interface PetSmartCareCardProps {
    analysis: SmartCareRankingItem | null;
    hasInsufficientData: boolean;
    isLoading: boolean;
    isError: boolean;
    isRetrying: boolean;
    onRetry: () => void;
}

export function PetSmartCareCard({
    analysis,
    hasInsufficientData,
    isLoading,
    isError,
    isRetrying,
    onRetry,
}: PetSmartCareCardProps) {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    if (isLoading) {
        return (
            <View style={styles.stateCard}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.stateText}>Carregando análise SmartCare...</Text>
            </View>
        );
    }

    if (isError) {
        return (
            <View style={styles.stateCard}>
                <Text style={styles.stateText}>Análise SmartCare indisponível.</Text>
                <AppButton
                    label="Tentar novamente"
                    onPress={onRetry}
                    variant="secondary"
                    size="small"
                    loading={isRetrying}
                />
            </View>
        );
    }

    if (!analysis && !hasInsufficientData) {
        return (
            <View style={styles.stateCard}>
                <Text style={styles.stateText}>Análise SmartCare indisponível.</Text>
            </View>
        );
    }

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <View style={styles.brandLine}>
                    <View style={styles.brandIcon}>
                        <Ionicons name="pulse" size={20} color={colors.primary} />
                    </View>
                    <Text style={styles.title}>SMARTCARE</Text>
                </View>
                <SmartCarePriorityBadge
                    priority={analysis?.prioridade ?? 'SEM_DADOS'}
                />
            </View>

            {analysis ? (
                <View style={styles.analysisBody}>
                    <View style={styles.scoreCircle}>
                        <Text style={styles.score}>{analysis.score}</Text>
                        <Text style={styles.scoreLabel}>SCORE</Text>
                    </View>
                    <View style={styles.analysisCopy}>
                        <Text style={styles.reason}>
                            {analysis.motivos[0] ?? 'Nenhum fator de atenção identificado.'}
                        </Text>
                        {analysis.recomendacao?.trim() ? (
                            <Text style={styles.recommendation} numberOfLines={3}>
                                {analysis.recomendacao}
                            </Text>
                        ) : null}
                    </View>
                </View>
            ) : (
                <Text style={styles.insufficientText}>
                    Histórico clínico insuficiente para análise.
                </Text>
            )}

            <View style={styles.disclaimer}>
                <Ionicons
                    name="information-circle-outline"
                    size={17}
                    color={colors.textSecondary}
                />
                <Text style={styles.disclaimerText}>
                    SmartCare é uma ferramenta de apoio à decisão clínica e não substitui avaliação veterinária.
                </Text>
            </View>
        </View>
    );
}

function createStyles(colors: ThemeColors) {
    return StyleSheet.create({
        card: {
            padding: spacing.lg,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.lg,
            backgroundColor: colors.surface,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: spacing.md,
        },
        brandLine: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
        brandIcon: {
            width: 34,
            height: 34,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: radii.pill,
            backgroundColor: colors.primarySoft,
        },
        title: {
            color: colors.text,
            fontSize: typography.small,
            fontWeight: '900',
            letterSpacing: 1,
        },
        analysisBody: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.lg,
            marginTop: spacing.xl,
        },
        scoreCircle: {
            width: 78,
            height: 78,
            flexShrink: 0,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 5,
            borderColor: colors.primary,
            borderRadius: radii.pill,
            backgroundColor: colors.primarySoft,
        },
        score: { color: colors.text, fontSize: typography.title, fontWeight: '900', lineHeight: 29 },
        scoreLabel: {
            color: colors.textSecondary,
            fontSize: 9,
            fontWeight: '800',
            letterSpacing: 0.8,
        },
        analysisCopy: { flex: 1, minWidth: 0 },
        reason: { color: colors.text, fontSize: typography.body, fontWeight: '800', lineHeight: 22 },
        recommendation: {
            marginTop: spacing.sm,
            color: colors.textSecondary,
            fontSize: typography.caption,
            lineHeight: 20,
        },
        insufficientText: {
            marginTop: spacing.xl,
            color: colors.textSecondary,
            fontSize: typography.caption,
            lineHeight: 20,
        },
        disclaimer: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: spacing.sm,
            marginTop: spacing.xl,
            paddingTop: spacing.md,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: colors.border,
        },
        disclaimerText: {
            flex: 1,
            color: colors.textSecondary,
            fontSize: typography.small,
            lineHeight: 18,
        },
        stateCard: {
            minHeight: 132,
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.md,
            padding: spacing.xl,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.lg,
            backgroundColor: colors.surface,
        },
        stateText: {
            color: colors.textSecondary,
            fontSize: typography.caption,
            textAlign: 'center',
        },
    });
}
