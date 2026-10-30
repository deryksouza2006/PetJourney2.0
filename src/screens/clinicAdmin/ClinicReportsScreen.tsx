import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { ClinicAdminStackParamList } from '../../navigation/ClinicAdminNavigator';
import { radii, shadows, spacing, ThemeColors, typography } from '../../theme/tokens';

type Props = NativeStackScreenProps<ClinicAdminStackParamList, 'ClinicReports'>;

export function ClinicReportsScreen({ navigation }: Props) {
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
                    <Text style={styles.eyebrow}>RELATÓRIOS</Text>
                    <Text style={styles.title}>Relatórios</Text>
                    <Text style={styles.description}>
                        Consulte informações consolidadas da sua clínica.
                    </Text>

                    <View style={styles.options}>
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Relação de Pacientes. Consulte os pacientes cadastrados na clínica."
                            onPress={() => navigation.navigate('ClinicPetReport')}
                            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                        >
                            <View style={styles.iconContainer}>
                                <Ionicons name="paw-outline" size={22} color={colors.primary} />
                            </View>
                            <View style={styles.cardCopy}>
                                <Text style={styles.cardTitle}>Relação de Pacientes</Text>
                                <Text style={styles.cardDescription}>
                                    Consulte os pacientes cadastrados na clínica.
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                        </Pressable>

                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Resumo de Peso Atual. Visualize os pesos atuais agrupados por espécie e sexo."
                            onPress={() => navigation.navigate('ClinicPetWeightReport')}
                            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                        >
                            <View style={styles.iconContainer}>
                                <Ionicons name="scale-outline" size={22} color={colors.primary} />
                            </View>
                            <View style={styles.cardCopy}>
                                <Text style={styles.cardTitle}>Resumo de Peso Atual</Text>
                                <Text style={styles.cardDescription}>
                                    Visualize os pesos atuais agrupados por espécie e sexo.
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                        </Pressable>
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
        content: {
            flexGrow: 1,
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.xl,
            paddingBottom: spacing.lg,
        },
        wrapper: { width: '100%', maxWidth: 760, alignSelf: 'center' },
        eyebrow: {
            color: colors.primary,
            fontSize: typography.small,
            fontWeight: '800',
            letterSpacing: 1.2,
        },
        title: {
            marginTop: spacing.xs,
            color: colors.text,
            fontSize: typography.title,
            fontWeight: '800',
            letterSpacing: -0.5,
        },
        description: {
            marginTop: spacing.sm,
            color: colors.textSecondary,
            fontSize: typography.caption,
            lineHeight: 20,
        },
        options: { gap: spacing.md, marginTop: spacing.xxl },
        card: {
            minHeight: 92,
            flexDirection: 'row',
            alignItems: 'center',
            padding: spacing.lg,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.lg,
            backgroundColor: colors.card,
            ...shadows.card,
        },
        cardPressed: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
        iconContainer: {
            width: 44,
            height: 44,
            flexShrink: 0,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: radii.md,
            backgroundColor: colors.primarySoft,
        },
        cardCopy: { minWidth: 0, flex: 1, marginHorizontal: spacing.md },
        cardTitle: { color: colors.text, fontSize: typography.body, fontWeight: '800' },
        cardDescription: {
            marginTop: spacing.xs,
            color: colors.textSecondary,
            fontSize: typography.small,
            lineHeight: 17,
        },
    });
}
