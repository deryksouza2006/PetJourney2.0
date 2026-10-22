import axios from 'axios';
import { useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '../../components/AppButton';
import { useSmartCareRanking } from '../../hooks/smartCare/useSmartCareRanking';
import { colors, radii, shadows, spacing, typography } from '../../theme/tokens';
import {
    SmartCareInsufficientDataPet,
    SmartCarePriority,
    SmartCareRankingItem,
} from '../../types/smartCare';

function formatPriority(priority: SmartCarePriority): string {
    return priority === 'MEDIA' ? 'MÉDIA' : priority;
}

function getRankingErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
            return 'Você não possui permissão para acessar o SmartCare.';
        }

        if (error.response?.status === 503) {
            return 'O SmartCare está temporariamente indisponível. Tente novamente mais tarde.';
        }
    }

    return 'Não foi possível carregar as análises SmartCare.';
}

export function SmartCareScreen() {
    const [expandedPetId, setExpandedPetId] = useState<number | null>(null);
    const ranking = useSmartCareRanking();

    function toggleAnalysis(petId: number): void {
        setExpandedPetId((currentPetId) => currentPetId === petId ? null : petId);
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['right', 'bottom', 'left']}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.wrapper}>
                    <Text style={styles.eyebrow}>ACOMPANHAMENTO</Text>
                    <Text style={styles.title}>SmartCare</Text>
                    <Text style={styles.description}>
                        Priorize o acompanhamento dos pets com base no histórico clínico.
                    </Text>

                    {ranking.isPending ? (
                        <LoadingState />
                    ) : ranking.isError ? (
                        <ErrorState
                            message={getRankingErrorMessage(ranking.error)}
                            isRetrying={ranking.isFetching}
                            onRetry={() => void ranking.refetch()}
                        />
                    ) : (
                        <>
                            <View style={styles.sectionHeading}>
                                <View style={styles.sectionHeadingCopy}>
                                    <Text style={styles.sectionTitle}>
                                        Prioridade de acompanhamento
                                    </Text>
                                    <Text style={styles.sectionDescription}>
                                        Fila priorizada conforme os dados clínicos disponíveis.
                                    </Text>
                                </View>
                                <AppButton
                                    label="Atualizar"
                                    onPress={() => void ranking.refetch()}
                                    variant="secondary"
                                    size="small"
                                    loading={ranking.isFetching}
                                    style={styles.refreshButton}
                                />
                            </View>

                            {ranking.data.analises.length === 0
                                && ranking.data.semDadosSuficientes.length === 0 ? (
                                    <View style={styles.stateCard}>
                                        <Text style={styles.stateTitle}>
                                            Nenhum pet disponível para análise SmartCare.
                                        </Text>
                                    </View>
                                ) : null}

                            {ranking.data.analises.length > 0 ? (
                                <View style={styles.rankingList}>
                                    {ranking.data.analises.map((item) => (
                                        <RankingCard
                                            key={item.petId}
                                            item={item}
                                            isExpanded={expandedPetId === item.petId}
                                            onPress={() => toggleAnalysis(item.petId)}
                                        />
                                    ))}
                                </View>
                            ) : null}

                            {ranking.data.semDadosSuficientes.length > 0 ? (
                                <InsufficientDataSection
                                    pets={ranking.data.semDadosSuficientes}
                                />
                            ) : null}
                        </>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

interface RankingCardProps {
    item: SmartCareRankingItem;
    isExpanded: boolean;
    onPress: () => void;
}

function RankingCard({ item, isExpanded, onPress }: RankingCardProps) {
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${isExpanded ? 'Ocultar' : 'Ver'} análise de ${item.petName}`}
            accessibilityState={{ expanded: isExpanded }}
            style={({ pressed }) => [
                styles.rankingCard,
                isExpanded && styles.rankingCardExpanded,
                pressed && styles.cardPressed,
            ]}
            onPress={onPress}
        >
            <View style={styles.cardHeader}>
                <View style={styles.petIcon}>
                    <Text style={styles.petIconText}>PET</Text>
                </View>
                <View style={styles.cardHeaderCopy}>
                    <Text style={styles.petName}>{item.petName}</Text>
                    <Text style={styles.score}>{item.score} / 100</Text>
                </View>
                <PriorityBadge priority={item.prioridade} />
            </View>

            <View style={styles.cardActionRow}>
                <Text style={styles.cardActionText}>
                    {isExpanded ? 'Ocultar análise' : 'Ver análise'}
                </Text>
                <Text style={styles.cardActionIcon} accessibilityElementsHidden>
                    {isExpanded ? '⌃' : '⌄'}
                </Text>
            </View>

            {isExpanded ? (
                <View style={styles.details}>
                    <View style={styles.detailSummary}>
                        <View style={styles.summaryBlock}>
                            <Text style={styles.summaryLabel}>Score</Text>
                            <Text style={styles.detailScore}>{item.score} / 100</Text>
                        </View>
                        <View style={styles.summaryBlock}>
                            <Text style={styles.summaryLabel}>Prioridade</Text>
                            <Text style={styles.priorityDetailText}>
                                {formatPriority(item.prioridade)}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.detailBlock}>
                        <Text style={styles.detailTitle}>Motivos</Text>
                        {item.motivos.length > 0 ? item.motivos.map((reason, index) => (
                            <View key={`${reason}-${index}`} style={styles.reasonRow}>
                                <Text style={styles.reasonBullet}>•</Text>
                                <Text style={styles.detailText}>{reason}</Text>
                            </View>
                        )) : (
                            <Text style={styles.detailText}>
                                Nenhum fator de atenção identificado no momento.
                            </Text>
                        )}
                    </View>

                    <View style={styles.detailBlock}>
                        <Text style={styles.detailTitle}>Recomendação</Text>
                        <Text style={styles.detailText}>{item.recomendacao}</Text>
                    </View>
                </View>
            ) : null}
        </Pressable>
    );
}

function PriorityBadge({ priority }: { priority: SmartCarePriority }) {
    return (
        <View style={[
            styles.priorityBadge,
            priority === 'BAIXA' && styles.priorityLow,
            priority === 'MEDIA' && styles.priorityMedium,
            priority === 'ALTA' && styles.priorityHigh,
        ]}>
            <Text style={[
                styles.priorityText,
                priority === 'BAIXA' && styles.priorityLowText,
                priority === 'MEDIA' && styles.priorityMediumText,
                priority === 'ALTA' && styles.priorityHighText,
            ]}>
                {formatPriority(priority)}
            </Text>
        </View>
    );
}

function InsufficientDataSection({ pets }: { pets: SmartCareInsufficientDataPet[] }) {
    return (
        <View style={styles.insufficientSection}>
            <Text style={styles.sectionTitle}>Sem dados suficientes</Text>
            <Text style={styles.sectionDescription}>
                Pets que ainda precisam de histórico clínico para serem analisados.
            </Text>
            <View style={styles.insufficientList}>
                {pets.map((pet) => (
                    <View key={pet.petId} style={styles.insufficientCard}>
                        <Text style={styles.insufficientPetName}>{pet.petName}</Text>
                        <Text style={styles.insufficientMessage}>
                            Este pet ainda não possui histórico clínico suficiente para uma análise SmartCare.
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

function LoadingState() {
    return (
        <View style={styles.loadingState}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.stateMessage}>Carregando análises SmartCare...</Text>
        </View>
    );
}

interface ErrorStateProps {
    message: string;
    isRetrying: boolean;
    onRetry: () => void;
}

function ErrorState({ message, isRetrying, onRetry }: ErrorStateProps) {
    return (
        <View style={[styles.stateCard, styles.errorCard]}>
            <Text style={styles.stateTitle}>Não foi possível carregar</Text>
            <Text style={styles.stateMessage}>{message}</Text>
            <AppButton
                label="Tentar novamente"
                onPress={onRetry}
                variant="secondary"
                size="small"
                loading={isRetrying}
                style={styles.retryButton}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    scrollView: { flex: 1, backgroundColor: colors.background },
    content: { flexGrow: 1, padding: spacing.xl, paddingBottom: spacing.xxxl },
    wrapper: { width: '100%', maxWidth: 760, alignSelf: 'center' },
    eyebrow: {
        marginBottom: spacing.sm,
        color: colors.primary,
        fontSize: typography.small,
        fontWeight: '800',
        letterSpacing: 1.4,
    },
    title: {
        color: colors.text,
        fontSize: typography.title,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    description: {
        marginTop: spacing.sm,
        marginBottom: spacing.xxl,
        color: colors.textSecondary,
        fontSize: typography.body,
        lineHeight: 23,
    },
    sectionHeading: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing.lg,
    },
    sectionHeadingCopy: { flex: 1, minWidth: 220 },
    sectionTitle: { color: colors.text, fontSize: typography.heading, fontWeight: '800' },
    sectionDescription: {
        marginTop: spacing.xs,
        color: colors.textSecondary,
        fontSize: typography.caption,
        lineHeight: 20,
    },
    refreshButton: { minWidth: 110 },
    rankingList: { gap: spacing.lg, marginTop: spacing.xl },
    rankingCard: {
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.lg,
        backgroundColor: colors.surface,
        ...shadows.card,
    },
    rankingCardExpanded: { borderColor: colors.primary },
    cardPressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    petIcon: {
        width: 46,
        height: 46,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: radii.md,
        backgroundColor: colors.primarySoft,
    },
    petIconText: { color: colors.primary, fontSize: 10, fontWeight: '800' },
    cardHeaderCopy: { flex: 1 },
    petName: { color: colors.text, fontSize: typography.heading, fontWeight: '800' },
    score: {
        marginTop: spacing.xs,
        color: colors.textSecondary,
        fontSize: typography.caption,
        fontWeight: '700',
    },
    priorityBadge: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radii.pill,
    },
    priorityLow: { backgroundColor: '#EAF7F0' },
    priorityMedium: { backgroundColor: '#FFF4D6' },
    priorityHigh: { backgroundColor: '#FCECEC' },
    priorityText: { fontSize: typography.small, fontWeight: '800' },
    priorityLowText: { color: colors.success },
    priorityMediumText: { color: '#8A5A00' },
    priorityHighText: { color: colors.danger },
    cardActionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: spacing.xs,
        marginTop: spacing.lg,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    cardActionText: { color: colors.primary, fontSize: typography.caption, fontWeight: '700' },
    cardActionIcon: { color: colors.primary, fontSize: typography.body, fontWeight: '800' },
    details: {
        marginTop: spacing.lg,
        paddingTop: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    detailSummary: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xl },
    summaryBlock: { flexGrow: 1, flexBasis: 130 },
    summaryLabel: {
        marginBottom: spacing.xs,
        color: colors.textSecondary,
        fontSize: typography.small,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    detailScore: { color: colors.text, fontSize: typography.body, fontWeight: '800' },
    priorityDetailText: { color: colors.text, fontSize: typography.body, fontWeight: '800' },
    detailBlock: { marginTop: spacing.xl },
    detailTitle: {
        marginBottom: spacing.md,
        color: colors.text,
        fontSize: typography.body,
        fontWeight: '800',
    },
    detailText: { flex: 1, color: colors.textSecondary, fontSize: typography.caption, lineHeight: 21 },
    reasonRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.sm },
    reasonBullet: { marginRight: spacing.sm, color: colors.primary, fontSize: typography.body },
    insufficientSection: { marginTop: spacing.xxxl },
    insufficientList: { gap: spacing.md, marginTop: spacing.xl },
    insufficientCard: {
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.md,
        backgroundColor: colors.surface,
    },
    insufficientPetName: { color: colors.text, fontSize: typography.body, fontWeight: '800' },
    insufficientMessage: {
        marginTop: spacing.sm,
        color: colors.textSecondary,
        fontSize: typography.caption,
        lineHeight: 20,
    },
    loadingState: {
        minHeight: 240,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.md,
        padding: spacing.xl,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.lg,
        backgroundColor: colors.surface,
    },
    stateCard: {
        alignItems: 'center',
        marginTop: spacing.xl,
        padding: spacing.xl,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.lg,
        backgroundColor: colors.surface,
    },
    errorCard: { marginTop: 0, borderColor: '#F1C6C6', backgroundColor: '#FDF0F0' },
    stateTitle: {
        color: colors.text,
        fontSize: typography.body,
        fontWeight: '800',
        textAlign: 'center',
    },
    stateMessage: {
        color: colors.textSecondary,
        fontSize: typography.caption,
        lineHeight: 20,
        textAlign: 'center',
    },
    retryButton: { marginTop: spacing.lg },
});
