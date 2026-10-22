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
import { PaginationControls } from '../../components/PaginationControls';
import { usePets } from '../../hooks/pets/usePets';
import { useSmartCareAnalysis } from '../../hooks/smartCare/useSmartCareAnalysis';
import { colors, radii, shadows, spacing, typography } from '../../theme/tokens';
import { DEFAULT_PAGE_SIZE } from '../../types/pagination';
import { Pet } from '../../types/pet';
import { SmartCarePriority } from '../../types/smartCare';
import { getApiErrorMessage } from '../../utils/apiError';

function formatPriority(priority: SmartCarePriority): string {
    return priority === 'MEDIA' ? 'MÉDIA' : priority;
}

function getSmartCareErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
        switch (error.response?.status) {
            case 403:
                return 'Você não possui permissão para analisar este pet.';
            case 422:
                return 'Este pet ainda não possui dados clínicos suficientes para uma análise SmartCare.';
            case 503:
                return 'O SmartCare está temporariamente indisponível. Tente novamente mais tarde.';
        }
    }

    return getApiErrorMessage(
        error,
        'Não foi possível realizar a análise SmartCare. Tente novamente.',
    );
}

export function SmartCareScreen() {
    const [page, setPage] = useState(0);
    const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
    const [analysisPetId, setAnalysisPetId] = useState<number | null>(null);
    const pets = usePets(page, DEFAULT_PAGE_SIZE);
    const analysis = useSmartCareAnalysis(analysisPetId);

    function selectPet(pet: Pet): void {
        setSelectedPet(pet);
        setAnalysisPetId(null);
    }

    function changePage(nextPage: number): void {
        setPage(nextPage);
        setSelectedPet(null);
        setAnalysisPetId(null);
    }

    function analyzeSelectedPet(): void {
        if (!selectedPet || analysis.isFetching) {
            return;
        }

        if (analysisPetId === selectedPet.id) {
            void analysis.refetch();
            return;
        }

        setAnalysisPetId(selectedPet.id);
    }

    const hasSuccessfulAnalysis = analysisPetId !== null && analysis.isSuccess;

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

                    <View style={styles.sectionCard}>
                        <Text style={styles.sectionTitle}>Selecione o pet</Text>
                        <Text style={styles.sectionDescription}>
                            A análise utiliza os dados clínicos registrados no PetJourney.
                        </Text>

                        {pets.isPending ? (
                            <LoadingState message="Carregando pets..." />
                        ) : pets.isError ? (
                            <View style={styles.stateBox}>
                                <Text style={styles.stateTitle}>Não foi possível carregar os pets</Text>
                                <Text style={styles.stateMessage}>
                                    {getApiErrorMessage(
                                        pets.error,
                                        'Não foi possível consultar os pets disponíveis.',
                                    )}
                                </Text>
                                <AppButton
                                    label="Tentar novamente"
                                    onPress={() => void pets.refetch()}
                                    variant="secondary"
                                    size="small"
                                    style={styles.retryButton}
                                />
                            </View>
                        ) : pets.data.content.length === 0 ? (
                            <View style={styles.stateBox}>
                                <Text style={styles.stateTitle}>Nenhum pet disponível.</Text>
                                <Text style={styles.stateMessage}>
                                    Não há pets acessíveis para análise no momento.
                                </Text>
                            </View>
                        ) : (
                            <>
                                <View style={styles.petList}>
                                    {pets.data.content.map((pet) => {
                                        const isSelected = selectedPet?.id === pet.id;

                                        return (
                                            <Pressable
                                                key={pet.id}
                                                accessibilityRole="button"
                                                accessibilityLabel={`Selecionar ${pet.name}`}
                                                accessibilityState={{ selected: isSelected }}
                                                style={({ pressed }) => [
                                                    styles.petCard,
                                                    isSelected && styles.petCardSelected,
                                                    pressed && styles.petCardPressed,
                                                ]}
                                                onPress={() => selectPet(pet)}
                                            >
                                                <View style={styles.petIcon}>
                                                    <Text style={styles.petIconText}>PET</Text>
                                                </View>
                                                <View style={styles.petCopy}>
                                                    <Text style={[
                                                        styles.petName,
                                                        isSelected && styles.petNameSelected,
                                                    ]}>
                                                        {pet.name}
                                                    </Text>
                                                    <Text style={styles.petDetail}>
                                                        {pet.species}
                                                        {pet.breed ? ` • ${pet.breed}` : ''}
                                                    </Text>
                                                    {pet.tutorName ? (
                                                        <Text style={styles.petTutor}>
                                                            Tutor: {pet.tutorName}
                                                        </Text>
                                                    ) : null}
                                                </View>
                                                <Text style={styles.selectionIndicator}>
                                                    {isSelected ? 'Selecionado' : 'Selecionar'}
                                                </Text>
                                            </Pressable>
                                        );
                                    })}
                                </View>

                                <PaginationControls
                                    page={pets.data.number}
                                    totalPages={pets.data.totalPages}
                                    isFirst={pets.data.first}
                                    isLast={pets.data.last}
                                    disabled={pets.isFetching || analysis.isFetching}
                                    onPrevious={() => changePage(pets.data.number - 1)}
                                    onNext={() => changePage(pets.data.number + 1)}
                                />
                            </>
                        )}

                        <AppButton
                            label={hasSuccessfulAnalysis ? 'Analisar novamente' : 'Analisar pet'}
                            onPress={analyzeSelectedPet}
                            disabled={selectedPet === null || pets.isPending || pets.isError}
                            loading={analysis.isFetching}
                            style={styles.analyzeButton}
                        />
                    </View>

                    <View style={styles.resultSection}>
                        <Text style={styles.sectionTitle}>Resultado da análise</Text>

                        {analysisPetId === null ? (
                            <View style={styles.stateBox}>
                                <Text style={styles.stateMessage}>
                                    {selectedPet
                                        ? `Toque em “Analisar pet” para avaliar ${selectedPet.name}.`
                                        : 'Selecione um pet para iniciar a análise.'}
                                </Text>
                            </View>
                        ) : analysis.isPending ? (
                            <LoadingState message="Analisando histórico clínico..." />
                        ) : analysis.isError ? (
                            <View style={[styles.stateBox, styles.errorBox]}>
                                <Text style={styles.stateTitle}>Análise não concluída</Text>
                                <Text style={styles.stateMessage}>
                                    {getSmartCareErrorMessage(analysis.error)}
                                </Text>
                                <AppButton
                                    label="Tentar novamente"
                                    onPress={() => void analysis.refetch()}
                                    variant="secondary"
                                    size="small"
                                    style={styles.retryButton}
                                />
                            </View>
                        ) : (
                            <AnalysisResult
                                petName={selectedPet?.name ?? 'Pet selecionado'}
                                score={analysis.data.score}
                                priority={analysis.data.prioridade}
                                reasons={analysis.data.motivos}
                                recommendation={analysis.data.recomendacao}
                            />
                        )}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

interface AnalysisResultProps {
    petName: string;
    score: number;
    priority: SmartCarePriority;
    reasons: string[];
    recommendation: string;
}

function AnalysisResult({
    petName,
    score,
    priority,
    reasons,
    recommendation,
}: AnalysisResultProps) {
    return (
        <View style={styles.resultCard}>
            <Text style={styles.resultPetName}>{petName}</Text>
            <View style={styles.summaryRow}>
                <View style={styles.summaryBlock}>
                    <Text style={styles.summaryLabel}>Score</Text>
                    <Text style={styles.score}>{score} / 100</Text>
                </View>
                <View style={styles.summaryBlock}>
                    <Text style={styles.summaryLabel}>Prioridade</Text>
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
                </View>
            </View>

            <View style={styles.resultBlock}>
                <Text style={styles.resultBlockTitle}>Motivos</Text>
                {reasons.length > 0 ? reasons.map((reason, index) => (
                    <View key={`${reason}-${index}`} style={styles.reasonRow}>
                        <Text style={styles.reasonBullet}>•</Text>
                        <Text style={styles.reasonText}>{reason}</Text>
                    </View>
                )) : (
                    <Text style={styles.resultText}>
                        Nenhum fator de atenção identificado no momento.
                    </Text>
                )}
            </View>

            <View style={styles.resultBlock}>
                <Text style={styles.resultBlockTitle}>Recomendação</Text>
                <Text style={styles.resultText}>{recommendation}</Text>
            </View>
        </View>
    );
}

function LoadingState({ message }: { message: string }) {
    return (
        <View style={styles.loadingState}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.stateMessage}>{message}</Text>
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
        marginBottom: spacing.xl,
        color: colors.textSecondary,
        fontSize: typography.body,
        lineHeight: 23,
    },
    sectionCard: {
        padding: spacing.xl,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.lg,
        backgroundColor: colors.surface,
        ...shadows.card,
    },
    sectionTitle: { color: colors.text, fontSize: typography.heading, fontWeight: '800' },
    sectionDescription: {
        marginTop: spacing.xs,
        color: colors.textSecondary,
        fontSize: typography.caption,
        lineHeight: 20,
    },
    petList: { gap: spacing.md, marginTop: spacing.xl },
    petCard: {
        minHeight: 88,
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.md,
        backgroundColor: colors.background,
    },
    petCardSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
    petCardPressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
    petIcon: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: radii.md,
        backgroundColor: colors.surface,
    },
    petIconText: { color: colors.primary, fontSize: 10, fontWeight: '800' },
    petCopy: { flex: 1, marginHorizontal: spacing.md },
    petName: { color: colors.text, fontSize: typography.body, fontWeight: '800' },
    petNameSelected: { color: colors.primaryDark },
    petDetail: {
        marginTop: spacing.xs,
        color: colors.textSecondary,
        fontSize: typography.small,
    },
    petTutor: {
        marginTop: spacing.xs,
        color: colors.textSecondary,
        fontSize: typography.small,
    },
    selectionIndicator: { color: colors.primaryDark, fontSize: typography.small, fontWeight: '700' },
    analyzeButton: { marginTop: spacing.lg },
    resultSection: { marginTop: spacing.xxl },
    resultCard: {
        marginTop: spacing.xl,
        padding: spacing.xl,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.lg,
        backgroundColor: colors.surface,
        ...shadows.card,
    },
    resultPetName: { color: colors.text, fontSize: typography.heading, fontWeight: '800' },
    summaryRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.xl,
        marginTop: spacing.xl,
        paddingBottom: spacing.xl,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    summaryBlock: { flexGrow: 1, flexBasis: 140 },
    summaryLabel: {
        marginBottom: spacing.sm,
        color: colors.textSecondary,
        fontSize: typography.small,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    score: { color: colors.text, fontSize: typography.title, fontWeight: '800' },
    priorityBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radii.pill,
    },
    priorityLow: { backgroundColor: '#EAF7F0' },
    priorityMedium: { backgroundColor: '#FFF4D6' },
    priorityHigh: { backgroundColor: '#FCECEC' },
    priorityText: { fontSize: typography.caption, fontWeight: '800' },
    priorityLowText: { color: colors.success },
    priorityMediumText: { color: '#8A5A00' },
    priorityHighText: { color: colors.danger },
    resultBlock: { marginTop: spacing.xl },
    resultBlockTitle: {
        marginBottom: spacing.md,
        color: colors.text,
        fontSize: typography.body,
        fontWeight: '800',
    },
    resultText: { color: colors.textSecondary, fontSize: typography.caption, lineHeight: 21 },
    reasonRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.sm },
    reasonBullet: { marginRight: spacing.sm, color: colors.primary, fontSize: typography.body },
    reasonText: { flex: 1, color: colors.textSecondary, fontSize: typography.caption, lineHeight: 21 },
    loadingState: {
        alignItems: 'center',
        gap: spacing.md,
        marginTop: spacing.xl,
        padding: spacing.xl,
    },
    stateBox: {
        alignItems: 'center',
        marginTop: spacing.xl,
        padding: spacing.xl,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.md,
        backgroundColor: colors.background,
    },
    errorBox: { borderColor: '#F1C6C6', backgroundColor: '#FDF0F0' },
    stateTitle: {
        color: colors.text,
        fontSize: typography.caption,
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
