import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo } from 'react';
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { radii, spacing, ThemeColors, typography } from '../../theme/tokens';
import { AppButton } from '../AppButton';

export interface AvailabilityTimeOption {
    time: string;
    isRegistered: boolean;
}

interface AddAvailabilitySheetProps {
    visible: boolean;
    dateLabel: string;
    options: AvailabilityTimeOption[];
    selectedTimes: ReadonlySet<string>;
    isSubmitting: boolean;
    errorMessage: string | null;
    onToggleTime: (time: string) => void;
    onConfirm: () => void;
    onCancel: () => void;
}

export function AddAvailabilitySheet({
    visible,
    dateLabel,
    options,
    selectedTimes,
    isSubmitting,
    errorMessage,
    onToggleTime,
    onConfirm,
    onCancel,
}: AddAvailabilitySheetProps) {
    const { colors } = useTheme();
    const { width } = useWindowDimensions();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const usesFourColumns = width >= 480;
    const selectedCount = selectedTimes.size;
    const confirmLabel = selectedCount === 1
        ? 'Adicionar 1 horário'
        : selectedCount > 1
            ? `Adicionar ${selectedCount} horários`
            : 'Adicionar horários';

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            statusBarTranslucent
            onRequestClose={onCancel}
        >
            <View style={styles.modalRoot}>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Fechar seleção de horários"
                    disabled={isSubmitting}
                    onPress={onCancel}
                    style={styles.backdrop}
                />
                <SafeAreaView
                    edges={['bottom']}
                    style={styles.sheet}
                    accessibilityViewIsModal
                >
                    <View style={styles.handle} />
                    <View style={styles.header}>
                        <Text style={styles.title}>Adicionar disponibilidade</Text>
                        <Text style={styles.subtitle}>
                            {dateLabel} · selecione os horários em que você pode atender.
                        </Text>
                    </View>

                    <ScrollView
                        style={styles.optionsScroll}
                        contentContainerStyle={styles.optionsGrid}
                        showsVerticalScrollIndicator={false}
                    >
                        {options.map((option) => {
                            const isSelected = selectedTimes.has(option.time);

                            return (
                                <Pressable
                                    key={option.time}
                                    accessibilityRole="button"
                                    accessibilityLabel={option.isRegistered
                                        ? `${option.time}, já cadastrado`
                                        : `${option.time}${isSelected ? ', selecionado' : ''}`}
                                    accessibilityState={{
                                        disabled: option.isRegistered || isSubmitting,
                                        selected: isSelected,
                                    }}
                                    disabled={option.isRegistered || isSubmitting}
                                    onPress={() => onToggleTime(option.time)}
                                    style={({ pressed }) => [
                                        styles.option,
                                        usesFourColumns && styles.fourColumnOption,
                                        option.isRegistered && styles.registeredOption,
                                        isSelected && styles.selectedOption,
                                        pressed && styles.pressedOption,
                                    ]}
                                >
                                    <View style={styles.optionLine}>
                                        <Text
                                            style={[
                                                styles.optionText,
                                                option.isRegistered && styles.registeredOptionText,
                                                isSelected && styles.selectedOptionText,
                                            ]}
                                        >
                                            {option.time}
                                        </Text>
                                        {isSelected ? (
                                            <Ionicons
                                                name="checkmark"
                                                size={16}
                                                color={colors.background}
                                            />
                                        ) : null}
                                    </View>
                                    {option.isRegistered ? (
                                        <Text style={styles.registeredLabel}>Cadastrado</Text>
                                    ) : null}
                                </Pressable>
                            );
                        })}
                    </ScrollView>

                    <View style={styles.footer}>
                        {errorMessage ? (
                            <View style={styles.errorContainer} accessibilityLiveRegion="polite">
                                <Text style={styles.errorText}>{errorMessage}</Text>
                            </View>
                        ) : null}
                        <AppButton
                            label={confirmLabel}
                            onPress={onConfirm}
                            loading={isSubmitting}
                            loadingLabel="Adicionando..."
                            disabled={selectedCount === 0}
                            style={styles.fullWidthButton}
                        />
                        <AppButton
                            label="Cancelar"
                            onPress={onCancel}
                            variant="secondary"
                            disabled={isSubmitting}
                            style={styles.fullWidthButton}
                        />
                    </View>
                </SafeAreaView>
            </View>
        </Modal>
    );
}

function createStyles(colors: ThemeColors) {
    return StyleSheet.create({
        modalRoot: { flex: 1, justifyContent: 'flex-end' },
        backdrop: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: colors.modalBackdrop,
        },
        sheet: {
            height: '55%',
            maxHeight: 580,
            paddingTop: spacing.sm,
            paddingHorizontal: spacing.xl,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            backgroundColor: colors.surface,
        },
        handle: {
            width: 42,
            height: 5,
            alignSelf: 'center',
            marginBottom: spacing.lg,
            borderRadius: radii.pill,
            backgroundColor: colors.border,
        },
        header: { marginBottom: spacing.lg },
        title: { color: colors.text, fontSize: typography.heading, fontWeight: '800' },
        subtitle: {
            marginTop: spacing.xs,
            color: colors.textSecondary,
            fontSize: typography.caption,
            lineHeight: 20,
        },
        optionsScroll: { flex: 1 },
        optionsGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: spacing.sm,
            paddingBottom: spacing.lg,
        },
        option: {
            width: '31%',
            minWidth: 88,
            minHeight: 54,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.sm,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.md,
            backgroundColor: colors.inputBackground,
        },
        fourColumnOption: { width: '23%' },
        registeredOption: {
            borderColor: colors.border,
            backgroundColor: colors.background,
            opacity: 0.68,
        },
        selectedOption: {
            borderColor: colors.success,
            backgroundColor: colors.success,
            opacity: 1,
        },
        pressedOption: { opacity: 0.75 },
        optionLine: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
        optionText: { color: colors.text, fontSize: typography.caption, fontWeight: '700' },
        registeredOptionText: { color: colors.textSecondary },
        selectedOptionText: { color: colors.background, fontWeight: '800' },
        registeredLabel: {
            marginTop: 2,
            color: colors.textSecondary,
            fontSize: 10,
            fontWeight: '600',
        },
        footer: { gap: spacing.sm, paddingTop: spacing.sm, paddingBottom: spacing.sm },
        errorContainer: {
            padding: spacing.sm,
            borderLeftWidth: 3,
            borderLeftColor: colors.danger,
            borderRadius: radii.sm,
            backgroundColor: colors.errorSurface,
        },
        errorText: { color: colors.danger, fontSize: typography.small, lineHeight: 18 },
        fullWidthButton: { width: '100%' },
    });
}
