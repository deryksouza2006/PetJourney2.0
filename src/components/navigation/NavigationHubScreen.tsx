import Ionicons from '@expo/vector-icons/Ionicons';
import { ComponentProps, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { radii, shadows, spacing, ThemeColors, typography } from '../../theme/tokens';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

export interface NavigationHubAction {
    icon: IoniconName;
    title: string;
    description: string;
    onPress: () => void;
}

interface NavigationHubScreenProps {
    eyebrow: string;
    title: string;
    description: string;
    actions: NavigationHubAction[];
}

export function NavigationHubScreen({
    eyebrow,
    title,
    description,
    actions,
}: NavigationHubScreenProps) {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    return (
        <SafeAreaView style={styles.safeArea} edges={['right', 'bottom', 'left']}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.wrapper}>
                    <Text style={styles.eyebrow}>{eyebrow}</Text>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.description}>{description}</Text>

                    <View style={styles.actions}>
                        {actions.map((action) => (
                            <Pressable
                                key={action.title}
                                accessibilityRole="button"
                                style={({ pressed }) => [
                                    styles.card,
                                    pressed && styles.cardPressed,
                                ]}
                                onPress={action.onPress}
                            >
                                <View style={styles.iconContainer}>
                                    <Ionicons name={action.icon} size={24} color={colors.primary} />
                                </View>
                                <View style={styles.cardCopy}>
                                    <Text style={styles.cardTitle}>{action.title}</Text>
                                    <Text style={styles.cardDescription}>{action.description}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={colors.primary} />
                            </Pressable>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

function createStyles(colors: ThemeColors) {
    return StyleSheet.create({
        safeArea: { flex: 1, backgroundColor: colors.background },
        scrollView: { flex: 1, backgroundColor: colors.background },
        content: { flexGrow: 1, padding: spacing.xl },
        wrapper: { width: '100%', maxWidth: 640, alignSelf: 'center' },
        eyebrow: {
            color: colors.primary,
            fontSize: typography.small,
            fontWeight: '800',
            letterSpacing: 1.4,
        },
        title: {
            marginTop: spacing.sm,
            color: colors.text,
            fontSize: typography.title,
            fontWeight: '800',
        },
        description: {
            marginTop: spacing.sm,
            color: colors.textSecondary,
            fontSize: typography.body,
            lineHeight: 23,
        },
        actions: { marginTop: spacing.xxl, gap: spacing.md },
        card: {
            minHeight: 92,
            flexDirection: 'row',
            alignItems: 'center',
            padding: spacing.lg,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.lg,
            backgroundColor: colors.surface,
            ...shadows.card,
        },
        cardPressed: {
            borderColor: colors.primary,
            backgroundColor: colors.primarySoft,
            transform: [{ scale: 0.99 }],
        },
        iconContainer: {
            width: 46,
            height: 46,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: radii.md,
            backgroundColor: colors.primarySoft,
        },
        cardCopy: { flex: 1, marginHorizontal: spacing.lg },
        cardTitle: { color: colors.text, fontSize: typography.body, fontWeight: '800' },
        cardDescription: {
            marginTop: spacing.xs,
            color: colors.textSecondary,
            fontSize: typography.caption,
            lineHeight: 20,
        },
    });
}
