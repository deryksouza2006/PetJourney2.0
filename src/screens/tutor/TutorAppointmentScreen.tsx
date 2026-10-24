import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ComponentProps, PropsWithChildren, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '../../components/AppButton';
import { AppInput } from '../../components/AppInput';
import { TutorAppointmentDaySelector } from '../../components/tutor/TutorAppointmentDaySelector';
import { TutorAppointmentPetSelector } from '../../components/tutor/TutorAppointmentPetSelector';
import {
    APPOINTMENT_REASON_TITLES,
    AppointmentReason,
    TutorAppointmentReasonChips,
} from '../../components/tutor/TutorAppointmentReasonChips';
import { TutorAppointmentTimeGrid } from '../../components/tutor/TutorAppointmentTimeGrid';
import { useAuth } from '../../contexts/AuthContext';
import { useScheduleAppointment } from '../../hooks/appointments/useScheduleAppointment';
import { useFutureAvailableSlots } from '../../hooks/availability/useFutureAvailableSlots';
import { usePets } from '../../hooks/pets/usePets';
import { TutorStackParamList } from '../../navigation/TutorNavigator';
import { colors, createThemedStyles, radii, shadows, spacing, typography } from '../../theme/tokens';
import { VeterinarianAvailability } from '../../types/veterinarianAvailability';
import { getApiErrorMessage } from '../../utils/apiError';

type Props = NativeStackScreenProps<TutorStackParamList, 'TutorAppointment'>;
type IconName = ComponentProps<typeof Ionicons>['name'];

interface AvailableVeterinarian {
    id: number;
    name: string;
    nextAvailability: string;
}

interface AppointmentSectionProps extends PropsWithChildren {
    icon: IconName;
    title: string;
    description: string;
}

function getLocalIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function getDatePart(dateTime: string): string {
    const match = /^(\d{4}-\d{2}-\d{2})T/.exec(dateTime);

    return match?.[1] ?? dateTime;
}

function formatDate(isoDate: string): string {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);

    return match ? `${match[3]}/${match[2]}/${match[1]}` : isoDate;
}

function getAppointmentTitle(
    reason: AppointmentReason | null,
    customTitle: string,
): string {
    if (reason === null) {
        return '';
    }

    if (reason === 'OTHER') {
        return customTitle.trim();
    }

    return APPOINTMENT_REASON_TITLES[reason];
}

const today = new Date();
const discoveryEnd = new Date(today);
discoveryEnd.setDate(discoveryEnd.getDate() + 365);

const TODAY_ISO_DATE = getLocalIsoDate(today);
const FUTURE_RANGE_START = `${TODAY_ISO_DATE}T00:00:00`;
const FUTURE_RANGE_END = `${getLocalIsoDate(discoveryEnd)}T23:59:59`;

export function TutorAppointmentScreen(_props: Props) {
    const { user } = useAuth();
    const slotsQuery = useFutureAvailableSlots(FUTURE_RANGE_START, FUTURE_RANGE_END);
    const petsQuery = usePets(0, 100);
    const scheduleAppointment = useScheduleAppointment();
    const [selectedVeterinarianId, setSelectedVeterinarianId] = useState<number | null>(null);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<VeterinarianAvailability | null>(null);
    const [selectedPetId, setSelectedPetId] = useState<number | null>(null);
    const [selectedReason, setSelectedReason] = useState<AppointmentReason | null>(null);
    const [customTitle, setCustomTitle] = useState('');
    const [description, setDescription] = useState('');
    const [titleError, setTitleError] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const sortedSlots = useMemo(
        () => [...(slotsQuery.data?.content ?? [])]
            .filter((slot) => getDatePart(slot.startTime) >= TODAY_ISO_DATE)
            .sort((first, second) => first.startTime.localeCompare(second.startTime)),
        [slotsQuery.data],
    );

    const veterinarians = useMemo<AvailableVeterinarian[]>(() => {
        const byId = new Map<number, AvailableVeterinarian>();

        for (const slot of sortedSlots) {
            if (!byId.has(slot.veterinarianId)) {
                byId.set(slot.veterinarianId, {
                    id: slot.veterinarianId,
                    name: slot.veterinarianName ?? `Veterinário #${slot.veterinarianId}`,
                    nextAvailability: slot.startTime,
                });
            }
        }

        return Array.from(byId.values()).sort((first, second) =>
            first.nextAvailability.localeCompare(second.nextAvailability),
        );
    }, [sortedSlots]);

    const availableDates = useMemo(() => {
        if (selectedVeterinarianId === null) {
            return [];
        }

        return Array.from(new Set(
            sortedSlots
                .filter((slot) => slot.veterinarianId === selectedVeterinarianId)
                .map((slot) => getDatePart(slot.startTime)),
        )).sort();
    }, [selectedVeterinarianId, sortedSlots]);

    const selectedDateSlots = useMemo(() => {
        if (selectedVeterinarianId === null || selectedDate === null) {
            return [];
        }

        return sortedSlots.filter((slot) =>
            slot.veterinarianId === selectedVeterinarianId
            && getDatePart(slot.startTime) === selectedDate,
        );
    }, [selectedDate, selectedVeterinarianId, sortedSlots]);

    const appointmentTitle = getAppointmentTitle(selectedReason, customTitle);

    function clearFeedback(): void {
        setErrorMessage(null);
        setSuccessMessage(null);
    }

    function selectVeterinarian(veterinarianId: number): void {
        setSelectedVeterinarianId(veterinarianId);
        setSelectedDate(null);
        setSelectedSlot(null);
        clearFeedback();
    }

    function selectDate(date: string): void {
        setSelectedDate(date);
        setSelectedSlot(null);
        clearFeedback();
    }

    function selectReason(reason: AppointmentReason): void {
        setSelectedReason(reason);
        setTitleError(null);

        if (reason !== 'OTHER') {
            setCustomTitle('');
        }

        clearFeedback();
    }

    async function handleSubmit(): Promise<void> {
        const clinicId = user?.clinicId ?? null;
        const nextTitleError = selectedReason === null
            ? 'Selecione o motivo da consulta.'
            : selectedReason === 'OTHER' && !appointmentTitle
                ? 'Informe um título curto para a consulta.'
                : null;

        setTitleError(nextTitleError);

        if (
            selectedVeterinarianId === null
            || selectedDate === null
            || selectedSlot === null
            || selectedPetId === null
            || !appointmentTitle
            || clinicId === null
        ) {
            setSuccessMessage(null);
            setErrorMessage('Complete as seleções obrigatórias antes de agendar.');
            return;
        }

        setErrorMessage(null);
        setSuccessMessage(null);

        try {
            const result = await scheduleAppointment.mutateAsync({
                title: appointmentTitle,
                description: description.trim() || undefined,
                petId: selectedPetId,
                clinicId,
                veterinarianId: selectedVeterinarianId,
                dateTime: selectedSlot.startTime,
            });

            setSelectedSlot(null);
            setSelectedPetId(null);
            setSelectedReason(null);
            setCustomTitle('');
            setDescription('');
            setTitleError(null);
            setSuccessMessage('Consulta agendada com sucesso.');
            const notificationWarning = result.notifications.shouldWarnPermissionDenied
                ? '\n\nAs notificações estão desativadas. Você pode ativá-las nas configurações do aparelho.'
                : '';
            const reminderConfirmation = result.notifications.reminderScheduled
                ? '\n\nLembrete programado para 24 horas antes.'
                : '';
            Alert.alert(
                'Agendamento confirmado',
                `Consulta agendada com sucesso.${reminderConfirmation}${notificationWarning}`,
            );
        } catch (error: unknown) {
            setErrorMessage(getApiErrorMessage(
                error,
                'Não foi possível agendar a consulta. Tente novamente.',
            ));
        }
    }

    const clinicId = user?.clinicId ?? null;
    const isSubmitDisabled =
        selectedVeterinarianId === null
        || selectedDate === null
        || selectedSlot === null
        || selectedPetId === null
        || !appointmentTitle
        || clinicId === null
        || scheduleAppointment.isPending;

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
                        <View style={styles.introduction}>
                            <View style={styles.heroIcon}>
                                <Ionicons name="calendar" size={24} color={colors.primary} />
                            </View>
                            <View style={styles.introductionCopy}>
                                <Text style={styles.eyebrow}>ÁREA DO TUTOR</Text>
                                <Text style={styles.title}>Agendar consulta</Text>
                                <Text style={styles.description}>
                                    Monte o agendamento com as opções disponíveis para você.
                                </Text>
                            </View>
                        </View>

                        <AppointmentSection
                            icon="paw-outline"
                            title="PET"
                            description="Quem será atendido?"
                        >
                            {petsQuery.isPending ? (
                                <InlineLoading text="Carregando seus pets..." />
                            ) : petsQuery.isError ? (
                                <StateMessage
                                    title="Não foi possível carregar seus pets"
                                    actionLabel="Tentar novamente"
                                    onAction={() => void petsQuery.refetch()}
                                />
                            ) : (petsQuery.data?.content.length ?? 0) === 0 ? (
                                <StateMessage title="Nenhum pet vinculado à sua conta." />
                            ) : (
                                <TutorAppointmentPetSelector
                                    pets={petsQuery.data?.content ?? []}
                                    selectedPetId={selectedPetId}
                                    disabled={scheduleAppointment.isPending}
                                    onSelect={(petId) => {
                                        setSelectedPetId(petId);
                                        clearFeedback();
                                    }}
                                />
                            )}
                        </AppointmentSection>

                        <AppointmentSection
                            icon="medkit-outline"
                            title="MOTIVO"
                            description="Selecione a finalidade da consulta."
                        >
                            <TutorAppointmentReasonChips
                                selectedReason={selectedReason}
                                disabled={scheduleAppointment.isPending}
                                onSelect={selectReason}
                            />
                            {titleError && selectedReason !== 'OTHER' ? (
                                <Text style={styles.fieldError}>{titleError}</Text>
                            ) : null}
                            {selectedReason === 'OTHER' ? (
                                <AppInput
                                    label="Título da consulta *"
                                    value={customTitle}
                                    onChangeText={(value) => {
                                        setCustomTitle(value);
                                        setTitleError(null);
                                        clearFeedback();
                                    }}
                                    placeholder="Ex.: Avaliação dermatológica"
                                    error={titleError}
                                    maxLength={120}
                                    editable={!scheduleAppointment.isPending}
                                    containerStyle={styles.customTitleInput}
                                />
                            ) : null}
                            <View style={styles.optionalField}>
                                <AppInput
                                    label="Observações"
                                    value={description}
                                    onChangeText={(value) => {
                                        setDescription(value);
                                        clearFeedback();
                                    }}
                                    placeholder="Ex.: informações que ajudem no atendimento"
                                    helperText="Opcional"
                                    maxLength={500}
                                    multiline
                                    numberOfLines={3}
                                    textAlignVertical="top"
                                    style={styles.descriptionInput}
                                    editable={!scheduleAppointment.isPending}
                                />
                            </View>
                        </AppointmentSection>

                        <AppointmentSection
                            icon="person-outline"
                            title="VETERINÁRIO"
                            description="Escolha um profissional com disponibilidade."
                        >
                            {slotsQuery.isPending ? (
                                <InlineLoading text="Carregando disponibilidades..." />
                            ) : slotsQuery.isError ? (
                                <StateMessage
                                    title="Não foi possível consultar os horários livres."
                                    actionLabel="Tentar novamente"
                                    onAction={() => void slotsQuery.refetch()}
                                />
                            ) : veterinarians.length === 0 ? (
                                <StateMessage
                                    title="Nenhum veterinário disponível"
                                    text="Sua clínica ainda não publicou novos horários livres."
                                />
                            ) : (
                                <ScrollView
                                    horizontal
                                    nestedScrollEnabled
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.veterinarianList}
                                >
                                    {veterinarians.map((veterinarian) => {
                                        const isSelected = veterinarian.id === selectedVeterinarianId;

                                        return (
                                            <Pressable
                                                key={veterinarian.id}
                                                accessibilityRole="button"
                                                accessibilityState={{
                                                    selected: isSelected,
                                                    disabled: scheduleAppointment.isPending,
                                                }}
                                                disabled={scheduleAppointment.isPending}
                                                onPress={() => selectVeterinarian(veterinarian.id)}
                                                style={({ pressed }) => [
                                                    styles.veterinarianCard,
                                                    isSelected && styles.veterinarianCardSelected,
                                                    pressed && styles.optionPressed,
                                                ]}
                                            >
                                                <View style={styles.veterinarianIcon}>
                                                    <Ionicons
                                                        name="medical-outline"
                                                        size={22}
                                                        color={colors.primary}
                                                    />
                                                </View>
                                                <View style={styles.veterinarianCopy}>
                                                    <Text style={styles.veterinarianName} numberOfLines={1}>
                                                        {veterinarian.name}
                                                    </Text>
                                                    <Text style={styles.optionHint}>
                                                        Próximo dia: {formatDate(getDatePart(
                                                            veterinarian.nextAvailability,
                                                        ))}
                                                    </Text>
                                                </View>
                                                {isSelected ? (
                                                    <Ionicons
                                                        name="checkmark-circle"
                                                        size={22}
                                                        color={colors.primary}
                                                    />
                                                ) : null}
                                            </Pressable>
                                        );
                                    })}
                                </ScrollView>
                            )}
                        </AppointmentSection>

                        <AppointmentSection
                            icon="calendar-outline"
                            title="DIA"
                            description="Mostramos somente dias com horários livres."
                        >
                            {selectedVeterinarianId === null ? (
                                <StateMessage text="Selecione um veterinário para ver os dias disponíveis." />
                            ) : availableDates.length === 0 ? (
                                <StateMessage
                                    title="Nenhuma data disponível"
                                    text="Escolha outro veterinário ou tente novamente mais tarde."
                                />
                            ) : (
                                <TutorAppointmentDaySelector
                                    dates={availableDates}
                                    selectedDate={selectedDate}
                                    disabled={scheduleAppointment.isPending}
                                    onSelect={selectDate}
                                />
                            )}
                        </AppointmentSection>

                        <AppointmentSection
                            icon="time-outline"
                            title="HORÁRIO"
                            description="Escolha um dos horários livres."
                        >
                            {selectedVeterinarianId === null ? (
                                <StateMessage text="Selecione um veterinário para continuar." />
                            ) : selectedDate === null ? (
                                <StateMessage text="Selecione um dos dias disponíveis." />
                            ) : selectedDateSlots.length === 0 ? (
                                <StateMessage title="Nenhum horário disponível nesta data." />
                            ) : (
                                <TutorAppointmentTimeGrid
                                    slots={selectedDateSlots}
                                    selectedSlotId={selectedSlot?.id ?? null}
                                    disabled={scheduleAppointment.isPending}
                                    onSelect={(slot) => {
                                        setSelectedSlot(slot);
                                        clearFeedback();
                                    }}
                                />
                            )}
                        </AppointmentSection>

                        <View style={styles.ctaCard}>
                            <View style={styles.ctaHeader}>
                                <View style={styles.ctaIcon}>
                                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                                </View>
                                <View style={styles.ctaCopy}>
                                    <Text style={styles.ctaTitle}>Confirmar agendamento</Text>
                                    <Text style={styles.ctaDescription}>
                                        Revise as seleções acima antes de continuar.
                                    </Text>
                                </View>
                            </View>

                            {clinicId === null ? (
                                <Text style={styles.errorText}>
                                    Não foi possível identificar a clínica da sua sessão.
                                </Text>
                            ) : null}
                            {errorMessage ? (
                                <Text style={styles.errorText} accessibilityLiveRegion="polite">
                                    {errorMessage}
                                </Text>
                            ) : null}
                            {successMessage ? (
                                <Text style={styles.successText} accessibilityLiveRegion="polite">
                                    {successMessage}
                                </Text>
                            ) : null}

                            <AppButton
                                label="Agendar consulta"
                                onPress={() => void handleSubmit()}
                                disabled={isSubmitDisabled}
                                loading={scheduleAppointment.isPending}
                                loadingLabel="Agendando..."
                                style={styles.submitButton}
                            />
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

function AppointmentSection({
    icon,
    title,
    description,
    children,
}: AppointmentSectionProps) {
    return (
        <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
                <View style={styles.sectionIcon}>
                    <Ionicons name={icon} size={20} color={colors.primary} />
                </View>
                <View style={styles.sectionCopy}>
                    <Text style={styles.sectionTitle}>{title}</Text>
                    <Text style={styles.sectionDescription}>{description}</Text>
                </View>
            </View>
            <View style={styles.sectionContent}>{children}</View>
        </View>
    );
}

function InlineLoading({ text }: { text: string }) {
    return (
        <View style={styles.inlineState}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.stateMessage}>{text}</Text>
        </View>
    );
}

interface StateMessageProps {
    title?: string;
    text?: string;
    actionLabel?: string;
    onAction?: () => void;
}

function StateMessage({ title, text, actionLabel, onAction }: StateMessageProps) {
    return (
        <View style={styles.stateBox}>
            {title ? <Text style={styles.stateTitle}>{title}</Text> : null}
            {text ? <Text style={styles.stateMessage}>{text}</Text> : null}
            {actionLabel && onAction ? (
                <AppButton
                    label={actionLabel}
                    onPress={onAction}
                    variant="secondary"
                    size="small"
                    style={styles.retryButton}
                />
            ) : null}
        </View>
    );
}

const styles = createThemedStyles((themeColors) => ({
    safeArea: { flex: 1, backgroundColor: themeColors.background },
    keyboardView: { flex: 1 },
    scrollView: { flex: 1, backgroundColor: themeColors.background },
    content: { flexGrow: 1, padding: spacing.lg, paddingBottom: spacing.xxxl },
    wrapper: { width: '100%', maxWidth: 760, alignSelf: 'center' },
    introduction: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: spacing.xl,
    },
    heroIcon: {
        width: 48,
        height: 48,
        flexShrink: 0,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: radii.md,
        backgroundColor: themeColors.primarySoft,
    },
    introductionCopy: { minWidth: 0, flex: 1, marginLeft: spacing.md },
    eyebrow: {
        color: themeColors.primary,
        fontSize: typography.small,
        fontWeight: '800',
        letterSpacing: 1.3,
    },
    title: {
        marginTop: spacing.xs,
        color: themeColors.text,
        fontSize: typography.title,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    description: {
        marginTop: spacing.sm,
        color: themeColors.textSecondary,
        fontSize: typography.caption,
        lineHeight: 20,
    },
    sectionCard: {
        marginBottom: spacing.lg,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: themeColors.border,
        borderRadius: radii.lg,
        backgroundColor: themeColors.surface,
    },
    sectionHeader: { flexDirection: 'row', alignItems: 'center' },
    sectionIcon: {
        width: 40,
        height: 40,
        flexShrink: 0,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: radii.md,
        backgroundColor: themeColors.primarySoft,
    },
    sectionCopy: { minWidth: 0, flex: 1, marginLeft: spacing.md },
    sectionTitle: {
        color: themeColors.text,
        fontSize: typography.small,
        fontWeight: '800',
        letterSpacing: 1.1,
    },
    sectionDescription: {
        marginTop: spacing.xs,
        color: themeColors.textSecondary,
        fontSize: typography.small,
        lineHeight: 18,
    },
    sectionContent: { marginTop: spacing.lg },
    fieldError: {
        marginTop: spacing.sm,
        color: themeColors.danger,
        fontSize: typography.small,
        lineHeight: 18,
    },
    customTitleInput: { marginTop: spacing.lg },
    optionalField: {
        marginTop: spacing.lg,
        paddingTop: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: themeColors.border,
    },
    descriptionInput: { minHeight: 88, paddingTop: spacing.md },
    veterinarianList: { gap: spacing.md, paddingVertical: spacing.xs, paddingRight: spacing.sm },
    veterinarianCard: {
        width: 260,
        minHeight: 84,
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderWidth: 1,
        borderColor: themeColors.border,
        borderRadius: radii.lg,
        backgroundColor: themeColors.inputBackground,
    },
    veterinarianCardSelected: {
        borderColor: themeColors.primary,
        backgroundColor: themeColors.primarySoft,
    },
    veterinarianIcon: {
        width: 42,
        height: 42,
        flexShrink: 0,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: radii.pill,
        backgroundColor: themeColors.surface,
    },
    veterinarianCopy: { minWidth: 0, flex: 1, marginHorizontal: spacing.md },
    veterinarianName: {
        color: themeColors.text,
        fontSize: typography.caption,
        fontWeight: '800',
    },
    optionHint: {
        marginTop: spacing.xs,
        color: themeColors.textSecondary,
        fontSize: typography.small,
        lineHeight: 17,
    },
    optionPressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
    inlineState: {
        minHeight: 84,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.md,
    },
    stateBox: {
        minHeight: 96,
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: themeColors.border,
        borderRadius: radii.md,
        backgroundColor: themeColors.background,
    },
    stateTitle: {
        color: themeColors.text,
        fontSize: typography.caption,
        fontWeight: '800',
        textAlign: 'center',
    },
    stateMessage: {
        marginTop: spacing.xs,
        color: themeColors.textSecondary,
        fontSize: typography.caption,
        lineHeight: 20,
        textAlign: 'center',
    },
    retryButton: { marginTop: spacing.md },
    ctaCard: {
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: themeColors.primary,
        borderRadius: radii.lg,
        backgroundColor: themeColors.surface,
        ...shadows.card,
    },
    ctaHeader: { flexDirection: 'row', alignItems: 'center' },
    ctaIcon: {
        width: 40,
        height: 40,
        flexShrink: 0,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: radii.pill,
        backgroundColor: themeColors.primarySoft,
    },
    ctaCopy: { minWidth: 0, flex: 1, marginLeft: spacing.md },
    ctaTitle: {
        color: themeColors.text,
        fontSize: typography.body,
        fontWeight: '800',
    },
    ctaDescription: {
        marginTop: spacing.xs,
        color: themeColors.textSecondary,
        fontSize: typography.small,
        lineHeight: 18,
    },
    errorText: {
        marginTop: spacing.lg,
        color: themeColors.danger,
        fontSize: typography.caption,
        lineHeight: 20,
        textAlign: 'center',
    },
    successText: {
        marginTop: spacing.lg,
        color: themeColors.success,
        fontSize: typography.caption,
        fontWeight: '700',
        lineHeight: 20,
        textAlign: 'center',
    },
    submitButton: { marginTop: spacing.lg },
}));
