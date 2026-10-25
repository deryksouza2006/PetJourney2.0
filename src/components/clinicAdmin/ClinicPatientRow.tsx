import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Pet } from '../../types/pet';
import { spacing, ThemeColors, typography } from '../../theme/tokens';
import { getPetSecondaryInformation } from '../../utils/petPresentation';
import { PetAvatar } from '../veterinarian/PetAvatar';

interface ClinicPatientRowProps {
    pet: Pet;
    onPress: () => void;
}

export function ClinicPatientRow({ pet, onPress }: ClinicPatientRowProps) {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const secondaryInformation = getPetSecondaryInformation(pet);
    const tutorName = pet.tutorName?.trim();

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={[
                `Abrir detalhes de ${pet.name}`,
                secondaryInformation,
                tutorName ? `Tutor ${tutorName}` : null,
            ].filter(Boolean).join('. ')}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            onPress={onPress}
        >
            <PetAvatar />
            <View style={styles.copy}>
                <Text style={styles.name} numberOfLines={1}>{pet.name}</Text>
                <Text style={styles.secondary} numberOfLines={2}>
                    {secondaryInformation}
                </Text>
                {tutorName ? (
                    <Text style={styles.tutor} numberOfLines={1}>
                        Tutor · {tutorName}
                    </Text>
                ) : null}
            </View>
            <Ionicons name="chevron-forward" size={19} color={colors.textSecondary} />
        </Pressable>
    );
}

function createStyles(colors: ThemeColors) {
    return StyleSheet.create({
        row: {
            minHeight: 88,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.md,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            backgroundColor: colors.surface,
        },
        rowPressed: { backgroundColor: colors.primarySoft },
        copy: { minWidth: 0, flex: 1 },
        name: {
            color: colors.text,
            fontSize: typography.body,
            fontWeight: '800',
        },
        secondary: {
            marginTop: spacing.xs,
            color: colors.textSecondary,
            fontSize: typography.small,
            lineHeight: 17,
        },
        tutor: {
            marginTop: spacing.xs,
            color: colors.textSecondary,
            fontSize: typography.small,
            fontWeight: '600',
            lineHeight: 17,
        },
    });
}
