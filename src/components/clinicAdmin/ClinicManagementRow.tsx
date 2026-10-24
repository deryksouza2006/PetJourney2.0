import Ionicons from '@expo/vector-icons/Ionicons';
import { ComponentProps } from 'react';
import { Pressable, Text, View } from 'react-native';
import { colors, createThemedStyles, radii, spacing, typography } from '../../theme/tokens';

type IconName = ComponentProps<typeof Ionicons>['name'];

interface ClinicManagementRowProps {
    icon: IconName;
    title: string;
    description: string;
    onPress: () => void;
}

export function ClinicManagementRow({
    icon,
    title,
    description,
    onPress,
}: ClinicManagementRowProps) {
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${title}. ${description}`}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            onPress={onPress}
        >
            <View style={styles.iconContainer}>
                <Ionicons name={icon} size={22} color={colors.primary} />
            </View>
            <View style={styles.copy}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.description} numberOfLines={2}>{description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </Pressable>
    );
}

const styles = createThemedStyles((themeColors) => ({
    row: {
        minHeight: 82,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        backgroundColor: themeColors.surface,
    },
    rowPressed: { backgroundColor: themeColors.primarySoft },
    iconContainer: {
        width: 44,
        height: 44,
        flexShrink: 0,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: radii.md,
        backgroundColor: themeColors.primarySoft,
    },
    copy: { minWidth: 0, flex: 1, marginHorizontal: spacing.md },
    title: {
        color: themeColors.text,
        fontSize: typography.caption,
        fontWeight: '800',
    },
    description: {
        marginTop: spacing.xs,
        color: themeColors.textSecondary,
        fontSize: typography.small,
        lineHeight: 17,
    },
}));
