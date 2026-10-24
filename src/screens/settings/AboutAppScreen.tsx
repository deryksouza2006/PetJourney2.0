import Constants from 'expo-constants';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrandMark } from '../../components/BrandMark';
import { useTheme } from '../../contexts/ThemeContext';
import { radii, shadows, spacing, ThemeColors, typography } from '../../theme/tokens';

const rawCommitHash = process.env.EXPO_PUBLIC_COMMIT_HASH?.trim();
const commitHash = rawCommitHash ? rawCommitHash.slice(0, 10) : 'Desenvolvimento';
const appVersion = Constants.expoConfig?.version ?? 'Não informada';

const TECHNOLOGIES = [
    { area: 'Mobile', technologies: 'React Native • Expo • TypeScript' },
    { area: 'Backend', technologies: 'Java • Spring Boot • PostgreSQL' },
    { area: 'SmartCare', technologies: 'Python • FastAPI' },
] as const;

export function AboutAppScreen() {
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
                    <View style={styles.brandContainer}>
                        <BrandMark />
                    </View>
                    <Text style={styles.description}>
                        Aplicativo para acompanhamento veterinário e gestão clínica.
                    </Text>

                    <View style={styles.card}>
                        <View style={styles.infoSection}>
                            <Text style={styles.label}>Versão</Text>
                            <Text style={styles.value}>{appVersion}</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.infoSection}>
                            <Text style={styles.label}>Commit de referência</Text>
                            <Text style={styles.value}>{commitHash}</Text>
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>Tecnologias</Text>
                    <View style={styles.card}>
                        {TECHNOLOGIES.map((item, index) => (
                            <View key={item.area}>
                                {index > 0 ? <View style={styles.divider} /> : null}
                                <View style={styles.technologySection}>
                                    <Text style={styles.label}>{item.area}</Text>
                                    <Text style={styles.technologyValue}>{item.technologies}</Text>
                                </View>
                            </View>
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
        brandContainer: {
            alignItems: 'center',
            marginTop: spacing.md,
        },
        description: {
            maxWidth: 480,
            alignSelf: 'center',
            marginTop: spacing.lg,
            marginBottom: spacing.xxl,
            color: colors.textSecondary,
            fontSize: typography.body,
            lineHeight: 24,
            textAlign: 'center',
        },
        card: {
            paddingHorizontal: spacing.lg,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.lg,
            backgroundColor: colors.surface,
            ...shadows.card,
        },
        infoSection: { paddingVertical: spacing.lg },
        divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
        label: {
            color: colors.textSecondary,
            fontSize: typography.caption,
            fontWeight: '700',
        },
        value: {
            marginTop: spacing.xs,
            color: colors.text,
            fontSize: typography.heading,
            fontWeight: '800',
        },
        sectionTitle: {
            marginTop: spacing.xxl,
            marginBottom: spacing.md,
            color: colors.text,
            fontSize: typography.heading,
            fontWeight: '800',
        },
        technologySection: { paddingVertical: spacing.lg },
        technologyValue: {
            marginTop: spacing.xs,
            color: colors.text,
            fontSize: typography.body,
            lineHeight: 23,
        },
    });
}
