import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { radii, shadows, spacing, ThemeColors, typography } from '../../theme/tokens';
import { Medication } from '../../types/medication';

interface TutorMedicationSummaryProps {
    petName: string | null;
    medications: Medication[];
    isLoading: boolean;
    isError: boolean;
    onRetry: () => void;
}

const MAX_CARE_ITEMS = 2;
const MAX_MEDICATION_ITEMS = 3;
const SHORT_MONTHS = [
    'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
    'jul', 'ago', 'set', 'out', 'nov', 'dez',
] as const;

function formatShortDate(date: string): string {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(date);

    if (!match) {
        return date;
    }

    const month = SHORT_MONTHS[Number(match[2]) - 1];

    return month ? `${match[3]} ${month}` : date;
}

function getPetName(medication: Medication, fallbackName: string): string {
    return medication.petName?.trim() || fallbackName;
}

export function TutorMedicationSummary({
    petName,
    medications,
    isLoading,
    isError,
    onRetry,
}: TutorMedicationSummaryProps) {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const activeMedications = useMemo(
        () => medications.filter((medication) => medication.status === 'ATIVO'),
        [medications],
    );
    const careItems = activeMedications.slice(0, MAX_CARE_ITEMS);
    const medicationItems = activeMedications.slice(0, MAX_MEDICATION_ITEMS);

    return (
        <>
            <SectionHeading
                title="TRATAMENTOS ATIVOS"
                description="Cuidados do pet em destaque neste resumo."
                styles={styles}
            />
            <View style={styles.careCard}>
                {isLoading ? (
                    <LoadingState message="Carregando cuidados..." colors={colors} styles={styles} />
                ) : isError ? (
                    <ErrorState
                        message="Cuidados indisponíveis no momento."
                        accessibilityLabel="Tentar carregar os cuidados novamente"
                        onRetry={onRetry}
                        styles={styles}
                    />
                ) : !petName || careItems.length === 0 ? (
                    <Text style={styles.emptyText}>Nenhum cuidado medicamentoso ativo.</Text>
                ) : careItems.map((medication, index) => (
                    <View
                        key={medication.id}
                        accessible
                        accessibilityLabel={`${medication.name}, ${medication.frequency}, status ativo`}
                        style={[styles.careRow, index > 0 && styles.rowSeparator]}
                    >
                        <View style={styles.statusIndicator}>
                            <View style={styles.statusIndicatorDot} />
                        </View>
                        <View style={styles.careCopy}>
                            <Text style={styles.careName}>{medication.name}</Text>
                            <Text style={styles.careDetail}>
                                {getPetName(medication, petName)} • {medication.frequency}
                            </Text>
                        </View>
                        <View style={styles.activeBadge}>
                            <Text style={styles.activeBadgeText}>ATIVO</Text>
                        </View>
                    </View>
                ))}
            </View>

            <SectionHeading
                title="MEDICAMENTOS"
                description="Medicamentos do pet em destaque neste resumo."
                styles={styles}
            />
            <View style={styles.medicationCard}>
                {isLoading ? (
                    <LoadingState message="Carregando medicamentos..." colors={colors} styles={styles} />
                ) : isError ? (
                    <ErrorState
                        message="Medicamentos indisponíveis no momento."
                        accessibilityLabel="Tentar carregar os medicamentos novamente"
                        onRetry={onRetry}
                        styles={styles}
                    />
                ) : !petName || medicationItems.length === 0 ? (
                    <Text style={styles.emptyText}>Nenhum medicamento ativo.</Text>
                ) : medicationItems.map((medication, index) => (
                    <View
                        key={medication.id}
                        accessible
                        accessibilityLabel={`${medication.name}, dose ${medication.dosage}, ${medication.frequency}, ${medication.endDate ? `até ${formatShortDate(medication.endDate)}` : 'em curso'}`}
                        style={[styles.medicationRow, index > 0 && styles.rowSeparator]}
                    >
                        <View style={styles.medicationIcon}>
                            <Ionicons name="medkit" size={19} color={colors.primary} />
                        </View>
                        <View style={styles.medicationCopy}>
                            <Text style={styles.medicationName}>{medication.name}</Text>
                            <Text style={styles.medicationDetail} numberOfLines={2}>
                                {getPetName(medication, petName)} • {medication.frequency}
                            </Text>
                            <Text style={styles.medicationDosage} numberOfLines={1}>
                                Dose: {medication.dosage}
                            </Text>
                        </View>
                        <Text style={styles.medicationEnd}>
                            {medication.endDate
                                ? `até ${formatShortDate(medication.endDate)}`
                                : 'Em curso'}
                        </Text>
                    </View>
                ))}
            </View>
        </>
    );
}

type Styles = ReturnType<typeof createStyles>;

function SectionHeading({
    title,
    description,
    styles,
}: { title: string; description: string; styles: Styles }) {
    return (
        <View style={styles.heading}>
            <Text style={styles.headingTitle}>{title}</Text>
            <Text style={styles.headingDescription}>{description}</Text>
        </View>
    );
}

function LoadingState({
    message,
    colors,
    styles,
}: { message: string; colors: ThemeColors; styles: Styles }) {
    return (
        <View style={styles.loading}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingText}>{message}</Text>
        </View>
    );
}

function ErrorState({
    message,
    accessibilityLabel,
    onRetry,
    styles,
}: {
    message: string;
    accessibilityLabel: string;
    onRetry: () => void;
    styles: Styles;
}) {
    return (
        <View style={styles.state}>
            <Text style={styles.errorText}>{message}</Text>
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={accessibilityLabel}
                style={({ pressed }) => [styles.retry, pressed && styles.pressed]}
                onPress={onRetry}
            >
                <Text style={styles.retryText}>Tentar novamente</Text>
            </Pressable>
        </View>
    );
}

function createStyles(colors: ThemeColors) {
    return StyleSheet.create({
        heading: { marginBottom: spacing.md },
        headingTitle: {
            color: colors.text,
            fontSize: typography.small,
            fontWeight: '800',
            letterSpacing: 1.2,
        },
        headingDescription: {
            marginTop: spacing.xs,
            color: colors.textSecondary,
            fontSize: typography.small,
            lineHeight: 18,
        },
        loading: {
            minHeight: 84,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.sm,
        },
        loadingText: { color: colors.textSecondary, fontSize: typography.caption },
        state: { minHeight: 96, alignItems: 'center', justifyContent: 'center' },
        errorText: { color: colors.danger, fontSize: typography.caption, textAlign: 'center' },
        retry: {
            minHeight: 44,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: spacing.sm,
            paddingHorizontal: spacing.lg,
            borderWidth: 1,
            borderColor: colors.primary,
            borderRadius: radii.md,
            backgroundColor: colors.primarySoft,
        },
        retryText: { color: colors.primary, fontSize: typography.caption, fontWeight: '800' },
        pressed: { opacity: 0.7 },
        emptyText: {
            paddingVertical: spacing.lg,
            color: colors.textSecondary,
            fontSize: typography.caption,
            lineHeight: 20,
            textAlign: 'center',
        },
        careCard: {
            marginBottom: spacing.xxl,
            paddingHorizontal: spacing.lg,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.lg,
            backgroundColor: colors.card,
        },
        careRow: {
            minHeight: 72,
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: spacing.md,
        },
        rowSeparator: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
        statusIndicator: {
            width: 24,
            height: 24,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
            borderColor: colors.success,
            borderRadius: radii.pill,
        },
        statusIndicatorDot: {
            width: 8,
            height: 8,
            borderRadius: radii.pill,
            backgroundColor: colors.success,
        },
        careCopy: { flex: 1, marginHorizontal: spacing.md },
        careName: { color: colors.text, fontSize: typography.caption, fontWeight: '800' },
        careDetail: {
            marginTop: spacing.xs,
            color: colors.textSecondary,
            fontSize: typography.small,
            lineHeight: 17,
        },
        activeBadge: {
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs,
            borderRadius: radii.pill,
            backgroundColor: colors.successSurface,
        },
        activeBadgeText: { color: colors.success, fontSize: 10, fontWeight: '800' },
        medicationCard: {
            overflow: 'hidden',
            paddingHorizontal: spacing.lg,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.lg,
            backgroundColor: colors.card,
            ...shadows.card,
        },
        medicationRow: {
            minHeight: 88,
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: spacing.md,
        },
        medicationIcon: {
            width: 38,
            height: 38,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: radii.md,
            backgroundColor: colors.primarySoft,
        },
        medicationCopy: { flex: 1, marginHorizontal: spacing.md },
        medicationName: { color: colors.text, fontSize: typography.caption, fontWeight: '800' },
        medicationDetail: {
            marginTop: spacing.xs,
            color: colors.textSecondary,
            fontSize: typography.small,
            lineHeight: 16,
        },
        medicationDosage: {
            marginTop: spacing.xs,
            color: colors.textSecondary,
            fontSize: 10,
        },
        medicationEnd: {
            maxWidth: 72,
            color: colors.primaryDark,
            fontSize: typography.small,
            fontWeight: '700',
            textAlign: 'right',
        },
    });
}
