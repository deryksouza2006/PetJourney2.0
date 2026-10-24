import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { radii, spacing, ThemeColors, typography } from '../../theme/tokens';

interface VeterinarianAvatarProps {
    name: string;
    size?: 'default' | 'large';
}

function getInitials(name: string): string {
    const words = name.trim().split(/\s+/).filter(Boolean);

    if (words.length === 0) {
        return 'VT';
    }

    const firstInitial = words[0]?.charAt(0) ?? '';
    const lastInitial = words.length > 1
        ? words[words.length - 1]?.charAt(0) ?? ''
        : '';

    return `${firstInitial}${lastInitial}`.toLocaleUpperCase('pt-BR');
}

export function VeterinarianAvatar({ name, size = 'default' }: VeterinarianAvatarProps) {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const isLarge = size === 'large';

    return (
        <View
            style={[styles.avatar, isLarge && styles.avatarLarge]}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
        >
            <Text style={[styles.initials, isLarge && styles.initialsLarge]}>
                {getInitials(name)}
            </Text>
        </View>
    );
}

function createStyles(colors: ThemeColors) {
    return StyleSheet.create({
    avatar: {
        width: 46,
        height: 46,
        flexShrink: 0,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: radii.pill,
        backgroundColor: colors.primarySoft,
    },
    avatarLarge: {
        width: 72,
        height: 72,
        marginBottom: spacing.md,
    },
    initials: {
        color: colors.primaryDark,
        fontSize: typography.caption,
        fontWeight: '800',
        letterSpacing: 0.4,
    },
    initialsLarge: { fontSize: typography.heading },
    });
}
