import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PropsWithChildren, useMemo, useRef, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '../../components/AppButton';
import { AppInput } from '../../components/AppInput';
import { useTheme } from '../../contexts/ThemeContext';
import { useRegisterConsultation } from '../../hooks/consultations/useRegisterConsultation';
import { VeterinarianStackParamList } from '../../navigation/VeterinarianNavigator';
import { radii, spacing, ThemeColors, typography } from '../../theme/tokens';
import { ConsultationMedicationRequest } from '../../types/consultation';
import { getApiErrorMessage } from '../../utils/apiError';
import { dateInputToIsoDate } from '../../utils/dateValidation';
import { formatLocalDateTime } from '../../utils/dateTimeFormatting';
import { formatDateInput } from '../../utils/inputMasks';

type Props = NativeStackScreenProps<VeterinarianStackParamList, 'RegisterConsultation'>;

interface MedicationFormValue {
    id: number;
    name: string;
    dosage: string;
    frequency: string;
    startDate: string;
    endDate: string;
    observations: string;
}

interface MedicationFormErrors {
    name?: string;
    startDate?: string;
    endDate?: string;
}

interface FormSectionProps extends PropsWithChildren {
    icon: React.ComponentProps<typeof Ionicons>['name'];
    title: string;
    description: string;
}

function optionalText(value: string): string | undefined {
    return value.trim() || undefined;
}

function createMedication(id: number): MedicationFormValue {
    return {
        id,
        name: '',
        dosage: '',
        frequency: '',
        startDate: '',
        endDate: '',
        observations: '',
    };
}

export function VeterinarianConsultationFormScreen({ navigation, route }: Props) {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const registerConsultation = useRegisterConsultation();
    const nextMedicationId = useRef(1);
    const { appointment } = route.params;
    const [mainComplaint, setMainComplaint] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [conduct, setConduct] = useState('');
    const [observations, setObservations] = useState('');
    const [clinicalNotes, setClinicalNotes] = useState('');
    const [recommendations, setRecommendations] = useState('');
    const [prescriptionNotes, setPrescriptionNotes] = useState('');
    const [medications, setMedications] = useState<MedicationFormValue[]>([]);
    const [mainComplaintError, setMainComplaintError] = useState<string | null>(null);
    const [medicationErrors, setMedicationErrors] = useState<Record<number, MedicationFormErrors>>({});
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isCompleted, setIsCompleted] = useState(false);
    const isSubmitting = registerConsultation.isPending || isCompleted;

    function updateMedication(
        id: number,
        field: keyof Omit<MedicationFormValue, 'id'>,
        value: string,
    ): void {
        setMedications((items) => items.map((item) => (
            item.id === id ? { ...item, [field]: value } : item
        )));
        setMedicationErrors((current) => ({
            ...current,
            [id]: { ...current[id], [field]: undefined },
        }));
        setErrorMessage(null);
    }

    function addMedication(): void {
        const id = nextMedicationId.current;
        nextMedicationId.current += 1;
        setMedications((items) => [...items, createMedication(id)]);
        setErrorMessage(null);
    }

    function removeMedication(id: number): void {
        setMedications((items) => items.filter((item) => item.id !== id));
        setMedicationErrors((current) => {
            const next = { ...current };
            delete next[id];
            return next;
        });
        setErrorMessage(null);
    }

    function validateMedications(): {
        errors: Record<number, MedicationFormErrors>;
        payload: ConsultationMedicationRequest[];
    } {
        const errors: Record<number, MedicationFormErrors> = {};
        const payload: ConsultationMedicationRequest[] = [];

        for (const medication of medications) {
            const itemErrors: MedicationFormErrors = {};
            const startDate = medication.startDate
                ? dateInputToIsoDate(medication.startDate) ?? undefined
                : undefined;
            const endDate = medication.endDate
                ? dateInputToIsoDate(medication.endDate) ?? undefined
                : undefined;

            if (!medication.name.trim()) {
                itemErrors.name = 'Informe o nome do medicamento.';
            }
            if (medication.startDate && !startDate) {
                itemErrors.startDate = 'Informe uma data válida no formato DD/MM/AAAA.';
            }
            if (medication.endDate && !endDate) {
                itemErrors.endDate = 'Informe uma data válida no formato DD/MM/AAAA.';
            }
            if (startDate && endDate && endDate < startDate) {
                itemErrors.endDate = 'A data final não pode ser anterior à inicial.';
            }

            if (Object.keys(itemErrors).length > 0) {
                errors[medication.id] = itemErrors;
                continue;
            }

            payload.push({
                name: medication.name.trim(),
                dosage: optionalText(medication.dosage),
                frequency: optionalText(medication.frequency),
                startDate,
                endDate,
                observations: optionalText(medication.observations),
            });
        }

        return { errors, payload };
    }

    async function handleSubmit(): Promise<void> {
        if (isSubmitting) {
            return;
        }

        const complaint = mainComplaint.trim();
        const medicationValidation = validateMedications();
        const complaintError = complaint ? null : 'Informe a queixa principal.';

        setMainComplaintError(complaintError);
        setMedicationErrors(medicationValidation.errors);
        setErrorMessage(null);

        if (appointment.status !== 'PENDENTE') {
            setErrorMessage('Esta consulta não está disponível para registro de atendimento.');
            return;
        }

        if (complaintError || Object.keys(medicationValidation.errors).length > 0) {
            setErrorMessage('Revise os campos obrigatórios antes de continuar.');
            return;
        }

        try {
            await registerConsultation.mutateAsync({
                appointmentId: appointment.id,
                mainComplaint: complaint,
                diagnosis: optionalText(diagnosis),
                conduct: optionalText(conduct),
                observations: optionalText(observations),
                clinicalNotes: optionalText(clinicalNotes),
                recommendations: optionalText(recommendations),
                prescriptionNotes: optionalText(prescriptionNotes),
                medications: medicationValidation.payload.length > 0
                    ? medicationValidation.payload
                    : undefined,
            });

            setIsCompleted(true);
            Alert.alert(
                'Atendimento registrado',
                'O prontuário foi salvo e a consulta foi marcada como realizada.',
                [{ text: 'OK', onPress: () => navigation.goBack() }],
            );
        } catch (error: unknown) {
            setErrorMessage(getApiErrorMessage(
                error,
                'Não foi possível registrar o atendimento. Tente novamente.',
            ));
        }
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['right', 'bottom', 'left']}>
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="on-drag"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.wrapper}>
                        <View style={styles.appointmentCard}>
                            <View style={styles.appointmentIcon}>
                                <Ionicons name="calendar-outline" size={22} color={colors.primary} />
                            </View>
                            <View style={styles.appointmentCopy}>
                                <Text style={styles.eyebrow}>ATENDIMENTO</Text>
                                <Text style={styles.appointmentTitle}>{appointment.title}</Text>
                                <Text style={styles.appointmentDetail}>
                                    {appointment.petName ?? 'Pet não informado'}
                                </Text>
                                <Text style={styles.appointmentDetail}>
                                    {formatLocalDateTime(appointment.dateTime)}
                                </Text>
                                {appointment.clinicName ? (
                                    <Text style={styles.appointmentDetail}>{appointment.clinicName}</Text>
                                ) : null}
                                {appointment.description ? (
                                    <Text style={styles.appointmentDescription}>
                                        {appointment.description}
                                    </Text>
                                ) : null}
                            </View>
                        </View>

                        <FormSection
                            icon="document-text-outline"
                            title="PRONTUÁRIO"
                            description="Registre as informações principais deste atendimento."
                        >
                            <AppInput
                                label="Queixa principal *"
                                value={mainComplaint}
                                onChangeText={(value) => {
                                    setMainComplaint(value);
                                    setMainComplaintError(null);
                                    setErrorMessage(null);
                                }}
                                placeholder="Descreva o motivo principal do atendimento"
                                error={mainComplaintError}
                                maxLength={500}
                                multiline
                                numberOfLines={3}
                                editable={!isSubmitting}
                            />
                            <AppInput
                                label="Diagnóstico"
                                value={diagnosis}
                                onChangeText={setDiagnosis}
                                placeholder="Diagnóstico clínico"
                                helperText="Opcional"
                                maxLength={500}
                                multiline
                                numberOfLines={3}
                                editable={!isSubmitting}
                            />
                            <AppInput
                                label="Conduta"
                                value={conduct}
                                onChangeText={setConduct}
                                placeholder="Conduta adotada no atendimento"
                                helperText="Opcional"
                                maxLength={500}
                                multiline
                                numberOfLines={3}
                                editable={!isSubmitting}
                            />
                        </FormSection>

                        <FormSection
                            icon="clipboard-outline"
                            title="OBSERVAÇÕES CLÍNICAS"
                            description="Complete somente as informações relevantes."
                        >
                            <AppInput
                                label="Observações"
                                value={observations}
                                onChangeText={setObservations}
                                placeholder="Observações gerais"
                                helperText="Opcional"
                                maxLength={1000}
                                multiline
                                numberOfLines={3}
                                editable={!isSubmitting}
                            />
                            <AppInput
                                label="Notas clínicas"
                                value={clinicalNotes}
                                onChangeText={setClinicalNotes}
                                placeholder="Anotações clínicas do atendimento"
                                helperText="Opcional"
                                maxLength={1000}
                                multiline
                                numberOfLines={3}
                                editable={!isSubmitting}
                            />
                            <AppInput
                                label="Recomendações"
                                value={recommendations}
                                onChangeText={setRecommendations}
                                placeholder="Orientações para o tutor"
                                helperText="Opcional"
                                maxLength={1000}
                                multiline
                                numberOfLines={3}
                                editable={!isSubmitting}
                            />
                            <AppInput
                                label="Observações da prescrição"
                                value={prescriptionNotes}
                                onChangeText={setPrescriptionNotes}
                                placeholder="Orientações adicionais sobre a prescrição"
                                helperText="Opcional"
                                maxLength={1000}
                                multiline
                                numberOfLines={3}
                                editable={!isSubmitting}
                            />
                        </FormSection>

                        <FormSection
                            icon="medkit-outline"
                            title="MEDICAMENTOS"
                            description="Adicione medicamentos somente quando houver prescrição."
                        >
                            {medications.length === 0 ? (
                                <View style={styles.emptyMedicationState}>
                                    <Text style={styles.emptyMedicationText}>
                                        Nenhum medicamento será registrado.
                                    </Text>
                                </View>
                            ) : medications.map((medication, index) => {
                                const errors = medicationErrors[medication.id] ?? {};

                                return (
                                    <View key={medication.id} style={styles.medicationCard}>
                                        <View style={styles.medicationHeader}>
                                            <Text style={styles.medicationTitle}>
                                                Medicamento {index + 1}
                                            </Text>
                                            <AppButton
                                                label="Remover"
                                                onPress={() => removeMedication(medication.id)}
                                                variant="danger"
                                                size="small"
                                                disabled={isSubmitting}
                                                style={styles.removeButton}
                                            />
                                        </View>
                                        <AppInput
                                            label="Nome *"
                                            value={medication.name}
                                            onChangeText={(value) => updateMedication(
                                                medication.id,
                                                'name',
                                                value,
                                            )}
                                            placeholder="Ex.: Prednisona"
                                            error={errors.name}
                                            maxLength={120}
                                            editable={!isSubmitting}
                                        />
                                        <AppInput
                                            label="Dosagem"
                                            value={medication.dosage}
                                            onChangeText={(value) => updateMedication(
                                                medication.id,
                                                'dosage',
                                                value,
                                            )}
                                            placeholder="Ex.: 10 mg"
                                            helperText="Opcional"
                                            maxLength={120}
                                            editable={!isSubmitting}
                                        />
                                        <AppInput
                                            label="Frequência"
                                            value={medication.frequency}
                                            onChangeText={(value) => updateMedication(
                                                medication.id,
                                                'frequency',
                                                value,
                                            )}
                                            placeholder="Ex.: a cada 12 horas"
                                            helperText="Opcional"
                                            maxLength={120}
                                            editable={!isSubmitting}
                                        />
                                        <View style={styles.dateRow}>
                                            <AppInput
                                                label="Início"
                                                value={medication.startDate}
                                                onChangeText={(value) => updateMedication(
                                                    medication.id,
                                                    'startDate',
                                                    formatDateInput(value),
                                                )}
                                                placeholder="DD/MM/AAAA"
                                                helperText="Opcional"
                                                error={errors.startDate}
                                                keyboardType="number-pad"
                                                maxLength={10}
                                                editable={!isSubmitting}
                                                containerStyle={styles.dateInput}
                                            />
                                            <AppInput
                                                label="Fim"
                                                value={medication.endDate}
                                                onChangeText={(value) => updateMedication(
                                                    medication.id,
                                                    'endDate',
                                                    formatDateInput(value),
                                                )}
                                                placeholder="DD/MM/AAAA"
                                                helperText="Opcional"
                                                error={errors.endDate}
                                                keyboardType="number-pad"
                                                maxLength={10}
                                                editable={!isSubmitting}
                                                containerStyle={styles.dateInput}
                                            />
                                        </View>
                                        <AppInput
                                            label="Observações"
                                            value={medication.observations}
                                            onChangeText={(value) => updateMedication(
                                                medication.id,
                                                'observations',
                                                value,
                                            )}
                                            placeholder="Orientações sobre o uso"
                                            helperText="Opcional"
                                            maxLength={1000}
                                            multiline
                                            numberOfLines={3}
                                            editable={!isSubmitting}
                                        />
                                    </View>
                                );
                            })}

                            <AppButton
                                label="Adicionar medicamento"
                                onPress={addMedication}
                                variant="secondary"
                                disabled={isSubmitting}
                            />
                        </FormSection>

                        {errorMessage ? (
                            <View style={styles.errorCard} accessibilityLiveRegion="polite">
                                <Ionicons name="alert-circle-outline" size={20} color={colors.danger} />
                                <Text style={styles.errorText}>{errorMessage}</Text>
                            </View>
                        ) : null}

                        <AppButton
                            label="Registrar atendimento"
                            loadingLabel="Registrando atendimento..."
                            onPress={() => void handleSubmit()}
                            loading={registerConsultation.isPending}
                            disabled={isCompleted}
                            style={styles.submitButton}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

function FormSection({ icon, title, description, children }: FormSectionProps) {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <View style={styles.sectionIcon}>
                    <Ionicons name={icon} size={20} color={colors.primary} />
                </View>
                <View style={styles.sectionCopy}>
                    <Text style={styles.sectionTitle}>{title}</Text>
                    <Text style={styles.sectionDescription}>{description}</Text>
                </View>
            </View>
            <View style={styles.fields}>{children}</View>
        </View>
    );
}

function createStyles(colors: ThemeColors) {
    return StyleSheet.create({
        safeArea: { flex: 1, backgroundColor: colors.background },
        keyboardView: { flex: 1 },
        scrollView: { flex: 1, backgroundColor: colors.background },
        content: {
            flexGrow: 1,
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.xl,
            paddingBottom: spacing.xxxl,
        },
        wrapper: { width: '100%', maxWidth: 760, alignSelf: 'center' },
        appointmentCard: {
            flexDirection: 'row',
            gap: spacing.md,
            padding: spacing.lg,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.lg,
            backgroundColor: colors.surface,
        },
        appointmentIcon: {
            width: 44,
            height: 44,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: radii.pill,
            backgroundColor: colors.primarySoft,
        },
        appointmentCopy: { flex: 1, minWidth: 0 },
        eyebrow: {
            color: colors.primary,
            fontSize: typography.small,
            fontWeight: '900',
            letterSpacing: 1.2,
        },
        appointmentTitle: {
            marginTop: spacing.xs,
            color: colors.text,
            fontSize: typography.heading,
            fontWeight: '800',
        },
        appointmentDetail: {
            marginTop: spacing.xs,
            color: colors.textSecondary,
            fontSize: typography.caption,
            lineHeight: 20,
        },
        appointmentDescription: {
            marginTop: spacing.sm,
            color: colors.text,
            fontSize: typography.caption,
            lineHeight: 20,
        },
        section: {
            marginTop: spacing.xl,
            padding: spacing.lg,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.lg,
            backgroundColor: colors.surface,
        },
        sectionHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
        sectionIcon: {
            width: 38,
            height: 38,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: radii.pill,
            backgroundColor: colors.primarySoft,
        },
        sectionCopy: { flex: 1 },
        sectionTitle: {
            color: colors.text,
            fontSize: typography.caption,
            fontWeight: '900',
            letterSpacing: 0.7,
        },
        sectionDescription: {
            marginTop: spacing.xs,
            color: colors.textSecondary,
            fontSize: typography.small,
            lineHeight: 18,
        },
        fields: { gap: spacing.lg, marginTop: spacing.xl },
        emptyMedicationState: {
            padding: spacing.lg,
            borderRadius: radii.md,
            backgroundColor: colors.background,
        },
        emptyMedicationText: {
            color: colors.textSecondary,
            fontSize: typography.caption,
            textAlign: 'center',
        },
        medicationCard: {
            gap: spacing.lg,
            padding: spacing.lg,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.md,
            backgroundColor: colors.background,
        },
        medicationHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: spacing.md,
        },
        medicationTitle: {
            flex: 1,
            color: colors.text,
            fontSize: typography.body,
            fontWeight: '800',
        },
        removeButton: { alignSelf: 'auto', minHeight: 42 },
        dateRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
        dateInput: { flex: 1, minWidth: 0 },
        errorCard: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: spacing.sm,
            marginTop: spacing.xl,
            padding: spacing.lg,
            borderWidth: 1,
            borderColor: colors.errorBorder,
            borderRadius: radii.md,
            backgroundColor: colors.errorSurface,
        },
        errorText: {
            flex: 1,
            color: colors.danger,
            fontSize: typography.caption,
            lineHeight: 20,
        },
        submitButton: { marginTop: spacing.xl },
    });
}
