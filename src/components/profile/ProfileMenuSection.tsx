import Ionicons from '@expo/vector-icons/Ionicons';
import { ComponentProps, PropsWithChildren, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { radii, spacing, ThemeColors, typography } from '../../theme/tokens';

type IconName = ComponentProps<typeof Ionicons>['name'];

interface ProfileSectionProps extends PropsWithChildren {
    title?: string;
}

interface ProfileMenuRowProps {
    icon: IconName;
    title: string;
    description?: string;
    onPress: () => void;
    showDivider?: boolean;
    destructive?: boolean;
    showChevron?: boolean;
}

export function ProfileSection({ title, children }: ProfileSectionProps) {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    return (
        <View style={styles.sectionWrapper}>
            {title ? <Text style={styles.sectionTitle}>{title}</Text> : null}
            <View style={styles.section}>{children}</View>
        </View>
    );
}

export function ProfileMenuRow({
    icon,
    title,
    description,
    onPress,
    showDivider = false,
    destructive = false,
    showChevron = true,
}: ProfileMenuRowProps) {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const foregroundColor = destructive ? colors.danger : colors.primary;

    return (
        <View style={showDivider ? styles.dividerContainer : undefined}>
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={description ? `${title}. ${description}` : title}
                onPress={onPress}
                style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            >
                <View style={[styles.icon, destructive && styles.destructiveIcon]}>
                    <Ionicons name={icon} size={21} color={foregroundColor} />
                </View>
                <View style={styles.copy}>
                    <Text style={[styles.rowTitle, destructive && styles.destructiveText]}>
                        {title}
                    </Text>
                    {description ? (
                        <Text style={styles.description}>{description}</Text>
                    ) : null}
                </View>
                {showChevron ? (
                    <Ionicons name="chevron-forward" size={19} color={colors.textSecondary} />
                ) : null}
            </Pressable>
        </View>
    );
}

function createStyles(colors: ThemeColors) {
    return StyleSheet.create({
        sectionWrapper: { marginTop: spacing.xl },
        sectionTitle: {
            marginBottom: spacing.sm,
            color: colors.textSecondary,
            fontSize: typography.small,
            fontWeight: '800',
            letterSpacing: 1.2,
        },
        section: {
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.lg,
            backgroundColor: colors.surface,
        },
        dividerContainer: {
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: colors.border,
        },
        row: {
            minHeight: 76,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
        },
        rowPressed: { backgroundColor: colors.primarySoft },
        icon: {
            width: 42,
            height: 42,
            flexShrink: 0,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: radii.md,
            backgroundColor: colors.primarySoft,
        },
        destructiveIcon: { backgroundColor: colors.errorSurface },
        copy: { minWidth: 0, flex: 1, marginHorizontal: spacing.md },
        rowTitle: {
            color: colors.text,
            fontSize: typography.caption,
            fontWeight: '800',
        },
        destructiveText: { color: colors.danger },
        description: {
            marginTop: spacing.xs,
            color: colors.textSecondary,
            fontSize: typography.small,
            lineHeight: 17,
        },
    });
}
