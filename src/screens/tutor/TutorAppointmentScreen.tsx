import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '../../components/AppButton';
import { AppInput } from '../../components/AppInput';
import { useAuth } from '../../contexts/AuthContext';
import { useScheduleAppointment } from '../../hooks/appointments/useScheduleAppointment';
import { useFutureAvailableSlots } from '../../hooks/availability/useFutureAvailableSlots';
import { usePets } from '../../hooks/pets/usePets';
import { TutorStackParamList } from '../../navigation/TutorNavigator';
import { colors, radii, shadows, spacing, typography } from '../../theme/tokens';
import { VeterinarianAvailability } from '../../types/veterinarianAvailability';
import { getApiErrorMessage } from '../../utils/apiError';

type Props = NativeStackScreenProps<TutorStackParamList, 'TutorAppointment'>;

interface AvailableVeterinarian {
    id: number;
    name: string;
    nextAvailability: string;
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

function formatSlotTime(dateTime: string): string {
    const match = /T(\d{2}:\d{2})/.exec(dateTime);

    return match?.[1] ?? dateTime;
}

const today = new Date();
const discoveryEnd = new Date(today);
discoveryEnd.setDate(discoveryEnd.getDate() + 365);

const FUTURE_RANGE_START = `${getLocalIsoDate(today)}T00:00:00`;
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
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const sortedSlots = useMemo(
        () => [...(slotsQuery.data?.content ?? [])].sort((first, second) =>
            first.startTime.localeCompare(second.startTime),
        ),
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

    async function handleSubmit(): Promise<void> {
        const trimmedTitle = title.trim();
        const clinicId = user?.clinicId ?? null;

        if (
            selectedVeterinarianId === null
            || selectedDate === null
            || selectedSlot === null
            || selectedPetId === null
            || !trimmedTitle
            || clinicId === null
        ) {
            setSuccessMessage(null);
            setErrorMessage('Preencha todas as seleções e o título antes de agendar.');
            return;
        }

        setErrorMessage(null);
        setSuccessMessage(null);

        try {
            const result = await scheduleAppointment.mutateAsync({
                title: trimmedTitle,
                description: description.trim() || undefined,
                petId: selectedPetId,
                clinicId,
                veterinarianId: selectedVeterinarianId,
                dateTime: selectedSlot.startTime,
            });

            setSelectedSlot(null);
            setSelectedPetId(null);
            setTitle('');
            setDescription('');
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
        || !title.trim()
        || clinicId === null
        || scheduleAppointment.isPending;

    return (
        <SafeAreaView style={styles.safeArea} edges={['right', 'bottom', 'left']}>
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.wrapper}>
                        <Text style={styles.eyebrow}>ÁREA DO TUTOR</Text>
                        <Text style={styles.title}>Agendar consulta</Text>
                        <Text style={styles.description}>
                            Escolha um horário livre, o pet e os dados da consulta.
                        </Text>

                        <View style={styles.sectionCard}>
                            <Text style={styles.step}>1</Text>
                            <Text style={styles.sectionTitle}>Escolha o veterinário</Text>

                            {slotsQuery.isPending ? (
                                <View style={styles.inlineState}>
                                    <ActivityIndicator color={colors.primary} />
                                    <Text style={styles.stateMessage}>
                                        Carregando disponibilidades...
                                    </Text>
                                </View>
                            ) : slotsQuery.isError ? (
                                <View style={styles.stateBox}>
                                    <Text style={styles.stateTitle}>Não foi possível carregar</Text>
                                    <Text style={styles.stateMessage}>
                                        Não foi possível consultar os próximos horários livres.
                                    </Text>
                                    <AppButton
                                        label="Tentar novamente"
                                        onPress={() => void slotsQuery.refetch()}
                                        variant="secondary"
                                        size="small"
                                        style={styles.retryButton}
                                    />
                                </View>
                            ) : veterinarians.length === 0 ? (
                                <View style={styles.stateBox}>
                                    <Text style={styles.stateTitle}>Nenhum veterinário disponível</Text>
                                    <Text style={styles.stateMessage}>
                                        Nenhum veterinário da sua clínica possui horários livres publicados.
                                    </Text>
                                </View>
                            ) : (
                                <View style={styles.options}>
                                    {veterinarians.map((veterinarian) => {
                                        const isSelected =
                                            veterinarian.id === selectedVeterinarianId;

                                        return (
                                            <Pressable
                                                key={veterinarian.id}
                                                accessibilityRole="button"
                                                accessibilityState={{ selected: isSelected }}
                                                style={({ pressed }) => [
                                                    styles.veterinarianCard,
                                                    isSelected && styles.optionSelected,
                                                    pressed && styles.optionPressed,
                                                ]}
                                                onPress={() => selectVeterinarian(veterinarian.id)}
                                                disabled={scheduleAppointment.isPending}
                                            >
                                                <View style={styles.veterinarianIcon}>
                                                    <Text style={styles.veterinarianIconText}>VT</Text>
                                                </View>
                                                <View style={styles.veterinarianCopy}>
                                                    <Text style={styles.veterinarianName}>
                                                        {veterinarian.name}
                                                    </Text>
                                                    <Text style={styles.optionHint}>
                                                        Próxima disponibilidade:{' '}
                                                        {formatDate(getDatePart(
                                                            veterinarian.nextAvailability,
                                                        ))}
                                                    </Text>
                                                </View>
                                            </Pressable>
                                        );
                                    })}
                                </View>
                            )}
                        </View>

                        <View style={styles.sectionCard}>
                            <Text style={styles.step}>2</Text>
                            <Text style={styles.sectionTitle}>Datas disponíveis</Text>

                            {selectedVeterinarianId === null ? (
                                <StateMessage text="Selecione um veterinário para ver as datas disponíveis." />
                            ) : availableDates.length === 0 ? (
                                <StateMessage title="Nenhuma data disponível" />
                            ) : (
                                <View style={styles.dateOptions}>
                                    {availableDates.map((date) => {
                                        const isSelected = date === selectedDate;

                                        return (
                                            <Pressable
                                                key={date}
                                                accessibilityRole="button"
                                                accessibilityState={{ selected: isSelected }}
                                                style={({ pressed }) => [
                                                    styles.dateCard,
                                                    isSelected && styles.optionSelected,
                                                    pressed && styles.optionPressed,
                                                ]}
                                                onPress={() => selectDate(date)}
                                                disabled={scheduleAppointment.isPending}
                                            >
                                                <Text style={[
                                                    styles.dateText,
                                                    isSelected && styles.selectedText,
                                                ]}>
                                                    {formatDate(date)}
                                                </Text>
                                            </Pressable>
                                        );
                                    })}
                                </View>
                            )}
                        </View>

                        <View style={styles.sectionCard}>
                            <Text style={styles.step}>3</Text>
                            <Text style={styles.sectionTitle}>Escolha o horário</Text>

                            {selectedVeterinarianId === null ? (
                                <StateMessage text="Selecione um veterinário para continuar." />
                            ) : selectedDate === null ? (
                                <StateMessage text="Selecione uma das datas disponíveis." />
                            ) : selectedDateSlots.length === 0 ? (
                                <StateMessage title="Nenhum horário disponível nesta data." />
                            ) : (
                                <View style={styles.slots}>
                                    <Text style={styles.selectedDateTitle}>
                                        {formatDate(selectedDate)}
                                    </Text>
                                    {selectedDateSlots.map((slot) => {
                                        const isSelected = slot.id === selectedSlot?.id;

                                        return (
                                            <Pressable
                                                key={slot.id}
                                                accessibilityRole="button"
                                                accessibilityState={{ selected: isSelected }}
                                                style={({ pressed }) => [
                                                    styles.slotCard,
                                                    isSelected && styles.slotSelected,
                                                    pressed && styles.optionPressed,
                                                ]}
                                                onPress={() => {
                                                    setSelectedSlot(slot);
                                                    clearFeedback();
                                                }}
                                                disabled={scheduleAppointment.isPending}
                                            >
                                                <Text style={styles.slotTime}>
                                                    {formatSlotTime(slot.startTime)} -{' '}
                                                    {formatSlotTime(slot.endTime)}
                                                </Text>
                                            </Pressable>
                                        );
                                    })}
                                </View>
                            )}
                        </View>

                        <View style={styles.sectionCard}>
                            <Text style={styles.step}>4</Text>
                            <Text style={styles.sectionTitle}>Escolha o pet</Text>

                            {petsQuery.isPending ? (
                                <View style={styles.inlineState}>
                                    <ActivityIndicator color={colors.primary} />
                                    <Text style={styles.stateMessage}>Carregando seus pets...</Text>
                                </View>
                            ) : petsQuery.isError ? (
                                <View style={styles.stateBox}>
                                    <Text style={styles.stateTitle}>Não foi possível carregar seus pets</Text>
                                    <AppButton
                                        label="Tentar novamente"
                                        onPress={() => void petsQuery.refetch()}
                                        variant="secondary"
                                        size="small"
                                        style={styles.retryButton}
                                    />
                                </View>
                            ) : (petsQuery.data?.content.length ?? 0) === 0 ? (
                                <StateMessage title="Nenhum pet encontrado para este Tutor." />
                            ) : (
                                <View style={styles.petOptions}>
                                    {petsQuery.data?.content.map((pet) => {
                                        const isSelected = pet.id === selectedPetId;

                                        return (
                                            <Pressable
                                                key={pet.id}
                                                accessibilityRole="button"
                                                accessibilityState={{ selected: isSelected }}
                                                style={({ pressed }) => [
                                                    styles.petCard,
                                                    isSelected && styles.optionSelected,
                                                    pressed && styles.optionPressed,
                                                ]}
                                                onPress={() => {
                                                    setSelectedPetId(pet.id);
                                                    clearFeedback();
                                                }}
                                                disabled={scheduleAppointment.isPending}
                                            >
                                                <Text style={[
                                                    styles.petName,
                                                    isSelected && styles.selectedText,
                                                ]}>
                                                    {pet.name}
                                                </Text>
                                                <Text style={styles.optionHint}>{pet.species}</Text>
                                            </Pressable>
                                        );
                                    })}
                                </View>
                            )}
                        </View>

                        <View style={styles.sectionCard}>
                            <Text style={styles.step}>5</Text>
                            <Text style={styles.sectionTitle}>Dados da consulta</Text>
                            <View style={styles.fields}>
                                <AppInput
                                    label="Título *"
                                    value={title}
                                    onChangeText={(value) => {
                                        setTitle(value);
                                        clearFeedback();
                                    }}
                                    placeholder="Consulta preventiva"
                                    maxLength={120}
                                    editable={!scheduleAppointment.isPending}
                                />
                                <AppInput
                                    label="Descrição"
                                    value={description}
                                    onChangeText={(value) => {
                                        setDescription(value);
                                        clearFeedback();
                                    }}
                                    placeholder="Ex.: check-up anual"
                                    maxLength={500}
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                    style={styles.descriptionInput}
                                    editable={!scheduleAppointment.isPending}
                                />
                            </View>

                            {clinicId === null ? (
                                <Text style={styles.errorText}>
                                    Não foi possível identificar a clínica da sua sessão.
                                </Text>
                            ) : null}
                            {errorMessage ? (
                                <Text style={styles.errorText}>{errorMessage}</Text>
                            ) : null}
                            {successMessage ? (
                                <Text style={styles.successText}>{successMessage}</Text>
                            ) : null}

                            <AppButton
                                label="Agendar consulta"
                                onPress={() => void handleSubmit()}
                                disabled={isSubmitDisabled}
                                loading={scheduleAppointment.isPending}
                                style={styles.submitButton}
                            />
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
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
    keyboardView: { flex: 1 },
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
    sectionCard: {
        marginBottom: spacing.lg,
        padding: spacing.xl,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.lg,
        backgroundColor: colors.surface,
        ...shadows.card,
    },
    step: {
        width: 28,
        height: 28,
        marginBottom: spacing.md,
        paddingTop: 5,
        borderRadius: radii.pill,
        backgroundColor: colors.primarySoft,
        color: colors.primary,
        fontSize: typography.caption,
        fontWeight: '800',
        textAlign: 'center',
    },
    sectionTitle: { color: colors.text, fontSize: typography.heading, fontWeight: '800' },
    options: { gap: spacing.md, marginTop: spacing.xl },
    veterinarianCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.md,
        backgroundColor: colors.background,
    },
    optionSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
    optionPressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
    veterinarianIcon: {
        width: 42,
        height: 42,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: radii.md,
        backgroundColor: colors.surface,
    },
    veterinarianIconText: { color: colors.primary, fontSize: typography.small, fontWeight: '800' },
    veterinarianCopy: { flex: 1, marginLeft: spacing.md },
    veterinarianName: { color: colors.text, fontSize: typography.body, fontWeight: '800' },
    optionHint: {
        marginTop: spacing.xs,
        color: colors.textSecondary,
        fontSize: typography.small,
        lineHeight: 18,
    },
    dateOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginTop: spacing.xl,
    },
    dateCard: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.pill,
        backgroundColor: colors.background,
    },
    dateText: { color: colors.text, fontSize: typography.caption, fontWeight: '700' },
    selectedText: { color: colors.primaryDark },
    inlineState: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        marginTop: spacing.xl,
        padding: spacing.lg,
    },
    stateBox: {
        alignItems: 'center',
        marginTop: spacing.xl,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.md,
        backgroundColor: colors.background,
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
    slots: { gap: spacing.md, marginTop: spacing.xl },
    selectedDateTitle: { color: colors.text, fontSize: typography.body, fontWeight: '800' },
    slotCard: {
        alignItems: 'center',
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.md,
        backgroundColor: colors.background,
    },
    slotSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
    slotTime: { color: colors.primaryDark, fontSize: typography.body, fontWeight: '800' },
    petOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
        marginTop: spacing.xl,
    },
    petCard: {
        minWidth: 130,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.md,
        backgroundColor: colors.background,
    },
    petName: { color: colors.text, fontSize: typography.body, fontWeight: '800' },
    fields: { gap: spacing.lg, marginTop: spacing.xl },
    descriptionInput: { minHeight: 110, paddingTop: spacing.lg },
    errorText: {
        marginTop: spacing.lg,
        color: colors.danger,
        fontSize: typography.caption,
        lineHeight: 20,
        textAlign: 'center',
    },
    successText: {
        marginTop: spacing.lg,
        color: colors.success,
        fontSize: typography.caption,
        fontWeight: '700',
        lineHeight: 20,
        textAlign: 'center',
    },
    submitButton: { marginTop: spacing.xl },
});
