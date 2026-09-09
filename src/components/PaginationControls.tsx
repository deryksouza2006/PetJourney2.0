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
    if (totalPages <= 1) {
        return null;
    }

    return (
        <View style={styles.container}>
            <View style={styles.pageInfo} accessibilityLiveRegion="polite">
                <Text style={styles.pageLabel}>Página atual</Text>
                <Text style={styles.pageValue}>{page + 1} de {totalPages}</Text>
            </View>
            <View style={styles.actions}>
                <AppButton
                    label="Anterior"
                    variant="secondary"
                    size="small"
                    style={styles.button}
                    onPress={onPrevious}
                    disabled={disabled || isFirst}
                />
                <AppButton
                    label="Próxima"
                    variant="secondary"
                    size="small"
                    style={styles.button}
                    onPress={onNext}
                    disabled={disabled || isLast}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        gap: spacing.sm,
        paddingTop: spacing.sm,
        paddingBottom: spacing.xxl,
    },
    actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    button: {
        flexGrow: 1,
        flexBasis: 104,
        minWidth: 96,
        paddingHorizontal: spacing.sm,
    },
    pageInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
    },
    pageLabel: { color: colors.textSecondary, fontSize: typography.small },
    pageValue: {
        color: colors.text,
        fontSize: typography.caption,
        fontWeight: '800',
    },
});
