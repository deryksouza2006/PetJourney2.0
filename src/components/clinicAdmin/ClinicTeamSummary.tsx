import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { radii, spacing, ThemeColors, typography } from '../../theme/tokens';
import { Veterinarian } from '../../types/veterinarian';

interface ClinicTeamSummaryProps {
    veterinarians: Veterinarian[];
    total: number;
    isLoading: boolean;
    isError: boolean;
    onRetry: () => void;
    onPress: () => void;
}

function getInitials(name: string): string {
    const words = name.trim().split(/\s+/).filter(Boolean);

    if (words.length === 0) {
        return 'VT';
    }

    return `${words[0]?.charAt(0) ?? ''}${words[1]?.charAt(0) ?? ''}`.toLocaleUpperCase('pt-BR');
}

function teamLabel(total: number): string {
    return total === 1 ? '1 veterinário cadastrado' : `${total} veterinários cadastrados`;
}

export function ClinicTeamSummary({
    veterinarians,
    total,
    isLoading,
    isError,
    onRetry,
    onPress,
}: ClinicTeamSummaryProps) {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const visibleVeterinarians = veterinarians.slice(0, 3);
    const hiddenCount = Math.max(total - visibleVeterinarians.length, 0);

    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>TIME</Text>
            {isLoading ? (
                <View style={styles.stateCard}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={styles.stateText}>Carregando equipe...</Text>
                </View>
            ) : isError ? (
                <View style={styles.stateCard}>
                    <Text style={styles.errorText}>Não foi possível carregar a equipe.</Text>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Tentar carregar a equipe novamente"
                        style={({ pressed }) => [styles.retry, pressed && styles.pressed]}
                        onPress={onRetry}
                    >
                        <Text style={styles.retryText}>Tentar novamente</Text>
                    </Pressable>
                </View>
            ) : (
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Abrir equipe, ${teamLabel(total)}`}
                    style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                    onPress={onPress}
                >
                    <View style={styles.avatars}>
                        {visibleVeterinarians.map((veterinarian) => (
                            <View key={veterinarian.id} style={styles.avatar}>
                                <Text style={styles.avatarText}>{getInitials(veterinarian.name)}</Text>
                            </View>
                        ))}
                        {hiddenCount > 0 ? (
                            <View style={styles.moreAvatar}>
                                <Text style={styles.moreAvatarText}>+{hiddenCount}</Text>
                            </View>
                        ) : null}
                        {total === 0 ? (
                            <View style={styles.avatar}>
                                <Ionicons name="people-outline" size={20} color={colors.primary} />
                            </View>
                        ) : null}
                    </View>
                    <View style={styles.copy}>
                        <Text style={styles.title}>Veterinários da clínica</Text>
                        <Text style={styles.description}>
                            {total === 0 ? 'Nenhum veterinário cadastrado.' : teamLabel(total)}
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.primary} />
                </Pressable>
            )}
        </View>
    );
}

function createStyles(colors: ThemeColors) {
    return StyleSheet.create({
        section: { marginBottom: spacing.xxl },
        sectionTitle: {
            marginBottom: spacing.md,
            color: colors.text,
            fontSize: typography.small,
            fontWeight: '800',
            letterSpacing: 1.2,
        },
        card: {
            minHeight: 92,
            flexDirection: 'row',
            alignItems: 'center',
            padding: spacing.lg,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.lg,
            backgroundColor: colors.card,
        },
        cardPressed: {
            borderColor: colors.primary,
            backgroundColor: colors.primarySoft,
            transform: [{ scale: 0.99 }],
        },
        avatars: { flexDirection: 'row', alignItems: 'center' },
        avatar: {
            width: 36,
            height: 36,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: -spacing.sm,
            borderWidth: 2,
            borderColor: colors.card,
            borderRadius: radii.pill,
            backgroundColor: colors.primarySoft,
        },
        avatarText: { color: colors.primaryDark, fontSize: 10, fontWeight: '800' },
        moreAvatar: {
            width: 36,
            height: 36,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
            borderColor: colors.card,
            borderRadius: radii.pill,
            backgroundColor: colors.inputBackground,
        },
        moreAvatarText: { color: colors.textSecondary, fontSize: 10, fontWeight: '800' },
        copy: { flex: 1, marginHorizontal: spacing.lg },
        title: { color: colors.text, fontSize: typography.caption, fontWeight: '800' },
        description: {
            marginTop: spacing.xs,
            color: colors.textSecondary,
            fontSize: typography.small,
            lineHeight: 17,
        },
        stateCard: {
            minHeight: 92,
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.sm,
            padding: spacing.lg,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.lg,
            backgroundColor: colors.card,
        },
        stateText: { color: colors.textSecondary, fontSize: typography.caption },
        errorText: { color: colors.danger, fontSize: typography.caption, textAlign: 'center' },
        retry: {
            minHeight: 44,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: spacing.lg,
            borderWidth: 1,
            borderColor: colors.primary,
            borderRadius: radii.md,
            backgroundColor: colors.primarySoft,
        },
        retryText: { color: colors.primary, fontSize: typography.caption, fontWeight: '800' },
        pressed: { opacity: 0.7 },
    });
}
