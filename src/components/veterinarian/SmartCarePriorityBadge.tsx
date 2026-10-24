import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { radii, spacing, ThemeColors, typography } from '../../theme/tokens';
import { SmartCarePriority } from '../../types/smartCare';

interface SmartCarePriorityBadgeProps {
    priority: SmartCarePriority | 'SEM_DADOS';
}

function getLabel(priority: SmartCarePriority | 'SEM_DADOS'): string {
    if (priority === 'MEDIA') {
        return 'MÉDIA';
    }

    if (priority === 'SEM_DADOS') {
        return 'SEM DADOS';
    }

    return priority;
}

export function SmartCarePriorityBadge({ priority }: SmartCarePriorityBadgeProps) {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    return (
        <View
            accessibilityLabel={`Prioridade ${getLabel(priority)}`}
            style={[
                styles.badge,
                priority === 'ALTA' && styles.highBadge,
                priority === 'MEDIA' && styles.mediumBadge,
                priority === 'BAIXA' && styles.lowBadge,
                priority === 'SEM_DADOS' && styles.noDataBadge,
            ]}
        >
            <Text
                style={[
                    styles.label,
                    priority === 'ALTA' && styles.highLabel,
                    priority === 'MEDIA' && styles.mediumLabel,
                    priority === 'BAIXA' && styles.lowLabel,
                    priority === 'SEM_DADOS' && styles.noDataLabel,
                ]}
            >
                {getLabel(priority)}
            </Text>
        </View>
    );
}

function createStyles(colors: ThemeColors) {
    return StyleSheet.create({
        badge: {
            alignSelf: 'flex-start',
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs,
            borderWidth: 1,
            borderRadius: radii.pill,
        },
        highBadge: { borderColor: colors.errorBorder, backgroundColor: colors.errorSurface },
        mediumBadge: { borderColor: colors.warning, backgroundColor: colors.warningSurface },
        lowBadge: { borderColor: colors.success, backgroundColor: colors.successSurface },
        noDataBadge: { borderColor: colors.border, backgroundColor: colors.inputBackground },
        label: { fontSize: typography.small, fontWeight: '800', letterSpacing: 0.3 },
        highLabel: { color: colors.danger },
        mediumLabel: { color: colors.warningText },
        lowLabel: { color: colors.success },
        noDataLabel: { color: colors.textSecondary },
    });
}
