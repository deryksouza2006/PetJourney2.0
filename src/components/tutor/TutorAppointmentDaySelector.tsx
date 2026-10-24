import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { radii, spacing, ThemeColors, typography } from '../../theme/tokens';

const WEEKDAYS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'] as const;
const MONTHS = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'] as const;

interface DateLabels {
    weekday: string;
    day: string;
    month: string;
    accessibilityLabel: string;
}

function getDateLabels(isoDate: string): DateLabels {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);

    if (!match) {
        return {
            weekday: 'DATA',
            day: isoDate,
            month: '',
            accessibilityLabel: isoDate,
        };
    }

    const year = Number(match[1]);
    const monthIndex = Number(match[2]) - 1;
    const day = Number(match[3]);
    const date = new Date(year, monthIndex, day, 12);

    return {
        weekday: WEEKDAYS[date.getDay()],
        day: String(day).padStart(2, '0'),
        month: MONTHS[monthIndex],
        accessibilityLabel: `${String(day).padStart(2, '0')}/${String(monthIndex + 1).padStart(2, '0')}/${year}`,
    };
}

interface TutorAppointmentDaySelectorProps {
    dates: string[];
    selectedDate: string | null;
    disabled?: boolean;
    onSelect: (date: string) => void;
}

export function TutorAppointmentDaySelector({
    dates,
    selectedDate,
    disabled = false,
    onSelect,
}: TutorAppointmentDaySelectorProps) {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    return (
        <ScrollView
            horizontal
            nestedScrollEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.list}
        >
            {dates.map((date) => {
                const labels = getDateLabels(date);
                const isSelected = date === selectedDate;

                return (
                    <Pressable
                        key={date}
                        accessibilityRole="button"
                        accessibilityLabel={labels.accessibilityLabel}
                        accessibilityState={{ selected: isSelected, disabled }}
                        disabled={disabled}
                        onPress={() => onSelect(date)}
                        style={({ pressed }) => [
                            styles.card,
                            isSelected && styles.cardSelected,
                            pressed && !disabled && styles.cardPressed,
                        ]}
                    >
                        <Text style={[styles.weekday, isSelected && styles.selectedText]}>
                            {labels.weekday}
                        </Text>
                        <Text style={[styles.day, isSelected && styles.selectedText]}>
                            {labels.day}
                        </Text>
                        <Text style={[styles.month, isSelected && styles.selectedText]}>
                            {labels.month}
                        </Text>
                    </Pressable>
                );
            })}
        </ScrollView>
    );
}

function createStyles(colors: ThemeColors) {
    return StyleSheet.create({
        list: { gap: spacing.sm, paddingVertical: spacing.xs, paddingRight: spacing.sm },
        card: {
            width: 76,
            minHeight: 104,
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: spacing.md,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.lg,
            backgroundColor: colors.inputBackground,
        },
        cardSelected: {
            borderColor: colors.primaryAction,
            backgroundColor: colors.primaryAction,
        },
        cardPressed: { opacity: 0.78, transform: [{ scale: 0.97 }] },
        weekday: {
            color: colors.textSecondary,
            fontSize: typography.small,
            fontWeight: '800',
            letterSpacing: 0.8,
        },
        day: {
            marginVertical: spacing.xs,
            color: colors.text,
            fontSize: typography.heading,
            fontWeight: '800',
        },
        month: { color: colors.textSecondary, fontSize: typography.small, fontWeight: '700' },
        selectedText: { color: colors.onPrimary },
    });
}
