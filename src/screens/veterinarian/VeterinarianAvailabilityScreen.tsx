import { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '../../components/AppButton';
import {
    AddAvailabilitySheet,
    AvailabilityTimeOption,
} from '../../components/veterinarian/AddAvailabilitySheet';
import {
    AvailabilityCalendar,
    AvailabilityCalendarDay,
} from '../../components/veterinarian/AvailabilityCalendar';
import { AvailabilitySlotChip } from '../../components/veterinarian/AvailabilitySlotChip';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useCreateVeterinarianAvailability } from '../../hooks/availability/useCreateVeterinarianAvailability';
import { useDeleteVeterinarianAvailability } from '../../hooks/availability/useDeleteVeterinarianAvailability';
import { useVeterinarianAvailabilityMonth } from '../../hooks/availability/useVeterinarianAvailabilityMonth';
import { radii, spacing, ThemeColors, typography } from '../../theme/tokens';
import {
    VeterinarianAvailability,
    VeterinarianAvailabilityRequest,
} from '../../types/veterinarianAvailability';
import { getApiErrorMessage } from '../../utils/apiError';

const MONTH_NAMES = [
    'janeiro',
    'fevereiro',
    'março',
    'abril',
    'maio',
    'junho',
    'julho',
    'agosto',
    'setembro',
    'outubro',
    'novembro',
    'dezembro',
] as const;

const WEEKDAY_NAMES = [
    'domingo',
    'segunda-feira',
    'terça-feira',
    'quarta-feira',
    'quinta-feira',
    'sexta-feira',
    'sábado',
] as const;

const SLOT_INTERVAL_MINUTES = 30;
const FIRST_SLOT_MINUTES = 8 * 60;
const LAST_SLOT_MINUTES = 18 * 60;

function pad(value: number): string {
    return String(value).padStart(2, '0');
}

function toDateKey(date: Date): string {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseDateKey(dateKey: string): Date {
    const [year, month, day] = dateKey.split('-').map(Number);
    return new Date(year, month - 1, day);
}

function getDateKey(dateTime: string): string {
    const match = /^(\d{4}-\d{2}-\d{2})/.exec(dateTime);
    return match?.[1] ?? '';
}

function formatTime(dateTime: string): string {
    const match = /T(\d{2}:\d{2})/.exec(dateTime);
    return match?.[1] ?? dateTime;
}

function formatMinutes(totalMinutes: number): string {
    return `${pad(Math.floor(totalMinutes / 60))}:${pad(totalMinutes % 60)}`;
}

function getTimeMinutes(dateTime: string): number | null {
    const match = /T(\d{2}):(\d{2})/.exec(dateTime);

    if (!match) {
        return null;
    }

    return Number(match[1]) * 60 + Number(match[2]);
}

const SLOT_TIMES = Array.from(
    { length: Math.floor((LAST_SLOT_MINUTES - FIRST_SLOT_MINUTES) / SLOT_INTERVAL_MINUTES) + 1 },
    (_, index) => formatMinutes(FIRST_SLOT_MINUTES + index * SLOT_INTERVAL_MINUTES),
);

function formatFriendlyDate(dateKey: string): string {
    const date = parseDateKey(dateKey);
    const weekday = WEEKDAY_NAMES[date.getDay()];
    const formatted = `${weekday}, ${date.getDate()} de ${MONTH_NAMES[date.getMonth()]}`;

    return `${formatted.charAt(0).toUpperCase()}${formatted.slice(1)}`;
}

function formatMonthLabel(month: Date): string {
    const label = `${MONTH_NAMES[month.getMonth()]} ${month.getFullYear()}`;
    return `${label.charAt(0).toUpperCase()}${label.slice(1)}`;
}

function getMonthRange(month: Date): { start: string; end: string } {
    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
    const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    return {
        start: `${toDateKey(firstDay)}T00:00:00`,
        end: `${toDateKey(lastDay)}T23:59:59`,
    };
}

function buildCalendarDays(
    month: Date,
    datesWithAvailability: ReadonlySet<string>,
    todayKey: string,
): Array<AvailabilityCalendarDay | null> {
    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    return Array.from({ length: 42 }, (_, index) => {
        const day = index - firstDay.getDay() + 1;

        if (day < 1 || day > daysInMonth) {
            return null;
        }

        const dateKey = toDateKey(new Date(month.getFullYear(), month.getMonth(), day));

        return {
            dateKey,
            day,
            hasAvailability: datesWithAvailability.has(dateKey),
            isToday: dateKey === todayKey,
            isPast: dateKey < todayKey,
        };
    });
}

function isTimeSelectable(dateKey: string, time: string, now: Date): boolean {
    const todayKey = toDateKey(now);

    if (dateKey > todayKey) {
        return true;
    }

    if (dateKey < todayKey) {
        return false;
    }

    const [hour, minute] = time.split(':').map(Number);
    const optionMinutes = hour * 60 + minute;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    return optionMinutes > currentMinutes;
}

function overlapsExistingSlot(
    time: string,
    existingSlots: VeterinarianAvailability[],
): boolean {
    const [hour, minute] = time.split(':').map(Number);
    const optionStart = hour * 60 + minute;
    const optionEnd = optionStart + SLOT_INTERVAL_MINUTES;

    return existingSlots.some((slot) => {
        const existingStart = getTimeMinutes(slot.startTime);
        const existingEnd = getTimeMinutes(slot.endTime);

        if (existingStart === null || existingEnd === null) {
            return formatTime(slot.startTime) === time;
        }

        return optionStart < existingEnd && optionEnd > existingStart;
    });
}

export function VeterinarianAvailabilityScreen() {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const { user } = useAuth();
    const veterinarianId = user?.veterinarianId ?? null;
    const [currentTime, setCurrentTime] = useState(() => new Date());
    const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));
    const [displayMonth, setDisplayMonth] = useState(() => {
        const today = new Date();
        return new Date(today.getFullYear(), today.getMonth(), 1);
    });
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [selectedTimes, setSelectedTimes] = useState<Set<string>>(() => new Set());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [creationError, setCreationError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const todayKey = toDateKey(currentTime);
    const currentMonthStart = new Date(
        currentTime.getFullYear(),
        currentTime.getMonth(),
        1,
    );
    const canNavigatePrevious = displayMonth.getTime() > currentMonthStart.getTime();
    const monthRange = useMemo(() => getMonthRange(displayMonth), [displayMonth]);
    const availability = useVeterinarianAvailabilityMonth(
        veterinarianId,
        monthRange.start,
        monthRange.end,
    );
    const createAvailability = useCreateVeterinarianAvailability();
    const deleteAvailability = useDeleteVeterinarianAvailability();
    const monthSlots = availability.data ?? [];
    const datesWithAvailability = useMemo(
        () => new Set(monthSlots.map((slot) => getDateKey(slot.startTime)).filter(Boolean)),
        [monthSlots],
    );
    const calendarDays = useMemo(
        () => buildCalendarDays(displayMonth, datesWithAvailability, todayKey),
        [datesWithAvailability, displayMonth, todayKey],
    );
    const selectedDateSlots = useMemo(
        () => monthSlots
            .filter((slot) => getDateKey(slot.startTime) === selectedDate)
            .sort((first, second) => first.startTime.localeCompare(second.startTime)),
        [monthSlots, selectedDate],
    );
    const timeOptions = useMemo<AvailabilityTimeOption[]>(
        () => SLOT_TIMES
            .filter((time) => isTimeSelectable(selectedDate, time, currentTime))
            .map((time) => ({
                time,
                isRegistered: overlapsExistingSlot(time, selectedDateSlots),
            })),
        [currentTime, selectedDate, selectedDateSlots],
    );

    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(new Date()), 60_000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (selectedDate >= todayKey) {
            return;
        }

        const today = parseDateKey(todayKey);
        setSelectedDate(todayKey);
        setDisplayMonth(new Date(today.getFullYear(), today.getMonth(), 1));
        setIsSheetOpen(false);
        setSelectedTimes(new Set());
        setCreationError(null);
        setSuccessMessage(null);
    }, [selectedDate, todayKey]);

    function changeMonth(offset: number): void {
        const nextMonth = new Date(
            displayMonth.getFullYear(),
            displayMonth.getMonth() + offset,
            1,
        );

        if (nextMonth.getTime() < currentMonthStart.getTime()) {
            return;
        }

        const currentSelectedDay = parseDateKey(selectedDate).getDate();
        const lastDayOfNextMonth = new Date(
            nextMonth.getFullYear(),
            nextMonth.getMonth() + 1,
            0,
        ).getDate();
        let nextSelectedDate = new Date(
            nextMonth.getFullYear(),
            nextMonth.getMonth(),
            Math.min(currentSelectedDay, lastDayOfNextMonth),
        );

        if (toDateKey(nextSelectedDate) < todayKey) {
            nextSelectedDate = parseDateKey(todayKey);
        }

        setDisplayMonth(nextMonth);
        setSelectedDate(toDateKey(nextSelectedDate));
        setSuccessMessage(null);
    }

    function selectDate(dateKey: string): void {
        if (dateKey < todayKey) {
            return;
        }

        setSelectedDate(dateKey);
        setSuccessMessage(null);
    }

    function openSheet(): void {
        const now = new Date();

        if (!SLOT_TIMES.some((time) => isTimeSelectable(selectedDate, time, now))) {
            setCurrentTime(now);
            return;
        }

        setCurrentTime(now);
        setSelectedTimes(new Set());
        setCreationError(null);
        setSuccessMessage(null);
        setIsSheetOpen(true);
    }

    function closeSheet(): void {
        if (isSubmitting) {
            return;
        }

        setIsSheetOpen(false);
        setSelectedTimes(new Set());
        setCreationError(null);
    }

    function toggleTime(time: string): void {
        setCreationError(null);
        setSelectedTimes((current) => {
            const next = new Set(current);

            if (next.has(time)) {
                next.delete(time);
            } else {
                next.add(time);
            }

            return next;
        });
    }

    async function handleCreate(): Promise<void> {
        if (veterinarianId === null || selectedTimes.size === 0 || isSubmitting) {
            return;
        }

        const times = [...selectedTimes].sort();
        const now = new Date();
        const selectableTimes = times.filter(
            (time) => isTimeSelectable(selectedDate, time, now),
        );

        setCurrentTime(now);

        if (selectableTimes.length !== times.length) {
            setSelectedTimes(new Set(selectableTimes));
            setCreationError('Um ou mais horários já passaram. Selecione outro horário.');
            return;
        }

        const failedTimes: string[] = [];
        let firstError: unknown;
        let createdCount = 0;

        setIsSubmitting(true);
        setCreationError(null);

        for (const time of times) {
            const [hour, minute] = time.split(':').map(Number);
            const endTime = formatMinutes(hour * 60 + minute + SLOT_INTERVAL_MINUTES);
            const request: VeterinarianAvailabilityRequest = {
                veterinarianId,
                startTime: `${selectedDate}T${time}:00`,
                endTime: `${selectedDate}T${endTime}:00`,
            };

            try {
                await createAvailability.mutateAsync(request);
                createdCount += 1;
            } catch (error: unknown) {
                firstError ??= error;
                failedTimes.push(time);
            }
        }

        const refreshedAvailability = await availability.refetch();

        if (failedTimes.length === 0) {
            setIsSheetOpen(false);
            setSelectedTimes(new Set());
            setSuccessMessage(
                createdCount === 1
                    ? 'Horário adicionado com sucesso.'
                    : `${createdCount} horários adicionados com sucesso.`,
            );
        } else {
            const refreshedDateSlots = (refreshedAvailability.data ?? [])
                .filter((slot) => getDateKey(slot.startTime) === selectedDate);
            const retryableFailedTimes = failedTimes.filter(
                (time) => !overlapsExistingSlot(time, refreshedDateSlots),
            );

            setSelectedTimes(new Set(retryableFailedTimes));
            const apiMessage = getApiErrorMessage(
                firstError,
                'Não foi possível adicionar um ou mais horários.',
            );
            setCreationError(
                createdCount > 0
                    ? `${createdCount} de ${times.length} horários foram adicionados. ${apiMessage}`
                    : apiMessage,
            );
        }

        setIsSubmitting(false);
    }

    async function handleDelete(id: number): Promise<void> {
        setSuccessMessage(null);

        try {
            await deleteAvailability.mutateAsync(id);
            setSuccessMessage('Horário removido com sucesso.');
        } catch (error: unknown) {
            Alert.alert(
                'Não foi possível remover',
                getApiErrorMessage(error, 'Não foi possível remover o horário. Tente novamente.'),
            );
        }
    }

    function confirmDelete(item: VeterinarianAvailability): void {
        if (deleteAvailability.isPending || isSubmitting) {
            return;
        }

        Alert.alert(
            'Remover horário?',
            `${formatFriendlyDate(selectedDate)}, das ${formatTime(item.startTime)} às ${formatTime(item.endTime)}.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Remover',
                    style: 'destructive',
                    onPress: () => void handleDelete(item.id),
                },
            ],
        );
    }

    const availableCount = selectedDateSlots.length;
    const countLabel = availableCount === 1 ? '1 disponível' : `${availableCount} disponíveis`;
    const isTodayClosed = selectedDate === todayKey && timeOptions.length === 0;
    const canAdd = veterinarianId !== null
        && !availability.isError
        && !availability.isPending
        && selectedDate >= todayKey
        && timeOptions.length > 0;

    return (
        <SafeAreaView style={styles.safeArea} edges={['right', 'bottom', 'left']}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <AvailabilityCalendar
                    monthLabel={formatMonthLabel(displayMonth)}
                    days={calendarDays}
                    selectedDate={selectedDate}
                    isLoading={availability.isFetching}
                    canNavigatePrevious={canNavigatePrevious}
                    onPreviousMonth={() => changeMonth(-1)}
                    onNextMonth={() => changeMonth(1)}
                    onSelectDate={selectDate}
                />

                <View style={styles.scheduleSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>HORÁRIOS</Text>
                        {!availability.isPending && !availability.isError ? (
                            <Text style={styles.count}>{countLabel}</Text>
                        ) : null}
                    </View>
                    <Text style={styles.selectedDate}>{formatFriendlyDate(selectedDate)}</Text>

                    {successMessage ? (
                        <View style={styles.successContainer} accessibilityLiveRegion="polite">
                            <Text style={styles.successText}>{successMessage}</Text>
                        </View>
                    ) : null}

                    {veterinarianId === null ? (
                        <View style={styles.stateCard}>
                            <Text style={styles.stateTitle}>Sessão não identificada</Text>
                            <Text style={styles.stateMessage}>
                                Não foi possível identificar o veterinário da sessão.
                            </Text>
                        </View>
                    ) : availability.isPending ? (
                        <View style={styles.loadingState}>
                            <ActivityIndicator color={colors.primary} />
                            <Text style={styles.stateMessage}>Carregando horários...</Text>
                        </View>
                    ) : availability.isError ? (
                        <View style={styles.stateCard}>
                            <Text style={styles.stateTitle}>Não foi possível carregar</Text>
                            <Text style={styles.stateMessage}>
                                Não foi possível carregar sua disponibilidade deste mês.
                            </Text>
                            <AppButton
                                label="Tentar novamente"
                                onPress={() => void availability.refetch()}
                                variant="secondary"
                                size="small"
                                style={styles.retryButton}
                            />
                        </View>
                    ) : selectedDateSlots.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.stateMessage}>
                                {isTodayClosed
                                    ? 'O horário de atendimento de hoje já foi encerrado.'
                                    : 'Nenhum horário disponível neste dia.'}
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.slotGrid}>
                            {selectedDateSlots.map((slot) => {
                                const isRemoving = deleteAvailability.isPending
                                    && deleteAvailability.variables === slot.id;

                                return (
                                    <AvailabilitySlotChip
                                        key={slot.id}
                                        time={formatTime(slot.startTime)}
                                        isRemoving={isRemoving}
                                        disabled={deleteAvailability.isPending || isSubmitting}
                                        onRemove={() => confirmDelete(slot)}
                                    />
                                );
                            })}
                        </View>
                    )}

                    {isTodayClosed && selectedDateSlots.length > 0 ? (
                        <View style={styles.closedState}>
                            <Text style={styles.stateMessage}>
                                O horário de atendimento de hoje já foi encerrado.
                            </Text>
                        </View>
                    ) : null}

                    {canAdd ? (
                        <AppButton
                            label="Adicionar horário"
                            onPress={openSheet}
                            disabled={deleteAvailability.isPending}
                            style={styles.addButton}
                        />
                    ) : null}
                </View>
            </ScrollView>

            <AddAvailabilitySheet
                visible={isSheetOpen}
                dateLabel={formatFriendlyDate(selectedDate)}
                options={timeOptions}
                selectedTimes={selectedTimes}
                isSubmitting={isSubmitting}
                errorMessage={creationError}
                onToggleTime={toggleTime}
                onConfirm={() => void handleCreate()}
                onCancel={closeSheet}
            />
        </SafeAreaView>
    );
}

function createStyles(colors: ThemeColors) {
    return StyleSheet.create({
        safeArea: { flex: 1, backgroundColor: colors.background },
        scroll: { flex: 1, backgroundColor: colors.background },
        content: {
            width: '100%',
            maxWidth: 760,
            alignSelf: 'center',
            padding: spacing.lg,
            paddingBottom: spacing.xxl,
        },
        scheduleSection: { marginTop: spacing.xl },
        sectionHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: spacing.md,
        },
        sectionTitle: {
            color: colors.text,
            fontSize: typography.small,
            fontWeight: '800',
            letterSpacing: 1.3,
        },
        count: { color: colors.primary, fontSize: typography.caption, fontWeight: '700' },
        selectedDate: {
            marginTop: spacing.sm,
            color: colors.text,
            fontSize: typography.body,
            fontWeight: '700',
        },
        successContainer: {
            marginTop: spacing.lg,
            padding: spacing.md,
            borderLeftWidth: 3,
            borderLeftColor: colors.success,
            borderRadius: radii.sm,
            backgroundColor: colors.successSurface,
        },
        successText: { color: colors.success, fontSize: typography.caption, lineHeight: 20 },
        slotGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: spacing.sm,
            marginTop: spacing.lg,
        },
        stateCard: {
            alignItems: 'center',
            marginTop: spacing.lg,
            padding: spacing.xl,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.lg,
            backgroundColor: colors.surface,
        },
        loadingState: {
            minHeight: 100,
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.sm,
        },
        emptyState: {
            alignItems: 'center',
            marginTop: spacing.lg,
            padding: spacing.xl,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.lg,
            backgroundColor: colors.surface,
        },
        closedState: {
            marginTop: spacing.lg,
            padding: spacing.lg,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.lg,
            backgroundColor: colors.surface,
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
        retryButton: { marginTop: spacing.lg },
        addButton: { width: '100%', marginTop: spacing.xl },
    });
}
