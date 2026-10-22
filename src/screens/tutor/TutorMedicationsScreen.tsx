import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '../../components/AppButton';
import { PaginationControls } from '../../components/PaginationControls';
import { TutorPetSelector } from '../../components/TutorPetSelector';
import { useMedicationsByPet } from '../../hooks/medications/useMedicationsByPet';
import { usePets } from '../../hooks/pets/usePets';
import { TutorStackParamList } from '../../navigation/TutorNavigator';
import { colors, radii, shadows, spacing, typography } from '../../theme/tokens';
import { Medication, MedicationStatus } from '../../types/medication';
import { DEFAULT_PAGE_SIZE } from '../../types/pagination';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatLocalDate } from '../../utils/dateTimeFormatting';

type Props = NativeStackScreenProps<TutorStackParamList, 'TutorMedications'>;

function formatStatus(status: MedicationStatus): string {
    return status.charAt(0) + status.slice(1).toLocaleLowerCase('pt-BR');
}

export function TutorMedicationsScreen(_props: Props) {
    const [selectedPetId, setSelectedPetId] = useState<number | null>(null);
    const [page, setPage] = useState(0);
    const pets = usePets(0, 100);
    const medications = useMedicationsByPet(selectedPetId, page, DEFAULT_PAGE_SIZE);

    function selectPet(petId: number): void {
        setSelectedPetId(petId);
        setPage(0);
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['right', 'bottom', 'left']}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.wrapper}>
                    <Text style={styles.eyebrow}>ÁREA DO TUTOR</Text>
                    <Text style={styles.title}>Medicamentos</Text>
                    <Text style={styles.description}>
                        Selecione um dos seus pets para consultar os medicamentos registrados.
                    </Text>

                    <TutorPetSelector
                        pets={pets.data?.content ?? []}
                        selectedPetId={selectedPetId}
                        isPending={pets.isPending}
                        isError={pets.isError}
                        error={pets.error}
                        onSelect={selectPet}
                        onRetry={() => void pets.refetch()}
                    />

                    <View style={styles.dataSection}>
                        <Text style={styles.sectionTitle}>Medicamentos registrados</Text>

                        {selectedPetId === null ? (
                            <StateMessage text="Selecione um pet para visualizar os medicamentos." />
                        ) : medications.isPending ? (
                            <LoadingState message="Carregando medicamentos..." />
                        ) : medications.isError ? (
                            <View style={styles.stateBox}>
                                <Text style={styles.stateTitle}>
                                    Não foi possível carregar os medicamentos
                                </Text>
                                <Text style={styles.stateMessage}>
                                    {getApiErrorMessage(
                                        medications.error,
                                        'Não foi possível consultar os medicamentos deste pet.',
                                    )}
                                </Text>
                                <AppButton
                                    label="Tentar novamente"
                                    onPress={() => void medications.refetch()}
                                    variant="secondary"
                                    size="small"
                                    style={styles.retryButton}
                                />
                            </View>
                        ) : medications.data.content.length === 0 ? (
                            <StateMessage title="Nenhum medicamento encontrado para este pet." />
                        ) : (
                            <View style={styles.list}>
                                {medications.data.content.map((medication) => (
                                    <MedicationCard key={medication.id} medication={medication} />
                                ))}

                                <PaginationControls
                                    page={medications.data.number}
                                    totalPages={medications.data.totalPages}
                                    isFirst={medications.data.first}
                                    isLast={medications.data.last}
                                    disabled={medications.isFetching}
                                    onPrevious={() => setPage(medications.data.number - 1)}
                                    onNext={() => setPage(medications.data.number + 1)}
                                />
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

function MedicationCard({ medication }: { medication: Medication }) {
    return (
        <View style={styles.medicationCard}>
            <View style={styles.medicationHeader}>
                <Text style={styles.medicationName}>{medication.name}</Text>
                <View style={[
                    styles.statusBadge,
                    medication.status === 'CANCELADO' && styles.statusCancelled,
                    medication.status === 'FINALIZADO' && styles.statusCompleted,
                ]}>
                    <Text style={[
                        styles.statusText,
                        medication.status === 'CANCELADO' && styles.statusCancelledText,
                        medication.status === 'FINALIZADO' && styles.statusCompletedText,
                    ]}>
                        {formatStatus(medication.status)}
                    </Text>
                </View>
            </View>

            <Text style={styles.medicationDetail}>Dose: {medication.dosage}</Text>
            <Text style={styles.medicationDetail}>Frequência: {medication.frequency}</Text>
            <Text style={styles.medicationPeriod}>
                {formatLocalDate(medication.startDate)}
                {medication.endDate ? ` a ${formatLocalDate(medication.endDate)}` : ''}
            </Text>
            <Text style={styles.medicationProfessional}>
                {medication.veterinarianName ?? 'Veterinário não informado'}
            </Text>

            {medication.observations?.trim() ? (
                <Text style={styles.medicationObservations}>{medication.observations}</Text>
            ) : null}
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

function StateMessage({ title, text }: { title?: string; text?: string }) {
    return (
        <View style={styles.stateBox}>
            {title ? <Text style={styles.stateTitle}>{title}</Text> : null}
            {text ? <Text style={styles.stateMessage}>{text}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    scrollView: { flex: 1, backgroundColor: colors.background },
    content: { flexGrow: 1, padding: spacing.xl },
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
    dataSection: { marginTop: spacing.xxl },
    sectionTitle: { color: colors.text, fontSize: typography.heading, fontWeight: '800' },
    list: { gap: spacing.lg, marginTop: spacing.xl },
    medicationCard: {
        padding: spacing.xl,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.lg,
        backgroundColor: colors.surface,
        ...shadows.card,
    },
    medicationHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: spacing.md,
    },
    medicationName: {
        flex: 1,
        color: colors.text,
        fontSize: typography.heading,
        fontWeight: '800',
    },
    statusBadge: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radii.pill,
        backgroundColor: '#EAF7F0',
    },
    statusText: { color: colors.success, fontSize: typography.small, fontWeight: '800' },
    statusCancelled: { backgroundColor: '#FCECEC' },
    statusCancelledText: { color: colors.danger },
    statusCompleted: { backgroundColor: colors.primarySoft },
    statusCompletedText: { color: colors.primaryDark },
    medicationDetail: {
        marginTop: spacing.md,
        color: colors.text,
        fontSize: typography.caption,
        lineHeight: 20,
    },
    medicationPeriod: {
        marginTop: spacing.lg,
        color: colors.primaryDark,
        fontSize: typography.caption,
        fontWeight: '700',
    },
    medicationProfessional: {
        marginTop: spacing.sm,
        color: colors.textSecondary,
        fontSize: typography.small,
    },
    medicationObservations: {
        marginTop: spacing.lg,
        paddingTop: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        color: colors.text,
        fontSize: typography.caption,
        lineHeight: 21,
    },
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
        backgroundColor: colors.surface,
    },
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
