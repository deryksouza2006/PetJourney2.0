import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '../../components/AppButton';
import { useTheme } from '../../contexts/ThemeContext';
import { usePetWeightReport } from '../../hooks/reports/usePetWeightReport';
import { radii, shadows, spacing, ThemeColors, typography } from '../../theme/tokens';
import { PetSpecies } from '../../types/pet';
import { PetWeightReportItem } from '../../types/report';
import { PET_SEX_LABELS, PET_SPECIES_LABELS } from '../../utils/petPresentation';

interface WeightGroup {
    key: string;
    species: PetSpecies | null;
    items: PetWeightReportItem[];
}

function groupWeightItems(items: PetWeightReportItem[]): WeightGroup[] {
    const groups = new Map<string, WeightGroup>();

    for (const item of items) {
        if (item.tipo === 'TOTAL') {
            continue;
        }

        const key = item.species ?? 'SEM_ESPECIE';
        const existing = groups.get(key);

        if (existing) {
            existing.items.push(item);
        } else {
            groups.set(key, {
                key,
                species: item.species,
                items: [item],
            });
        }
    }

    return [...groups.values()];
}

function formatWeight(weight: number): string {
    return `${weight.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })} kg`;
}

function getSpeciesLabel(species: PetSpecies | null): string {
    return species ? PET_SPECIES_LABELS[species] : 'Espécie não informada';
}

function getItemLabel(item: PetWeightReportItem): string {
    if (item.tipo === 'SUBTOTAL') {
        return 'Subtotal';
    }

    return item.sex ? PET_SEX_LABELS[item.sex] : 'Sexo não informado';
}

export function ClinicPetWeightReportScreen() {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const report = usePetWeightReport();
    const records = report.data ?? [];
    const groups = useMemo(() => groupWeightItems(records), [records]);
    const totals = useMemo(
        () => records.filter((item) => item.tipo === 'TOTAL'),
        [records],
    );

    return (
        <SafeAreaView style={styles.safeArea} edges={['right', 'bottom', 'left']}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.wrapper}>
                    <Text style={styles.eyebrow}>RELATÓRIO</Text>
                    <Text style={styles.title}>Resumo de Peso Atual</Text>
                    <Text style={styles.description}>
                        Pesos atuais agrupados por espécie e sexo. Os valores são exibidos conforme
                        as consolidações retornadas pelo sistema.
                    </Text>

                    {report.isPending ? (
                        <View style={styles.stateCard}>
                            <ActivityIndicator size="small" color={colors.primary} />
                            <Text style={styles.stateMessage}>Carregando relatório...</Text>
                        </View>
                    ) : report.isError ? (
                        <View style={styles.stateCard}>
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
                    ) : records.length === 0 ? (
                        <View style={styles.stateCard}>
                            <View style={styles.stateIcon}>
                                <Ionicons name="scale-outline" size={24} color={colors.primary} />
                            </View>
                            <Text style={styles.stateTitle}>Não há dados de peso disponíveis.</Text>
                        </View>
                    ) : (
                        <View style={styles.reportContent}>
                            {groups.map((group) => (
                                <View key={group.key} style={styles.speciesCard}>
                                    <View style={styles.speciesHeader}>
                                        <View style={styles.speciesIcon}>
                                            <Ionicons name="paw" size={19} color={colors.primary} />
                                        </View>
                                        <Text style={styles.speciesTitle}>
                                            {getSpeciesLabel(group.species)}
                                        </Text>
                                    </View>

                                    {group.items.map((item, index) => {
                                        const isSubtotal = item.tipo === 'SUBTOTAL';

                                        return (
                                            <View
                                                key={`${item.tipo}-${item.sex ?? 'all'}-${index}`}
                                                style={[
                                                    styles.weightRow,
                                                    index > 0 && styles.rowDivider,
                                                    isSubtotal && styles.subtotalRow,
                                                ]}
                                            >
                                                <Text style={[
                                                    styles.weightLabel,
                                                    isSubtotal && styles.subtotalText,
                                                ]}>
                                                    {getItemLabel(item)}
                                                </Text>
                                                <Text style={[
                                                    styles.weightValue,
                                                    isSubtotal && styles.subtotalText,
                                                ]}>
                                                    {formatWeight(item.pesoKg)}
                                                </Text>
                                            </View>
                                        );
                                    })}
                                </View>
                            ))}

                            {totals.map((item, index) => (
                                <View key={`total-${index}`} style={styles.totalCard}>
                                    <View>
                                        <Text style={styles.totalLabel}>TOTAL GERAL</Text>
                                        <Text style={styles.totalDescription}>
                                            Soma dos pesos atuais retornada pelo relatório
                                        </Text>
                                    </View>
                                    <Text style={styles.totalValue}>{formatWeight(item.pesoKg)}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

function createStyles(colors: ThemeColors) {
    return StyleSheet.create({
        safeArea: { flex: 1, backgroundColor: colors.background },
        scrollView: { flex: 1, backgroundColor: colors.background },
        content: {
            flexGrow: 1,
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.xl,
            paddingBottom: spacing.lg,
        },
        wrapper: { width: '100%', maxWidth: 760, alignSelf: 'center' },
        eyebrow: {
            color: colors.primary,
            fontSize: typography.small,
            fontWeight: '800',
            letterSpacing: 1.2,
        },
        title: {
            marginTop: spacing.xs,
            color: colors.text,
            fontSize: typography.title,
            fontWeight: '800',
            letterSpacing: -0.5,
        },
        description: {
            marginTop: spacing.sm,
            color: colors.textSecondary,
            fontSize: typography.caption,
            lineHeight: 20,
        },
        reportContent: { gap: spacing.lg, marginTop: spacing.xl },
        speciesCard: {
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.lg,
            backgroundColor: colors.card,
            ...shadows.card,
        },
        speciesHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.md,
            padding: spacing.lg,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: colors.border,
        },
        speciesIcon: {
            width: 38,
            height: 38,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: radii.md,
            backgroundColor: colors.primarySoft,
        },
        speciesTitle: { color: colors.text, fontSize: typography.heading, fontWeight: '800' },
        weightRow: {
            minHeight: 58,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: spacing.lg,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
        },
        rowDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
        subtotalRow: { backgroundColor: colors.primarySoft },
        weightLabel: { color: colors.textSecondary, fontSize: typography.caption },
        weightValue: { color: colors.text, fontSize: typography.body, fontWeight: '800' },
        subtotalText: { color: colors.primaryDark, fontWeight: '800' },
        totalCard: {
            minHeight: 92,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: spacing.lg,
            padding: spacing.lg,
            borderWidth: 1,
            borderColor: colors.primary,
            borderRadius: radii.lg,
            backgroundColor: colors.primarySoft,
            ...shadows.card,
        },
        totalLabel: {
            color: colors.primaryDark,
            fontSize: typography.small,
            fontWeight: '900',
            letterSpacing: 1,
        },
        totalDescription: {
            maxWidth: 220,
            marginTop: spacing.xs,
            color: colors.textSecondary,
            fontSize: typography.small,
            lineHeight: 17,
        },
        totalValue: {
            flexShrink: 0,
            color: colors.text,
            fontSize: typography.heading,
            fontWeight: '900',
        },
        stateCard: {
            minHeight: 220,
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.md,
            marginTop: spacing.xl,
            padding: spacing.xl,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.lg,
            backgroundColor: colors.surface,
        },
        stateIcon: {
            width: 48,
            height: 48,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: radii.pill,
            backgroundColor: colors.primarySoft,
        },
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
    });
}
