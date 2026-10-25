import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '../../components/AppButton';
import { usePetWeightReport } from '../../hooks/reports/usePetWeightReport';
import { colors, createThemedStyles, radii, spacing, typography } from '../../theme/tokens';
import { PetSpecies } from '../../types/pet';
import { PetWeightReportItem } from '../../types/report';
import { PET_SEX_LABELS, PET_SPECIES_LABELS } from '../../utils/petPresentation';

interface SpeciesFilter {
    value: PetSpecies | null;
    label: string;
}

const SPECIES_FILTERS: SpeciesFilter[] = [
    { value: null, label: 'Todos' },
    { value: 'CACHORRO', label: 'Cães' },
    { value: 'GATO', label: 'Gatos' },
    { value: 'AVE', label: 'Aves' },
    { value: 'ROEDOR', label: 'Roedores' },
    { value: 'REPTIL', label: 'Répteis' },
    { value: 'OUTRO', label: 'Outros' },
];

function getItemTitle(item: PetWeightReportItem): string {
    if (item.tipo === 'TOTAL') {
        return 'Peso total';
    }

    const species = item.species ? PET_SPECIES_LABELS[item.species] : 'Todas as espécies';

    if (item.tipo === 'SUBTOTAL') {
        return `Subtotal · ${species}`;
    }

    const sex = item.sex ? PET_SEX_LABELS[item.sex] : null;
    return sex ? `${species} · ${sex}` : species;
}

function getTypeLabel(item: PetWeightReportItem): string {
    if (item.tipo === 'TOTAL') {
        return 'TOTAL DO RELATÓRIO';
    }

    return item.tipo === 'SUBTOTAL' ? 'SUBTOTAL' : 'POR SEXO';
}

function formatWeight(weight: number): string {
    return `${weight.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} kg`;
}

export function ClinicPetWeightReportScreen() {
    const [species, setSpecies] = useState<PetSpecies | null>(null);
    const report = usePetWeightReport(species);

    function renderItem({ item }: { item: PetWeightReportItem }) {
        const isSummary = item.tipo !== 'DETALHE';

        return (
            <View style={[styles.row, isSummary && styles.summaryRow]}>
                <View style={styles.rowIcon}>
                    <Ionicons name="scale-outline" size={20} color={colors.primary} />
                </View>
                <View style={styles.rowCopy}>
                    <Text style={styles.typeLabel}>{getTypeLabel(item)}</Text>
                    <Text style={styles.rowTitle}>{getItemTitle(item)}</Text>
                </View>
                <Text style={styles.weight}>{formatWeight(item.pesoKg)}</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['right', 'bottom', 'left']}>
            <View style={styles.container}>
                <View style={styles.heading}>
                    <Text style={styles.eyebrow}>PESO ATUAL</Text>
                    <Text style={styles.title}>Resumo de Peso Atual</Text>
                    <Text style={styles.description}>
                        Peso atual consolidado por espécie e sexo. Os valores representam a soma
                        dos pesos atuais dos pets em cada grupo.
                    </Text>
                </View>

                <ScrollView
                    horizontal
                    style={styles.filterScroll}
                    contentContainerStyle={styles.filters}
                    showsHorizontalScrollIndicator={false}
                >
                    {SPECIES_FILTERS.map((filter) => {
                        const isSelected = species === filter.value;

                        return (
                            <Pressable
                                key={filter.label}
                                accessibilityRole="button"
                                accessibilityState={{ selected: isSelected }}
                                style={({ pressed }) => [
                                    styles.filterChip,
                                    isSelected && styles.filterChipSelected,
                                    pressed && styles.pressed,
                                ]}
                                onPress={() => setSpecies(filter.value)}
                            >
                                <Text
                                    style={[
                                        styles.filterText,
                                        isSelected && styles.filterTextSelected,
                                    ]}
                                >
                                    {filter.label}
                                </Text>
                            </Pressable>
                        );
                    })}
                </ScrollView>

                {report.isPending ? (
                    <View style={styles.centeredState}>
                        <ActivityIndicator size="small" color={colors.primary} />
                        <Text style={styles.stateMessage}>Carregando relatório...</Text>
                    </View>
                ) : report.isError ? (
                    <View style={styles.centeredState}>
                        <View style={styles.stateIcon}>
                            <Ionicons name="alert-circle-outline" size={24} color={colors.danger} />
                        </View>
                        <Text style={styles.stateTitle}>Não foi possível carregar o relatório.</Text>
                        <Text style={styles.stateMessage}>Tente novamente em alguns instantes.</Text>
                        <AppButton
                            label="Tentar novamente"
                            variant="secondary"
                            size="small"
                            onPress={() => void report.refetch()}
                        />
                    </View>
                ) : (
                    <FlatList
                        style={styles.listSurface}
                        data={report.data}
                        keyExtractor={(item, index) => (
                            `${item.tipo}-${item.species ?? 'all'}-${item.sex ?? 'all'}-${index}`
                        )}
                        renderItem={renderItem}
                        ItemSeparatorComponent={() => <View style={styles.divider} />}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={report.data.length === 0
                            ? styles.emptyListContent
                            : undefined}
                        ListEmptyComponent={(
                            <View style={styles.emptyState}>
                                <View style={styles.stateIcon}>
                                    <Ionicons name="scale-outline" size={24} color={colors.primary} />
                                </View>
                                <Text style={styles.stateTitle}>
                                    Nenhum peso cadastrado para este filtro.
                                </Text>
                            </View>
                        )}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = createThemedStyles((themeColors) => ({
    safeArea: { flex: 1, backgroundColor: themeColors.background },
    container: {
        flex: 1,
        width: '100%',
        maxWidth: 760,
        alignSelf: 'center',
        paddingHorizontal: spacing.lg,
        backgroundColor: themeColors.background,
    },
    heading: { paddingTop: spacing.xl, paddingBottom: spacing.lg },
    eyebrow: {
        color: themeColors.primary,
        fontSize: typography.small,
        fontWeight: '800',
        letterSpacing: 1.2,
    },
    title: {
        marginTop: spacing.xs,
        color: themeColors.text,
        fontSize: typography.title,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    description: {
        marginTop: spacing.xs,
        color: themeColors.textSecondary,
        fontSize: typography.caption,
        lineHeight: 20,
    },
    filterScroll: {
        flexGrow: 0,
        marginBottom: spacing.lg,
    },
    filters: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        paddingRight: spacing.lg,
    },
    filterChip: {
        height: 40,
        flexShrink: 0,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.lg,
        borderWidth: 1,
        borderColor: themeColors.border,
        borderRadius: radii.pill,
        backgroundColor: themeColors.surface,
    },
    filterChipSelected: {
        borderColor: themeColors.primary,
        backgroundColor: themeColors.primarySoft,
    },
    filterText: {
        color: themeColors.textSecondary,
        fontSize: typography.caption,
        fontWeight: '700',
    },
    filterTextSelected: { color: themeColors.primaryDark },
    pressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
    listSurface: {
        flex: 1,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: themeColors.border,
        borderRadius: radii.lg,
        backgroundColor: themeColors.surface,
    },
    row: {
        minHeight: 78,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    summaryRow: { backgroundColor: themeColors.primarySoft },
    rowIcon: {
        width: 40,
        height: 40,
        flexShrink: 0,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: radii.md,
        backgroundColor: themeColors.primarySoft,
    },
    rowCopy: { minWidth: 0, flex: 1 },
    typeLabel: {
        color: themeColors.textSecondary,
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 0.7,
    },
    rowTitle: {
        marginTop: spacing.xs,
        color: themeColors.text,
        fontSize: typography.caption,
        fontWeight: '800',
        lineHeight: 20,
    },
    weight: {
        flexShrink: 0,
        color: themeColors.text,
        fontSize: typography.caption,
        fontWeight: '800',
    },
    divider: { height: StyleSheet.hairlineWidth, backgroundColor: themeColors.border },
    emptyListContent: { flexGrow: 1 },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.md,
        padding: spacing.xl,
    },
    centeredState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.md,
        padding: spacing.xl,
        borderWidth: 1,
        borderColor: themeColors.border,
        borderRadius: radii.lg,
        backgroundColor: themeColors.surface,
    },
    stateIcon: {
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: radii.pill,
        backgroundColor: themeColors.primarySoft,
    },
    stateTitle: {
        color: themeColors.text,
        fontSize: typography.body,
        fontWeight: '800',
        lineHeight: 22,
        textAlign: 'center',
    },
    stateMessage: {
        color: themeColors.textSecondary,
        fontSize: typography.caption,
        lineHeight: 20,
        textAlign: 'center',
    },
}));
