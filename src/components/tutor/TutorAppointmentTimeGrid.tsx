import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { radii, spacing, ThemeColors, typography } from '../../theme/tokens';
import { VeterinarianAvailability } from '../../types/veterinarianAvailability';

function formatTime(dateTime: string): string {
    const match = /T(\d{2}:\d{2})/.exec(dateTime);

    return match?.[1] ?? dateTime;
}

interface TutorAppointmentTimeGridProps {
    slots: VeterinarianAvailability[];
    selectedSlotId: number | null;
    disabled?: boolean;
    onSelect: (slot: VeterinarianAvailability) => void;
}

export function TutorAppointmentTimeGrid({
    slots,
    selectedSlotId,
    disabled = false,
    onSelect,
}: TutorAppointmentTimeGridProps) {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    return (
        <View style={styles.grid}>
            {slots.map((slot) => {
                const isSelected = slot.id === selectedSlotId;
                const label = `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`;

                return (
                    <Pressable
                        key={slot.id}
                        accessibilityRole="button"
                        accessibilityLabel={`Horário ${label}`}
                        accessibilityState={{ selected: isSelected, disabled }}
                        disabled={disabled}
                        onPress={() => onSelect(slot)}
                        style={({ pressed }) => [
                            styles.slot,
                            isSelected && styles.slotSelected,
                            pressed && !disabled && styles.slotPressed,
                        ]}
                    >
                        {isSelected ? (
                            <Ionicons name="checkmark-circle" size={17} color={colors.onPrimary} />
                        ) : null}
                        <Text style={[styles.time, isSelected && styles.timeSelected]}>
                            {label}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
}

function createStyles(colors: ThemeColors) {
    return StyleSheet.create({
        grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
        slot: {
            minWidth: 132,
            minHeight: 50,
            flexGrow: 1,
            flexBasis: '46%',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.xs,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.md,
            backgroundColor: colors.inputBackground,
        },
        slotSelected: {
            borderColor: colors.primaryAction,
            backgroundColor: colors.primaryAction,
        },
        slotPressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
        time: { color: colors.text, fontSize: typography.caption, fontWeight: '800' },
        timeSelected: { color: colors.onPrimary },
    });
}
