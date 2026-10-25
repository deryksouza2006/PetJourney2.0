import Ionicons from '@expo/vector-icons/Ionicons';
import { ComponentProps, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { radii, shadows, spacing, ThemeColors, typography } from '../../theme/tokens';
import { Pet, PetSex, PetSpecies } from '../../types/pet';
import { formatLocalDate } from '../../utils/dateTimeFormatting';
import { PetAvatar } from './PetAvatar';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

interface PetClinicalHeaderProps {
    pet: Pet;
    imageUri?: string | null;
}

const SPECIES_LABELS: Record<PetSpecies, string> = {
    CACHORRO: 'Cachorro',
    GATO: 'Gato',
    AVE: 'Ave',
    ROEDOR: 'Roedor',
    REPTIL: 'Réptil',
    OUTRO: 'Outro',
};

const SEX_LABELS: Record<PetSex, string> = {
    MACHO: 'Macho',
    FEMEA: 'Fêmea',
};

function formatAge(birthDate: string | null): string | null {
    if (!birthDate) {
        return null;
    }

    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(birthDate);

    if (!match) {
        return null;
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const today = new Date();
    let age = today.getFullYear() - year;

    if (
        today.getMonth() + 1 < month
        || (today.getMonth() + 1 === month && today.getDate() < day)
    ) {
        age -= 1;
    }

    if (age < 0) {
        return null;
    }

    if (age === 0) {
        return 'menos de 1 ano';
    }

    return `${age} ${age === 1 ? 'ano' : 'anos'}`;
}

export function PetClinicalHeader({ pet, imageUri = null }: PetClinicalHeaderProps) {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const heroDetails = [
        pet.breed?.trim() || null,
        formatAge(pet.birthDate),
        pet.sex ? SEX_LABELS[pet.sex] : null,
    ].filter((value): value is string => Boolean(value));
    const informationCards: Array<{
        key: string;
        icon: IoniconName;
        label: string;
        value: string;
    }> = [];

    if (pet.weight !== null) {
        informationCards.push({
            key: 'weight',
            icon: 'scale-outline',
            label: 'PESO',
            value: `${pet.weight} kg`,
        });
    }

    if (pet.birthDate) {
        informationCards.push({
            key: 'birthDate',
            icon: 'calendar-outline',
            label: 'NASCIMENTO',
            value: formatLocalDate(pet.birthDate),
        });
    }

    if (pet.tutorName?.trim()) {
        informationCards.push({
            key: 'tutor',
            icon: 'person-outline',
            label: 'TUTOR',
            value: pet.tutorName.trim(),
        });
    }

    return (
        <>
            <View style={styles.hero}>
                <View style={styles.heroDecoration} />
                <PetAvatar imageUri={imageUri} size={82} />
                <View style={styles.heroCopy}>
                    <Text style={styles.petName}>{pet.name}</Text>
                    <Text style={styles.species}>{SPECIES_LABELS[pet.species]}</Text>
                    {heroDetails.length > 0 ? (
                        <Text style={styles.heroDetails}>{heroDetails.join(' • ')}</Text>
                    ) : null}
                </View>
            </View>

            {informationCards.length > 0 ? (
                <View style={styles.infoGrid}>
                    {informationCards.map((card) => (
                        <View key={card.key} style={styles.infoCard}>
                            <Ionicons name={card.icon} size={18} color={colors.primary} />
                            <View style={styles.infoCopy}>
                                <Text style={styles.infoLabel}>{card.label}</Text>
                                <Text style={styles.infoValue} numberOfLines={2}>{card.value}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            ) : null}
        </>
    );
}

function createStyles(colors: ThemeColors) {
    return StyleSheet.create({
        hero: {
            minHeight: 176,
            flexDirection: 'row',
            alignItems: 'flex-end',
            gap: spacing.lg,
            overflow: 'hidden',
            padding: spacing.xl,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.lg,
            backgroundColor: colors.primarySoft,
            ...shadows.card,
        },
        heroDecoration: {
            position: 'absolute',
            top: -55,
            right: -35,
            width: 150,
            height: 150,
            borderRadius: radii.pill,
            backgroundColor: colors.overlayLight,
        },
        heroCopy: { flex: 1, minWidth: 0 },
        petName: {
            color: colors.text,
            fontSize: typography.title,
            fontWeight: '900',
            letterSpacing: -0.4,
        },
        species: {
            marginTop: spacing.xs,
            color: colors.primaryDark,
            fontSize: typography.body,
            fontWeight: '800',
        },
        heroDetails: {
            marginTop: spacing.sm,
            color: colors.textSecondary,
            fontSize: typography.caption,
            lineHeight: 20,
        },
        infoGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: spacing.md,
            marginTop: spacing.lg,
        },
        infoCard: {
            width: '48%',
            minHeight: 82,
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: spacing.sm,
            padding: spacing.md,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.md,
            backgroundColor: colors.surface,
        },
        infoCopy: { flex: 1, minWidth: 0 },
        infoLabel: {
            color: colors.textSecondary,
            fontSize: typography.small,
            fontWeight: '800',
            letterSpacing: 0.6,
        },
        infoValue: {
            marginTop: spacing.xs,
            color: colors.text,
            fontSize: typography.caption,
            fontWeight: '700',
            lineHeight: 18,
        },
    });
}
