import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { radii, spacing, ThemeColors, typography } from '../../theme/tokens';

export type AppointmentReason =
    | 'CHECK_UP'
    | 'VACCINATION'
    | 'FOLLOW_UP'
    | 'DEWORMING'
    | 'OTHER';

export const APPOINTMENT_REASON_TITLES: Record<
    Exclude<AppointmentReason, 'OTHER'>,
    string
> = {
    CHECK_UP: 'Check-up',
    VACCINATION: 'Vacinação',
    FOLLOW_UP: 'Retorno',
    DEWORMING: 'Vermifugação',
};

const REASONS: ReadonlyArray<{ value: AppointmentReason; label: string }> = [
    { value: 'CHECK_UP', label: 'Check-up' },
    { value: 'VACCINATION', label: 'Vacinação' },
    { value: 'FOLLOW_UP', label: 'Retorno' },
    { value: 'DEWORMING', label: 'Vermifugação' },
    { value: 'OTHER', label: 'Outro' },
];

interface TutorAppointmentReasonChipsProps {
    selectedReason: AppointmentReason | null;
    disabled?: boolean;
    onSelect: (reason: AppointmentReason) => void;
}

export function TutorAppointmentReasonChips({
    selectedReason,
    disabled = false,
    onSelect,
}: TutorAppointmentReasonChipsProps) {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    return (
        <View style={styles.list}>
            {REASONS.map((reason) => {
                const isSelected = reason.value === selectedReason;

                return (
                    <Pressable
                        key={reason.value}
                        accessibilityRole="button"
                        accessibilityState={{ selected: isSelected, disabled }}
                        disabled={disabled}
                        onPress={() => onSelect(reason.value)}
                        style={({ pressed }) => [
                            styles.chip,
                            isSelected && styles.chipSelected,
                            pressed && !disabled && styles.chipPressed,
                        ]}
                    >
                        <Text style={[styles.label, isSelected && styles.labelSelected]}>
                            {reason.label}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
}

function createStyles(colors: ThemeColors) {
    return StyleSheet.create({
        list: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
        chip: {
            minHeight: 44,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: spacing.lg,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.pill,
            backgroundColor: colors.inputBackground,
        },
        chipSelected: {
            borderColor: colors.primaryAction,
            backgroundColor: colors.primaryAction,
        },
        chipPressed: { opacity: 0.78, transform: [{ scale: 0.97 }] },
        label: { color: colors.text, fontSize: typography.caption, fontWeight: '700' },
        labelSelected: { color: colors.onPrimary },
    });
}
