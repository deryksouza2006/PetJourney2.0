import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors, radii, spacing, typography } from '../theme/tokens';

interface AppButtonProps {
    label: string;
    onPress: () => void;
    disabled?: boolean;
    loading?: boolean;
}

export function AppButton({ label, onPress, disabled = false, loading = false }: AppButtonProps) {
    const isDisabled = disabled || loading;

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: isDisabled, busy: loading }}
            style={({ pressed }) => [
                styles.button,
                pressed && !isDisabled && styles.buttonPressed,
                isDisabled && styles.buttonDisabled,
            ]}
            onPress={onPress}
            disabled={isDisabled}
        >
            {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.label}>{label}</Text>}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        minHeight: 54,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.xl,
        borderRadius: radii.md,
        backgroundColor: colors.primary,
    },
    buttonPressed: { backgroundColor: colors.primaryDark, transform: [{ scale: 0.99 }] },
    buttonDisabled: { opacity: 0.6 },
    label: { color: colors.white, fontSize: typography.body, fontWeight: '700' },
});
