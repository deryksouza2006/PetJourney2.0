import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { radii, spacing, ThemeColors, typography } from '../../theme/tokens';

const PRIVACY_ITEMS = [
    {
        icon: 'apps-outline',
        title: 'Funcionamento do PetJourney',
        description:
            'Os dados da sua conta e dos seus pets são usados para disponibilizar os recursos do aplicativo.',
    },
    {
        icon: 'business-outline',
        title: 'Contexto da clínica',
        description:
            'As informações clínicas são acessadas dentro do contexto da clínica vinculada e conforme o perfil de cada usuário.',
    },
    {
        icon: 'paw-outline',
        title: 'Acompanhamento dos pets',
        description:
            'As informações ajudam no acompanhamento dos pets, das consultas e dos cuidados registrados.',
    },
] as const;

export function TutorPrivacyScreen() {
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
                    <Text style={styles.eyebrow}>INFORMAÇÕES</Text>
                    <Text style={styles.title}>Privacidade e dados</Text>
                    <Text style={styles.description}>
                        Entenda de forma simples como suas informações apoiam o uso do PetJourney.
                    </Text>

                    <View style={styles.card}>
                        {PRIVACY_ITEMS.map((item, index) => (
                            <View
                                key={item.title}
                                style={[styles.item, index > 0 && styles.divider]}
                            >
                                <View style={styles.icon}>
                                    <Ionicons name={item.icon} size={21} color={colors.primary} />
                                </View>
                                <View style={styles.copy}>
                                    <Text style={styles.itemTitle}>{item.title}</Text>
                                    <Text style={styles.itemDescription}>{item.description}</Text>
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
        eyebrow: {
            color: colors.primary,
            fontSize: typography.small,
            fontWeight: '800',
            letterSpacing: 1.3,
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
        card: {
            overflow: 'hidden',
            marginTop: spacing.xl,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.lg,
            backgroundColor: colors.surface,
        },
        item: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            padding: spacing.lg,
        },
        divider: {
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: colors.border,
        },
        icon: {
            width: 42,
            height: 42,
            flexShrink: 0,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: radii.md,
            backgroundColor: colors.primarySoft,
        },
        copy: { minWidth: 0, flex: 1, marginLeft: spacing.md },
        itemTitle: {
            color: colors.text,
            fontSize: typography.caption,
            fontWeight: '800',
        },
        itemDescription: {
            marginTop: spacing.xs,
            color: colors.textSecondary,
            fontSize: typography.caption,
            lineHeight: 20,
        },
    });
}
