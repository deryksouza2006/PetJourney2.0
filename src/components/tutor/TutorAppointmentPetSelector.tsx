import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { radii, shadows, spacing, ThemeColors, typography } from '../../theme/tokens';
import { Pet } from '../../types/pet';
import { PET_SPECIES_LABELS } from '../../utils/petPresentation';

interface TutorAppointmentPetSelectorProps {
    pets: Pet[];
    selectedPetId: number | null;
    disabled?: boolean;
    onSelect: (petId: number) => void;
}

export function TutorAppointmentPetSelector({
    pets,
    selectedPetId,
    disabled = false,
    onSelect,
}: TutorAppointmentPetSelectorProps) {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    return (
        <ScrollView
            horizontal
            nestedScrollEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.list}
        >
            {pets.map((pet) => {
                const isSelected = pet.id === selectedPetId;

                return (
                    <Pressable
                        key={pet.id}
                        accessibilityRole="button"
                        accessibilityLabel={`${pet.name}, ${PET_SPECIES_LABELS[pet.species]}`}
                        accessibilityState={{ selected: isSelected, disabled }}
                        disabled={disabled}
                        onPress={() => onSelect(pet.id)}
                        style={({ pressed }) => [
                            styles.card,
                            isSelected && styles.cardSelected,
                            pressed && !disabled && styles.cardPressed,
                        ]}
                    >
                        <View style={[styles.avatar, isSelected && styles.avatarSelected]}>
                            <Ionicons
                                name="paw"
                                size={25}
                                color={isSelected ? colors.onPrimary : colors.primary}
                            />
                        </View>
                        <Text style={styles.name} numberOfLines={1}>{pet.name}</Text>
                        <Text style={styles.species} numberOfLines={1}>
                            {PET_SPECIES_LABELS[pet.species]}
                        </Text>
                    </Pressable>
                );
            })}
        </ScrollView>
    );
}

function createStyles(colors: ThemeColors) {
    return StyleSheet.create({
        list: { gap: spacing.md, paddingVertical: spacing.xs, paddingRight: spacing.sm },
        card: {
            width: 108,
            minHeight: 132,
            alignItems: 'center',
            justifyContent: 'center',
            padding: spacing.md,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.lg,
            backgroundColor: colors.card,
            ...shadows.card,
        },
        cardSelected: {
            borderColor: colors.primary,
            backgroundColor: colors.primarySoft,
        },
        cardPressed: { opacity: 0.78, transform: [{ scale: 0.97 }] },
        avatar: {
            width: 52,
            height: 52,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: radii.pill,
            backgroundColor: colors.primarySoft,
        },
        avatarSelected: { backgroundColor: colors.primaryAction },
        name: {
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
            fontSize: typography.small,
            textAlign: 'center',
        },
    });
}
