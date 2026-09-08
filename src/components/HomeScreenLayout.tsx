import { StatusBar } from 'expo-status-bar';
import { PropsWithChildren } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, shadows, spacing, typography } from '../theme/tokens';
import { BrandMark } from './BrandMark';

interface HomeScreenLayoutProps extends PropsWithChildren {
    title: string;
    description: string;
    onSignOut: () => void;
}

export function HomeScreenLayout({ title, description, onSignOut, children }: HomeScreenLayoutProps) {
    const insets = useSafeAreaInsets();

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar style="light" />
            <View style={styles.header}>
                <View style={styles.headerInner}>
                    <View style={styles.topBar}>
                        <BrandMark compact light />
                        <Pressable
                            accessibilityRole="button"
                            style={({ pressed }) => [styles.signOutButton, pressed && styles.signOutButtonPressed]}
                            onPress={onSignOut}
                        >
                            <Text style={styles.signOutText}>Sair</Text>
                        </Pressable>
                    </View>
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

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.text },
    header: {
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.md,
        paddingBottom: spacing.xxxl,
        backgroundColor: colors.text,
    },
    headerInner: { width: '100%', maxWidth: 720, alignSelf: 'center' },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.xxxl,
    },
    signOutButton: {
        minHeight: 42,
        minWidth: 64,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.lg,
        borderWidth: 1,
        borderColor: colors.overlayLight,
        borderRadius: radii.pill,
    },
    signOutButtonPressed: { backgroundColor: colors.overlayLight },
    signOutText: { color: colors.white, fontSize: typography.caption, fontWeight: '700' },
    eyebrow: {
        marginBottom: spacing.sm,
        color: '#8FC9F4',
        fontSize: typography.small,
        fontWeight: '800',
        letterSpacing: 1.5,
    },
    title: {
        color: colors.white,
        fontSize: typography.title,
        fontWeight: '800',
        letterSpacing: -0.6,
    },
    description: {
        maxWidth: 560,
        marginTop: spacing.sm,
        color: '#C7D0D7',
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
