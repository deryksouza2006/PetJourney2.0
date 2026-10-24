import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { radii, spacing, ThemeColors, typography } from '../../theme/tokens';

interface AvailabilitySlotChipProps {
    time: string;
    isRemoving: boolean;
    disabled: boolean;
    onRemove: () => void;
}

export function AvailabilitySlotChip({
    time,
    isRemoving,
    disabled,
    onRemove,
}: AvailabilitySlotChipProps) {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    return (
        <View style={styles.chip}>
            <Text style={styles.time}>{time}</Text>
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Remover horário ${time}`}
                accessibilityState={{ disabled: disabled || isRemoving, busy: isRemoving }}
                hitSlop={8}
                disabled={disabled || isRemoving}
                onPress={onRemove}
                style={({ pressed }) => [styles.removeButton, pressed && styles.pressed]}
            >
                {isRemoving ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                    <Ionicons name="close" size={17} color={colors.primary} />
                )}
            </Pressable>
        </View>
    );
}

function createStyles(colors: ThemeColors) {
    return StyleSheet.create({
        chip: {
            width: '31%',
            minWidth: 96,
            maxWidth: 148,
            minHeight: 48,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: spacing.xs,
            paddingLeft: spacing.md,
            paddingRight: spacing.sm,
            borderWidth: 1,
            borderColor: colors.primary,
            borderRadius: radii.md,
            backgroundColor: colors.primarySoft,
        },
        time: { color: colors.primary, fontSize: typography.caption, fontWeight: '800' },
        removeButton: {
            width: 30,
            height: 30,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: radii.pill,
        },
        pressed: { backgroundColor: colors.overlayLight },
    });
}
