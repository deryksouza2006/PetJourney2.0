import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { radii, spacing, ThemeColors, typography } from '../../theme/tokens';
import { BrandMark } from '../BrandMark';

interface AppHeaderProps {
    contextLabel: string;
    includeSystemTheme?: boolean;
}

export function AppHeader({ contextLabel, includeSystemTheme = false }: AppHeaderProps) {
    const { colors, isDark, themePreference, setThemePreference } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const nextTheme = includeSystemTheme
        ? themePreference === 'light'
            ? 'dark'
            : themePreference === 'dark'
                ? 'system'
                : 'light'
        : isDark ? 'light' : 'dark';
    const themeActionLabel = nextTheme === 'light'
        ? 'Ativar tema claro'
        : nextTheme === 'dark'
            ? 'Ativar tema escuro'
            : 'Ativar tema do sistema';
    const themeActionIcon = nextTheme === 'light'
        ? 'sunny-outline'
        : nextTheme === 'dark'
            ? 'moon-outline'
            : 'contrast-outline';

    function toggleTheme(): void {
        void setThemePreference(nextTheme);
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <View style={styles.container}>
                <View style={styles.brandArea}>
                    <BrandMark compact />
                    <Text style={styles.contextLabel}>{contextLabel}</Text>
                </View>

                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={themeActionLabel}
                    hitSlop={8}
                    style={({ pressed }) => [
                        styles.actionButton,
                        pressed && styles.actionButtonPressed,
                    ]}
                    onPress={toggleTheme}
                >
                    <Ionicons
                        name={themeActionIcon}
                        size={22}
                        color={colors.text}
                    />
                </Pressable>
            </View>
        </SafeAreaView>
    );
}

function createStyles(colors: ThemeColors) {
    return StyleSheet.create({
        safeArea: {
            backgroundColor: colors.surface,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: colors.border,
        },
        container: {
            minHeight: 68,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.sm,
        },
        brandArea: { flex: 1, alignItems: 'flex-start' },
        contextLabel: {
            marginTop: spacing.xs,
            marginLeft: 48,
            color: colors.textSecondary,
            fontSize: typography.small,
            fontWeight: '700',
        },
        actionButton: {
            width: 44,
            height: 44,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.pill,
            backgroundColor: colors.inputBackground,
        },
        actionButtonPressed: { opacity: 0.7, transform: [{ scale: 0.96 }] },
    });
}
