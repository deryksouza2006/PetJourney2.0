import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme/tokens';
import { AppButton } from './AppButton';

interface PaginationControlsProps {
    page: number;
    totalPages: number;
    isFirst: boolean;
    isLast: boolean;
    disabled?: boolean;
    onPrevious: () => void;
    onNext: () => void;
}

export function PaginationControls({
    page,
    totalPages,
    isFirst,
    isLast,
    disabled = false,
    onPrevious,
    onNext,
}: PaginationControlsProps) {
    if (totalPages === 0) {
        return null;
    }

    return (
        <View style={styles.container}>
            <AppButton
                label="Anterior"
                variant="secondary"
                size="small"
                style={styles.button}
                onPress={onPrevious}
                disabled={disabled || isFirst}
            />
            <View style={styles.pageInfo} accessibilityLiveRegion="polite">
                <Text style={styles.pageLabel}>Página</Text>
                <Text style={styles.pageValue}>
                    {page + 1} de {totalPages}
                </Text>
            </View>
            <AppButton
                label="Próxima"
                variant="secondary"
                size="small"
                style={styles.button}
                onPress={onNext}
                disabled={disabled || isLast}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingTop: spacing.sm,
        paddingBottom: spacing.xxl,
    },
    button: { flex: 1 },
    pageInfo: { minWidth: 72, alignItems: 'center' },
    pageLabel: { color: colors.textSecondary, fontSize: typography.small },
    pageValue: {
        marginTop: spacing.xs,
        color: colors.text,
        fontSize: typography.caption,
        fontWeight: '800',
    },
});
