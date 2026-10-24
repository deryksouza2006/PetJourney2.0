import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { radii, shadows, spacing, ThemeColors, typography } from '../../theme/tokens';

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'] as const;

export interface AvailabilityCalendarDay {
    dateKey: string;
    day: number;
    hasAvailability: boolean;
    isToday: boolean;
    isPast: boolean;
}

interface AvailabilityCalendarProps {
    monthLabel: string;
    days: Array<AvailabilityCalendarDay | null>;
    selectedDate: string;
    isLoading?: boolean;
    canNavigatePrevious?: boolean;
    onPreviousMonth: () => void;
    onNextMonth: () => void;
    onSelectDate: (dateKey: string) => void;
}

export function AvailabilityCalendar({
    monthLabel,
    days,
    selectedDate,
    isLoading = false,
    canNavigatePrevious = true,
    onPreviousMonth,
    onNextMonth,
    onSelectDate,
}: AvailabilityCalendarProps) {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    return (
        <View style={styles.card}>
            <View style={styles.monthHeader}>
                <Text style={styles.monthLabel}>{monthLabel}</Text>
                <View style={styles.monthActions}>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Mês anterior"
                        accessibilityState={{ disabled: !canNavigatePrevious }}
                        hitSlop={8}
                        onPress={onPreviousMonth}
                        disabled={!canNavigatePrevious}
                        style={({ pressed }) => [
                            styles.arrowButton,
                            !canNavigatePrevious && styles.disabledArrowButton,
                            pressed && canNavigatePrevious && styles.pressed,
                        ]}
                    >
                        <Ionicons
                            name="chevron-back"
                            size={20}
                            color={canNavigatePrevious ? colors.text : colors.textSecondary}
                        />
                    </Pressable>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Próximo mês"
                        hitSlop={8}
                        onPress={onNextMonth}
                        style={({ pressed }) => [styles.arrowButton, pressed && styles.pressed]}
                    >
                        <Ionicons name="chevron-forward" size={20} color={colors.text} />
                    </Pressable>
                </View>
            </View>

            <View style={styles.weekRow}>
                {WEEKDAYS.map((weekday, index) => (
                    <View key={`${weekday}-${index}`} style={styles.weekCell}>
                        <Text style={styles.weekday}>{weekday}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.dayGrid}>
                {days.map((calendarDay, index) => {
                    if (!calendarDay) {
                        return <View key={`empty-${index}`} style={styles.dayCell} />;
                    }

                    const isSelected = calendarDay.dateKey === selectedDate;
                    const availabilityDescription = calendarDay.hasAvailability
                        ? ', com horários cadastrados'
                        : '';
                    const disabledDescription = calendarDay.isPast ? ', indisponível' : '';

                    return (
                        <View key={calendarDay.dateKey} style={styles.dayCell}>
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={`Dia ${calendarDay.day}${availabilityDescription}${disabledDescription}`}
                                accessibilityState={{
                                    selected: isSelected,
                                    disabled: calendarDay.isPast,
                                }}
                                onPress={() => onSelectDate(calendarDay.dateKey)}
                                disabled={calendarDay.isPast}
                                style={({ pressed }) => [
                                    styles.dayButton,
                                    calendarDay.isPast && styles.pastDayButton,
                                    calendarDay.isToday && styles.todayButton,
                                    isSelected && styles.selectedDayButton,
                                    pressed && !calendarDay.isPast && styles.pressed,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.dayText,
                                        calendarDay.isPast && styles.pastDayText,
                                        calendarDay.isToday && styles.todayText,
                                        isSelected && styles.selectedDayText,
                                    ]}
                                >
                                    {calendarDay.day}
                                </Text>
                                <View
                                    style={[
                                        styles.dot,
                                        calendarDay.hasAvailability && styles.dotVisible,
                                        calendarDay.isPast && styles.pastDot,
                                        isSelected && calendarDay.hasAvailability && styles.selectedDot,
                                    ]}
                                />
                            </Pressable>
                        </View>
                    );
                })}
            </View>

            {isLoading ? (
                <Text style={styles.loadingHint}>Atualizando disponibilidade...</Text>
            ) : null}
        </View>
    );
}

function createStyles(colors: ThemeColors) {
    return StyleSheet.create({
        card: {
            padding: spacing.lg,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.lg,
            backgroundColor: colors.surface,
            ...shadows.card,
        },
        monthHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: spacing.lg,
        },
        monthLabel: {
            color: colors.text,
            fontSize: typography.heading,
            fontWeight: '800',
            textTransform: 'capitalize',
        },
        monthActions: { flexDirection: 'row', gap: spacing.sm },
        arrowButton: {
            width: 42,
            height: 42,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.pill,
            backgroundColor: colors.inputBackground,
        },
        disabledArrowButton: { opacity: 0.45 },
        pressed: { opacity: 0.72 },
        weekRow: { flexDirection: 'row', marginBottom: spacing.xs },
        weekCell: { width: '14.2857%', alignItems: 'center' },
        weekday: {
            color: colors.textSecondary,
            fontSize: typography.small,
            fontWeight: '800',
        },
        dayGrid: { flexDirection: 'row', flexWrap: 'wrap' },
        dayCell: {
            width: '14.2857%',
            minHeight: 48,
            alignItems: 'center',
            justifyContent: 'center',
        },
        dayButton: {
            width: 42,
            height: 42,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: 'transparent',
            borderRadius: radii.pill,
        },
        todayButton: { borderColor: colors.primary },
        pastDayButton: { opacity: 0.48 },
        selectedDayButton: {
            borderColor: colors.primaryAction,
            backgroundColor: colors.primaryAction,
        },
        dayText: { color: colors.text, fontSize: typography.caption, fontWeight: '600' },
        pastDayText: { color: colors.textSecondary },
        todayText: { color: colors.primary, fontWeight: '800' },
        selectedDayText: { color: colors.onPrimary, fontWeight: '800' },
        dot: {
            position: 'absolute',
            bottom: 4,
            width: 4,
            height: 4,
            borderRadius: radii.pill,
            backgroundColor: 'transparent',
        },
        dotVisible: { backgroundColor: colors.primary },
        pastDot: { backgroundColor: colors.textSecondary },
        selectedDot: { backgroundColor: colors.onPrimary },
        loadingHint: {
            marginTop: spacing.sm,
            color: colors.textSecondary,
            fontSize: typography.small,
            textAlign: 'center',
        },
    });
}
