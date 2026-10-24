import { PropsWithChildren, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { radii, shadows, spacing, ThemeColors, typography } from '../theme/tokens';

interface HomeScreenLayoutProps extends PropsWithChildren {
    title: string;
    description: string;
}

export function HomeScreenLayout({ title, description, children }: HomeScreenLayoutProps) {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const styles = useMemo(() => createLayoutStyles(colors), [colors]);

    return (
        <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
            <View style={styles.header}>
                <View style={styles.headerInner}>
                    <Text style={styles.eyebrow}>VISÃO GERAL</Text>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.description}>{description}</Text>
                </View>
            </View>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.content,
                    { paddingBottom: spacing.xxl + insets.bottom },
                ]}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.contentInner}>
                    <Text style={styles.sectionTitle}>Acesso rápido</Text>
                    <Text style={styles.sectionDescription}>Selecione uma opção para continuar.</Text>
                    <View style={styles.actions}>{children}</View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

interface HomeActionCardProps {
    icon: string;
    title: string;
    description: string;
    onPress: () => void;
}

export function HomeActionCard({ icon, title, description, onPress }: HomeActionCardProps) {
    const { colors } = useTheme();
    const styles = useMemo(() => createCardStyles(colors), [colors]);

    return (
        <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={onPress}
        >
            <View style={styles.iconContainer}><Text style={styles.icon}>{icon}</Text></View>
            <View style={styles.cardCopy}>
                <Text style={styles.cardTitle}>{title}</Text>
                <Text style={styles.cardDescription}>{description}</Text>
            </View>
            <Text style={styles.arrow} accessibilityElementsHidden>›</Text>
        </Pressable>
    );
}

function createLayoutStyles(colors: ThemeColors) {
    return StyleSheet.create({
        safeArea: { flex: 1, backgroundColor: colors.headerBackground },
        header: {
            paddingHorizontal: spacing.xl,
            paddingTop: spacing.xl,
            paddingBottom: spacing.xxl,
            backgroundColor: colors.headerBackground,
        },
        headerInner: { width: '100%', maxWidth: 720, alignSelf: 'center' },
        eyebrow: {
            marginBottom: spacing.sm,
            color: colors.headerAccent,
            fontSize: typography.small,
            fontWeight: '800',
            letterSpacing: 1.5,
        },
        title: {
            color: colors.headerText,
            fontSize: typography.title,
            fontWeight: '800',
            letterSpacing: -0.6,
        },
        description: {
            maxWidth: 560,
            marginTop: spacing.sm,
            color: colors.headerTextSecondary,
            fontSize: typography.body,
            lineHeight: 23,
        },
        scrollView: {
            flex: 1,
            borderTopLeftRadius: radii.lg,
            borderTopRightRadius: radii.lg,
            backgroundColor: colors.background,
        },
        content: {
            flexGrow: 1,
            paddingHorizontal: spacing.xl,
            paddingTop: spacing.xxl,
        },
        contentInner: { width: '100%', maxWidth: 720, alignSelf: 'center' },
        sectionTitle: { color: colors.text, fontSize: typography.heading, fontWeight: '800' },
        sectionDescription: { marginTop: spacing.xs, color: colors.textSecondary, fontSize: typography.caption },
        actions: { marginTop: spacing.xl, gap: spacing.lg },
    });
}

function createCardStyles(colors: ThemeColors) {
    return StyleSheet.create({
        card: {
            minHeight: 104,
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
            width: 48,
            height: 48,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: radii.md,
            backgroundColor: colors.primarySoft,
        },
        icon: { color: colors.primary, fontSize: typography.caption, fontWeight: '800' },
        cardCopy: { flex: 1, marginHorizontal: spacing.lg },
        cardTitle: { color: colors.text, fontSize: typography.body, fontWeight: '800' },
        cardDescription: {
            marginTop: spacing.xs,
            color: colors.textSecondary,
            fontSize: typography.caption,
            lineHeight: 20,
        },
        arrow: { color: colors.primary, fontSize: 30, fontWeight: '400' },
    });
}
