import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { radii, shadows, spacing, ThemeColors, typography } from '../../theme/tokens';
import { Pet, PetSpecies } from '../../types/pet';

interface TutorPetAvatarListProps {
    pets: Pet[];
    isLoading: boolean;
    isError: boolean;
    onRetry: () => void;
    onPetPress: (petId: number) => void;
}

function formatSpecies(species: PetSpecies): string {
    const normalized = species.toLocaleLowerCase('pt-BR');

    return normalized.charAt(0).toLocaleUpperCase('pt-BR') + normalized.slice(1);
}

export function TutorPetAvatarList({
    pets,
    isLoading,
    isError,
    onRetry,
    onPetPress,
}: TutorPetAvatarListProps) {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>MEUS PETS</Text>
            <Text style={styles.description}>Toque em um pet para abrir seus detalhes.</Text>

            {isLoading ? (
                <View style={styles.loading}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={styles.stateText}>Carregando pets...</Text>
                </View>
            ) : isError ? (
                <View style={styles.state}>
                    <Text style={styles.errorText}>Não foi possível carregar seus pets.</Text>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Tentar carregar os pets novamente"
                        style={({ pressed }) => [styles.retry, pressed && styles.pressed]}
                        onPress={onRetry}
                    >
                        <Text style={styles.retryText}>Tentar novamente</Text>
                    </Pressable>
                </View>
            ) : pets.length === 0 ? (
                <Text style={styles.stateText}>Nenhum pet vinculado à sua conta.</Text>
            ) : (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.list}
                >
                    {pets.map((pet) => (
                        <Pressable
                            key={pet.id}
                            accessibilityRole="button"
                            accessibilityLabel={`Abrir detalhes de ${pet.name}, ${formatSpecies(pet.species)}`}
                            style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
                            onPress={() => onPetPress(pet.id)}
                        >
                            <View style={styles.avatar}>
                                <Ionicons name="paw" size={27} color={colors.primary} />
                            </View>
                            <Text style={styles.petName} numberOfLines={1}>{pet.name}</Text>
                            <Text style={styles.species} numberOfLines={1}>
                                {formatSpecies(pet.species)}
                            </Text>
                        </Pressable>
                    ))}
                </ScrollView>
            )}
        </View>
    );
}

function createStyles(colors: ThemeColors) {
    return StyleSheet.create({
        container: { marginBottom: spacing.xxl },
        title: {
            color: colors.text,
            fontSize: typography.small,
            fontWeight: '800',
            letterSpacing: 1.2,
        },
        description: {
            marginTop: spacing.xs,
            marginBottom: spacing.md,
            color: colors.textSecondary,
            fontSize: typography.small,
            lineHeight: 18,
        },
        loading: {
            minHeight: 84,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.sm,
        },
        state: { minHeight: 96, alignItems: 'center', justifyContent: 'center' },
        stateText: {
            paddingVertical: spacing.lg,
            color: colors.textSecondary,
            fontSize: typography.caption,
            textAlign: 'center',
        },
        errorText: { color: colors.danger, fontSize: typography.caption, textAlign: 'center' },
        retry: {
            minHeight: 44,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: spacing.sm,
            paddingHorizontal: spacing.lg,
            borderWidth: 1,
            borderColor: colors.primary,
            borderRadius: radii.md,
            backgroundColor: colors.primarySoft,
        },
        retryText: { color: colors.primary, fontSize: typography.caption, fontWeight: '800' },
        pressed: { opacity: 0.7 },
        list: { gap: spacing.lg, paddingRight: spacing.sm },
        item: { width: 76, alignItems: 'center', borderRadius: radii.md },
        itemPressed: { opacity: 0.7, transform: [{ scale: 0.96 }] },
        avatar: {
            width: 64,
            height: 64,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
            borderColor: colors.primarySoft,
            borderRadius: radii.pill,
            backgroundColor: colors.card,
            ...shadows.card,
        },
        petName: {
            width: '100%',
            marginTop: spacing.sm,
            color: colors.text,
            fontSize: typography.caption,
            fontWeight: '800',
            textAlign: 'center',
        },
        species: {
            width: '100%',
            marginTop: spacing.xs,
            color: colors.textSecondary,
            fontSize: 10,
            textAlign: 'center',
        },
    });
}
