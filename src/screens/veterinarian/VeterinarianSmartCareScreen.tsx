import Ionicons from '@expo/vector-icons/Ionicons';
import axios from 'axios';
import { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '../../components/AppButton';
import { SmartCareDetailsModal } from '../../components/veterinarian/SmartCareDetailsModal';
import { SmartCarePatientCard } from '../../components/veterinarian/SmartCarePatientCard';
import { useTheme } from '../../contexts/ThemeContext';
import { useSmartCareRanking } from '../../hooks/smartCare/useSmartCareRanking';
import { radii, spacing, ThemeColors, typography } from '../../theme/tokens';
import {
    SmartCareInsufficientDataPet,
    SmartCarePriority,
    SmartCareRankingItem,
} from '../../types/smartCare';

type SmartCareFilter = 'ALL' | SmartCarePriority | 'NO_DATA';

type SmartCareDisplayItem = {
    kind: 'analysis';
    item: SmartCareRankingItem;
} | {
    kind: 'insufficient';
    item: SmartCareInsufficientDataPet;
};

const FILTERS: Array<{ value: SmartCareFilter; label: string }> = [
    { value: 'ALL', label: 'Todos' },
    { value: 'ALTA', label: 'Alta' },
    { value: 'MEDIA', label: 'Média' },
    { value: 'BAIXA', label: 'Baixa' },
    { value: 'NO_DATA', label: 'Sem dados' },
];

function getRankingErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
            return 'Você não possui permissão para acessar o SmartCare.';
        }

        if (error.response?.status === 503) {
            return 'O SmartCare está temporariamente indisponível.';
        }
    }

    return 'Não foi possível carregar as análises SmartCare.';
}

function getEmptyMessage(filter: SmartCareFilter): string {
    switch (filter) {
        case 'ALTA':
            return 'Nenhum pet com prioridade alta.';
        case 'MEDIA':
            return 'Nenhum pet com prioridade média.';
        case 'BAIXA':
            return 'Nenhum pet com prioridade baixa.';
        case 'NO_DATA':
            return 'Todos os pets possuem dados suficientes para análise.';
        default:
            return 'Nenhum pet disponível para análise SmartCare.';
    }
}

export function VeterinarianSmartCareScreen() {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const [activeFilter, setActiveFilter] = useState<SmartCareFilter>('ALL');
    const [selectedAnalysis, setSelectedAnalysis] = useState<SmartCareRankingItem | null>(null);
    const ranking = useSmartCareRanking();
    const displayItems = useMemo<SmartCareDisplayItem[]>(() => {
        if (!ranking.data) {
            return [];
        }

        if (activeFilter === 'NO_DATA') {
            return ranking.data.semDadosSuficientes.map((item) => ({
                kind: 'insufficient',
                item,
            }));
        }

        const analyses = activeFilter === 'ALL'
            ? ranking.data.analises
            : ranking.data.analises.filter((item) => item.prioridade === activeFilter);
        const analysisItems: SmartCareDisplayItem[] = analyses.map((item) => ({
            kind: 'analysis',
            item,
        }));

        if (activeFilter !== 'ALL') {
            return analysisItems;
        }

        return [
            ...analysisItems,
            ...ranking.data.semDadosSuficientes.map<SmartCareDisplayItem>((item) => ({
                kind: 'insufficient',
                item,
            })),
        ];
    }, [activeFilter, ranking.data]);

    return (
        <SafeAreaView style={styles.safeArea} edges={['right', 'bottom', 'left']}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={(
                    <RefreshControl
                        refreshing={ranking.isRefetching}
                        onRefresh={() => void ranking.refetch()}
                        colors={[colors.primary]}
                        progressBackgroundColor={colors.surface}
                        tintColor={colors.primary}
                    />
                )}
            >
                <View style={styles.infoCard}>
                    <View style={styles.infoIcon}>
                        <Ionicons
                            name="information-circle-outline"
                            size={21}
                            color={colors.primary}
                        />
                    </View>
                    <Text style={styles.infoText}>
                        SmartCare analisa sinais clínicos para ajudar na priorização do acompanhamento.{' '}
                        Ele apoia profissionais veterinários e não realiza diagnósticos.
                    </Text>
                </View>

                {ranking.isPending ? (
                    <View style={styles.loadingState}>
                        <ActivityIndicator size="small" color={colors.primary} />
                        <Text style={styles.stateMessage}>Carregando prioridades clínicas...</Text>
                    </View>
                ) : ranking.isError ? (
                    <View style={[styles.stateCard, styles.errorCard]}>
                        <Ionicons name="cloud-offline-outline" size={28} color={colors.danger} />
                        <Text style={styles.stateTitle}>Não foi possível carregar</Text>
                        <Text style={styles.stateMessage}>
                            {getRankingErrorMessage(ranking.error)}
                        </Text>
                        <AppButton
                            label="Tentar novamente"
                            onPress={() => void ranking.refetch()}
                            variant="secondary"
                            size="small"
                            loading={ranking.isFetching}
                            style={styles.retryButton}
                        />
                    </View>
                ) : (
                    <>
                        <ScrollView
                            horizontal
                            nestedScrollEnabled
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.filterContent}
                            style={styles.filterScroll}
                        >
                            {FILTERS.map((filter) => {
                                const isActive = activeFilter === filter.value;

                                return (
                                    <Pressable
                                        key={filter.value}
                                        accessibilityRole="button"
                                        accessibilityState={{ selected: isActive }}
                                        onPress={() => setActiveFilter(filter.value)}
                                        style={({ pressed }) => [
                                            styles.filterChip,
                                            isActive && styles.activeFilterChip,
                                            pressed && styles.pressed,
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.filterLabel,
                                                isActive && styles.activeFilterLabel,
                                            ]}
                                        >
                                            {filter.label}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </ScrollView>

                        <View style={styles.listHeader}>
                            <View>
                                <Text style={styles.listTitle}>Prioridade clínica</Text>
                                <Text style={styles.listCount}>
                                    {displayItems.length === 1
                                        ? '1 paciente'
                                        : `${displayItems.length} pacientes`}
                                </Text>
                            </View>
                            {ranking.isFetching ? (
                                <ActivityIndicator size="small" color={colors.primary} />
                            ) : null}
                        </View>

                        {displayItems.length === 0 ? (
                            <View style={styles.stateCard}>
                                <Ionicons
                                    name="checkmark-circle-outline"
                                    size={30}
                                    color={colors.success}
                                />
                                <Text style={styles.stateMessage}>
                                    {getEmptyMessage(activeFilter)}
                                </Text>
                            </View>
                        ) : (
                            <View style={styles.patientList}>
                                {displayItems.map((displayItem) => (
                                    displayItem.kind === 'analysis' ? (
                                        <SmartCarePatientCard
                                            key={`analysis-${displayItem.item.petId}`}
                                            kind="analysis"
                                            item={displayItem.item}
                                            onPress={() => setSelectedAnalysis(displayItem.item)}
                                        />
                                    ) : (
                                        <SmartCarePatientCard
                                            key={`insufficient-${displayItem.item.petId}`}
                                            kind="insufficient"
                                            item={displayItem.item}
                                        />
                                    )
                                ))}
                            </View>
                        )}
                    </>
                )}
            </ScrollView>

            <SmartCareDetailsModal
                analysis={selectedAnalysis}
                onClose={() => setSelectedAnalysis(null)}
            />
        </SafeAreaView>
    );
}

function createStyles(colors: ThemeColors) {
    return StyleSheet.create({
        safeArea: { flex: 1, backgroundColor: colors.background },
        scroll: { flex: 1, backgroundColor: colors.background },
        content: {
            flexGrow: 1,
            width: '100%',
            maxWidth: 760,
            alignSelf: 'center',
            padding: spacing.lg,
            paddingBottom: spacing.xxxl,
        },
        infoCard: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: spacing.md,
            padding: spacing.lg,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.lg,
            backgroundColor: colors.primarySoft,
        },
        infoIcon: {
            width: 34,
            height: 34,
            flexShrink: 0,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: radii.pill,
            backgroundColor: colors.surface,
        },
        infoText: {
            flex: 1,
            color: colors.textSecondary,
            fontSize: typography.small,
            lineHeight: 18,
        },
        filterScroll: { marginHorizontal: -spacing.lg, marginTop: spacing.xl },
        filterContent: {
            gap: spacing.sm,
            paddingHorizontal: spacing.lg,
        },
        filterChip: {
            minHeight: 42,
            justifyContent: 'center',
            paddingHorizontal: spacing.lg,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.pill,
            backgroundColor: colors.surface,
        },
        activeFilterChip: {
            borderColor: colors.primary,
            backgroundColor: colors.primarySoft,
        },
        pressed: { opacity: 0.72 },
        filterLabel: {
            color: colors.textSecondary,
            fontSize: typography.caption,
            fontWeight: '700',
        },
        activeFilterLabel: { color: colors.primary, fontWeight: '800' },
        listHeader: {
            minHeight: 48,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: spacing.xl,
        },
        listTitle: { color: colors.text, fontSize: typography.heading, fontWeight: '800' },
        listCount: {
            marginTop: spacing.xs,
            color: colors.textSecondary,
            fontSize: typography.small,
        },
        patientList: { gap: spacing.md, marginTop: spacing.lg },
        loadingState: {
            minHeight: 180,
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.md,
        },
        stateCard: {
            alignItems: 'center',
            gap: spacing.sm,
            marginTop: spacing.xl,
            padding: spacing.xl,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.lg,
            backgroundColor: colors.surface,
        },
        errorCard: { borderColor: colors.errorBorder, backgroundColor: colors.errorSurface },
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
        retryButton: { marginTop: spacing.sm },
    });
}
