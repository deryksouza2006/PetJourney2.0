import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, shadows, spacing, typography } from '../theme/tokens';
import { Pet } from '../types/pet';
import { getApiErrorMessage } from '../utils/apiError';
import { AppButton } from './AppButton';

interface TutorPetSelectorProps {
    pets: Pet[];
    selectedPetId: number | null;
    isPending: boolean;
    isError: boolean;
    error: unknown;
    onSelect: (petId: number) => void;
    onRetry: () => void;
}

export function TutorPetSelector({
    pets,
    selectedPetId,
    isPending,
    isError,
    error,
    onSelect,
    onRetry,
}: TutorPetSelectorProps) {
    return (
        <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Escolha o pet</Text>

            {isPending ? (
                <View style={styles.loadingState}>
                    <ActivityIndicator color={colors.primary} />
                    <Text style={styles.loadingMessage}>Carregando seus pets...</Text>
                </View>
            ) : isError ? (
                <View style={styles.stateBox}>
                    <Text style={styles.stateTitle}>Não foi possível carregar seus pets</Text>
                    <Text style={styles.stateMessage}>
                        {getApiErrorMessage(error, 'Não foi possível consultar seus pets agora.')}
                    </Text>
                    <AppButton
                        label="Tentar novamente"
                        onPress={onRetry}
                        variant="secondary"
                        size="small"
                        style={styles.retryButton}
                    />
                </View>
            ) : pets.length === 0 ? (
                <View style={styles.stateBox}>
                    <Text style={styles.stateTitle}>Nenhum pet encontrado.</Text>
                </View>
            ) : (
                <View style={styles.petOptions}>
                    {pets.map((pet) => {
                        const isSelected = pet.id === selectedPetId;

                        return (
                            <Pressable
                                key={pet.id}
                                accessibilityRole="button"
                                accessibilityState={{ selected: isSelected }}
                                style={({ pressed }) => [
                                    styles.petCard,
                                    isSelected && styles.petCardSelected,
                                    pressed && styles.cardPressed,
                                ]}
                                onPress={() => onSelect(pet.id)}
                            >
                                <Text style={[
                                    styles.petName,
                                    isSelected && styles.selectedText,
                                ]}>
                                    {pet.name}
                                </Text>
                                <Text style={styles.petSpecies}>{pet.species}</Text>
                            </Pressable>
                        );
                    })}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    sectionCard: {
        padding: spacing.xl,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.lg,
        backgroundColor: colors.surface,
        ...shadows.card,
    },
    sectionTitle: { color: colors.text, fontSize: typography.heading, fontWeight: '800' },
    petOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
        marginTop: spacing.xl,
    },
    petCard: {
        minWidth: 130,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.md,
        backgroundColor: colors.background,
    },
    petCardSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
    cardPressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
    petName: { color: colors.text, fontSize: typography.body, fontWeight: '800' },
    petSpecies: {
        marginTop: spacing.xs,
        color: colors.textSecondary,
        fontSize: typography.small,
    },
    selectedText: { color: colors.primaryDark },
    loadingState: {
        alignItems: 'center',
        gap: spacing.md,
        marginTop: spacing.xl,
        padding: spacing.xl,
    },
    loadingMessage: {
        color: colors.textSecondary,
        fontSize: typography.caption,
        lineHeight: 20,
        textAlign: 'center',
    },
    stateBox: {
        alignItems: 'center',
        marginTop: spacing.xl,
        padding: spacing.xl,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.md,
        backgroundColor: colors.surface,
    },
    stateTitle: {
        color: colors.text,
        fontSize: typography.caption,
        fontWeight: '800',
        textAlign: 'center',
    },
    stateMessage: {
        marginTop: spacing.xl,
        color: colors.textSecondary,
        fontSize: typography.caption,
        lineHeight: 20,
        textAlign: 'center',
    },
    retryButton: { marginTop: spacing.lg },
});
