import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '../../components/AppButton';
import { PaginationControls } from '../../components/PaginationControls';
import { TutorPetSelector } from '../../components/TutorPetSelector';
import { useMedicalRecordsByPet } from '../../hooks/medicalRecords/useMedicalRecordsByPet';
import { usePets } from '../../hooks/pets/usePets';
import { TutorStackParamList } from '../../navigation/TutorNavigator';
import { colors, radii, shadows, spacing, typography } from '../../theme/tokens';
import { MedicalRecord } from '../../types/medicalRecord';
import { DEFAULT_PAGE_SIZE } from '../../types/pagination';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatLocalDateTime } from '../../utils/dateTimeFormatting';

type Props = NativeStackScreenProps<TutorStackParamList, 'TutorMedicalRecords'>;

export function TutorMedicalRecordsScreen(_props: Props) {
    const [selectedPetId, setSelectedPetId] = useState<number | null>(null);
    const [page, setPage] = useState(0);
    const pets = usePets(0, 100);
    const medicalRecords = useMedicalRecordsByPet(
        selectedPetId,
        page,
        DEFAULT_PAGE_SIZE,
    );

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
                    <Text style={styles.title}>Prontuário</Text>
                    <Text style={styles.description}>
                        Selecione um dos seus pets para consultar os registros clínicos.
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
                        <Text style={styles.sectionTitle}>Registros clínicos</Text>

                        {selectedPetId === null ? (
                            <StateMessage text="Selecione um pet para visualizar o prontuário." />
                        ) : medicalRecords.isPending ? (
                            <LoadingState message="Carregando prontuário..." />
                        ) : medicalRecords.isError ? (
                            <View style={styles.stateBox}>
                                <Text style={styles.stateTitle}>
                                    Não foi possível carregar o prontuário
                                </Text>
                                <Text style={styles.stateMessage}>
                                    {getApiErrorMessage(
                                        medicalRecords.error,
                                        'Não foi possível consultar os registros clínicos deste pet.',
                                    )}
                                </Text>
                                <AppButton
                                    label="Tentar novamente"
                                    onPress={() => void medicalRecords.refetch()}
                                    variant="secondary"
                                    size="small"
                                    style={styles.retryButton}
                                />
                            </View>
                        ) : medicalRecords.data.content.length === 0 ? (
                            <StateMessage title="Nenhum registro clínico encontrado para este pet." />
                        ) : (
                            <View style={styles.list}>
                                {medicalRecords.data.content.map((record) => (
                                    <MedicalRecordCard key={record.id} record={record} />
                                ))}

                                <PaginationControls
                                    page={medicalRecords.data.number}
                                    totalPages={medicalRecords.data.totalPages}
                                    isFirst={medicalRecords.data.first}
                                    isLast={medicalRecords.data.last}
                                    disabled={medicalRecords.isFetching}
                                    onPrevious={() => setPage(medicalRecords.data.number - 1)}
                                    onNext={() => setPage(medicalRecords.data.number + 1)}
                                />
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

function MedicalRecordCard({ record }: { record: MedicalRecord }) {
    return (
        <View style={styles.recordCard}>
            <Text style={styles.recordDate}>{formatLocalDateTime(record.registrationDate)}</Text>
            <Text style={styles.recordProfessional}>
                {record.veterinarianName ?? 'Veterinário não informado'}
            </Text>
            {record.clinicName ? (
                <Text style={styles.recordClinic}>{record.clinicName}</Text>
            ) : null}

            <View style={styles.recordFields}>
                <RecordField label="Queixa principal" value={record.mainComplaint} />
                <RecordField label="Diagnóstico" value={record.diagnosis} />
                <RecordField label="Conduta" value={record.conduct} />
                <RecordField label="Observações" value={record.observations} />
                <RecordField label="Notas clínicas" value={record.clinicalNotes} />
                <RecordField label="Recomendações" value={record.recommendations} />
                <RecordField label="Observações da prescrição" value={record.prescriptionNotes} />
            </View>
        </View>
    );
}

function RecordField({ label, value }: { label: string; value: string | null }) {
    if (!value?.trim()) {
        return null;
    }

    return (
        <View style={styles.recordField}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <Text style={styles.fieldValue}>{value}</Text>
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
    recordCard: {
        padding: spacing.xl,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.lg,
        backgroundColor: colors.surface,
        ...shadows.card,
    },
    recordDate: {
        color: colors.primaryDark,
        fontSize: typography.body,
        fontWeight: '800',
    },
    recordProfessional: {
        marginTop: spacing.sm,
        color: colors.text,
        fontSize: typography.caption,
        fontWeight: '700',
    },
    recordClinic: {
        marginTop: spacing.xs,
        color: colors.textSecondary,
        fontSize: typography.small,
    },
    recordFields: {
        gap: spacing.lg,
        marginTop: spacing.lg,
        paddingTop: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    recordField: { gap: spacing.xs },
    fieldLabel: {
        color: colors.textSecondary,
        fontSize: typography.small,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    fieldValue: { color: colors.text, fontSize: typography.caption, lineHeight: 21 },
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
