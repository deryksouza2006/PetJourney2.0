import {
    ActivityIndicator,
    Pressable,
    StyleProp,
    StyleSheet,
    Text,
    ViewStyle,
} from 'react-native';
import { colors, createThemedStyles, radii, spacing, typography } from '../theme/tokens';

type AppButtonVariant = 'primary' | 'secondary' | 'danger';
type AppButtonSize = 'default' | 'small';

interface AppButtonProps {
    label: string;
    onPress: () => void;
    disabled?: boolean;
    loading?: boolean;
    variant?: AppButtonVariant;
    size?: AppButtonSize;
    style?: StyleProp<ViewStyle>;
}

export function AppButton({
    label,
    onPress,
    disabled = false,
    loading = false,
    variant = 'primary',
    size = 'default',
    style,
}: AppButtonProps) {
    const isDisabled = disabled || loading;
    const activityColor = variant === 'primary'
        ? colors.onPrimary
        : variant === 'danger'
            ? colors.danger
            : colors.primary;

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: isDisabled, busy: loading }}
            style={({ pressed }) => [
                styles.button,
                styles[variant],
                size === 'small' && styles.buttonSmall,
                pressed && !isDisabled && variant === 'primary' && styles.primaryPressed,
                pressed && !isDisabled && variant !== 'primary' && styles.outlinePressed,
                isDisabled && styles.buttonDisabled,
                style,
            ]}
            onPress={onPress}
            disabled={isDisabled}
        >
            {loading ? (
                <ActivityIndicator color={activityColor} />
            ) : (
                <Text style={[styles.label, styles[`${variant}Label`]]}>{label}</Text>
            )}
        </Pressable>
    );
}

const styles = createThemedStyles((colors) => ({
    button: {
        minHeight: 54,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.xl,
        borderRadius: radii.md,
        backgroundColor: colors.primaryAction,
    },
    primary: { backgroundColor: colors.primaryAction },
    secondary: {
        borderWidth: 1,
        borderColor: colors.primary,
        backgroundColor: colors.primarySoft,
    },
    danger: {
        borderWidth: 1,
        borderColor: colors.danger,
        backgroundColor: colors.surface,
    },
    buttonSmall: { minHeight: 46, paddingHorizontal: spacing.lg },
    primaryPressed: { backgroundColor: colors.primaryActionPressed, transform: [{ scale: 0.99 }] },
    outlinePressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
    buttonDisabled: { opacity: 0.6 },
    label: { color: colors.onPrimary, fontSize: typography.body, fontWeight: '700' },
    primaryLabel: { color: colors.onPrimary },
    secondaryLabel: { color: colors.primary },
    dangerLabel: { color: colors.danger },
}));
