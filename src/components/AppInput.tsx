import Ionicons from '@expo/vector-icons/Ionicons';
import { forwardRef, useState } from 'react';
import {
    Pressable,
    StyleProp,
    Text,
    TextInput,
    TextInputProps,
    View,
    ViewStyle,
} from 'react-native';
import { colors, createThemedStyles, radii, spacing, typography } from '../theme/tokens';

export interface AppInputProps extends TextInputProps {
    label: string;
    error?: string | null;
    helperText?: string;
    showPasswordToggle?: boolean;
    containerStyle?: StyleProp<ViewStyle>;
}

export const AppInput = forwardRef<TextInput, AppInputProps>(({
    label,
    error,
    helperText,
    showPasswordToggle = false,
    containerStyle,
    style,
    editable = true,
    multiline = false,
    secureTextEntry = false,
    accessibilityLabel,
    onFocus,
    onBlur,
    ...props
}, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const hasPasswordToggle = secureTextEntry && showPasswordToggle;

    return (
        <View style={[styles.container, containerStyle]}>
            <Text style={styles.label}>{label}</Text>
            <View
                style={[
                    styles.inputContainer,
                    multiline && styles.multilineContainer,
                    isFocused && styles.inputContainerFocused,
                    Boolean(error) && styles.inputContainerError,
                    !editable && styles.inputContainerDisabled,
                ]}
            >
                <TextInput
                    ref={ref}
                    style={[styles.input, multiline && styles.multilineInput, style]}
                    placeholderTextColor={colors.textSecondary}
                    selectionColor={colors.primary}
                    accessibilityLabel={accessibilityLabel ?? label}
                    accessibilityState={{ disabled: !editable }}
                    editable={editable}
                    multiline={multiline}
                    secureTextEntry={secureTextEntry && !isPasswordVisible}
                    onFocus={(event) => {
                        setIsFocused(true);
                        onFocus?.(event);
                    }}
                    onBlur={(event) => {
                        setIsFocused(false);
                        onBlur?.(event);
                    }}
                    {...props}
                />
                {hasPasswordToggle ? (
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={isPasswordVisible ? 'Ocultar senha' : 'Mostrar senha'}
                        hitSlop={8}
                        style={({ pressed }) => [
                            styles.passwordToggle,
                            pressed && styles.passwordTogglePressed,
                        ]}
                        onPress={() => setIsPasswordVisible((visible) => !visible)}
                        disabled={!editable}
                    >
                        <Ionicons
                            name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                            size={21}
                            color={colors.textSecondary}
                        />
                    </Pressable>
                ) : null}
            </View>
            {error ? (
                <Text
                    style={styles.error}
                    accessibilityLiveRegion="polite"
                >
                    {error}
                </Text>
            ) : helperText ? (
                <Text style={styles.helper}>{helperText}</Text>
            ) : null}
        </View>
    );
});

AppInput.displayName = 'AppInput';

const styles = createThemedStyles((themeColors) => ({
    container: { gap: spacing.sm },
    label: {
        color: themeColors.text,
        fontSize: typography.caption,
        fontWeight: '700',
    },
    inputContainer: {
        minHeight: 54,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: themeColors.border,
        borderRadius: radii.md,
        backgroundColor: themeColors.inputBackground,
    },
    multilineContainer: { minHeight: 112, alignItems: 'flex-start' },
    inputContainerFocused: { borderColor: themeColors.primary },
    inputContainerError: { borderColor: themeColors.errorBorder },
    inputContainerDisabled: {
        backgroundColor: themeColors.background,
        opacity: 0.72,
    },
    input: {
        minWidth: 0,
        minHeight: 52,
        flex: 1,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        color: themeColors.text,
        fontSize: typography.body,
    },
    multilineInput: {
        minHeight: 110,
        textAlignVertical: 'top',
    },
    passwordToggle: {
        minWidth: 48,
        minHeight: 48,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.xs,
    },
    passwordTogglePressed: { opacity: 0.6 },
    helper: {
        color: themeColors.textSecondary,
        fontSize: typography.small,
        lineHeight: 18,
    },
    error: {
        color: themeColors.danger,
        fontSize: typography.small,
        lineHeight: 18,
    },
}));
