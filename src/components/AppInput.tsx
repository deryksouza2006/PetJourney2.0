import { forwardRef } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors, radii, spacing, typography } from '../theme/tokens';

interface AppInputProps extends TextInputProps { label: string; }

export const AppInput = forwardRef<TextInput, AppInputProps>(({ label, style, ...props }, ref) => (
    <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
            ref={ref}
            style={[styles.input, style]}
            placeholderTextColor={colors.textSecondary}
            selectionColor={colors.primary}
            {...props}
        />
    </View>
));

AppInput.displayName = 'AppInput';

const styles = StyleSheet.create({
    container: { gap: spacing.sm },
    label: { color: colors.text, fontSize: typography.caption, fontWeight: '700' },
    input: {
        minHeight: 54,
        paddingHorizontal: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.md,
        backgroundColor: colors.surface,
        color: colors.text,
        fontSize: typography.body,
    },
});
