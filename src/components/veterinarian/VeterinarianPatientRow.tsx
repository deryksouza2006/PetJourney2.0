import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing, ThemeColors, typography } from '../../theme/tokens';
import { SmartCarePriority } from '../../types/smartCare';
import { PetAvatar } from './PetAvatar';
import { SmartCarePriorityBadge } from './SmartCarePriorityBadge';

interface VeterinarianPatientRowProps {
    name: string;
    secondaryInformation: string;
    smartCarePriority?: SmartCarePriority | 'SEM_DADOS';
    imageUri?: string | null;
    onPress: () => void;
}

export function VeterinarianPatientRow({
    name,
    secondaryInformation,
    smartCarePriority,
    imageUri,
    onPress,
}: VeterinarianPatientRowProps) {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Abrir detalhes de ${name}. ${secondaryInformation}`}
            onPress={onPress}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
        >
            <PetAvatar imageUri={imageUri} />
            <View style={styles.copy}>
                <Text style={styles.name} numberOfLines={1}>{name}</Text>
                <Text style={styles.secondary} numberOfLines={2}>
                    {secondaryInformation}
                </Text>
            </View>
            {smartCarePriority ? (
                <SmartCarePriorityBadge priority={smartCarePriority} />
            ) : (
                <Ionicons name="chevron-forward" size={19} color={colors.textSecondary} />
            )}
        </Pressable>
    );
}

function createStyles(colors: ThemeColors) {
    return StyleSheet.create({
        row: {
            minHeight: 82,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.md,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            backgroundColor: colors.surface,
        },
        pressed: { backgroundColor: colors.primarySoft },
        copy: { flex: 1, minWidth: 0 },
        name: { color: colors.text, fontSize: typography.body, fontWeight: '800' },
        secondary: {
            marginTop: spacing.xs,
            color: colors.textSecondary,
            fontSize: typography.small,
            lineHeight: 18,
        },
    });
}
