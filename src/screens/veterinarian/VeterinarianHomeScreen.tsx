import Ionicons from '@expo/vector-icons/Ionicons';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useVeterinarianAvailabilityMonth } from '../../hooks/availability/useVeterinarianAvailabilityMonth';
import { usePets } from '../../hooks/pets/usePets';
import { useSmartCareRanking } from '../../hooks/smartCare/useSmartCareRanking';
import {
    VeterinarianStackParamList,
    VeterinarianTabParamList,
} from '../../navigation/VeterinarianNavigator';
import { radii, shadows, spacing, ThemeColors, typography } from '../../theme/tokens';

type Props = CompositeScreenProps<
    BottomTabScreenProps<VeterinarianTabParamList, 'VeterinarianHome'>,
    NativeStackScreenProps<VeterinarianStackParamList>
>;

function getLocalIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function countLabel(count: number, singular: string, plural: string): string {
    return `${count} ${count === 1 ? singular : plural}`;
}

function getFriendlyUsername(username: string | undefined): string {
    const value = username?.trim();

    return value && !value.includes('@') ? value : 'Veterinário';
}

export function VeterinarianHomeScreen({ navigation }: Props) {
    const { user } = useAuth();
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const [currentTime, setCurrentTime] = useState(() => new Date());
    const today = getLocalIsoDate(currentTime);
    const firstDay = new Date(currentTime.getFullYear(), currentTime.getMonth(), 1);
    const lastDay = new Date(currentTime.getFullYear(), currentTime.getMonth() + 1, 0);
    const currentMonthRange = {
        start: `${getLocalIsoDate(firstDay)}T00:00:00`,
        end: `${getLocalIsoDate(lastDay)}T23:59:59`,
    };
    const pets = usePets(0, 1);
    const availability = useVeterinarianAvailabilityMonth(
        user?.veterinarianId ?? null,
        currentMonthRange.start,
        currentMonthRange.end,
    );
    const publishedTodayCount = availability.data?.filter(
        (slot) => slot.startTime.startsWith(`${today}T`),
    ).length ?? 0;
    const smartCare = useSmartCareRanking();
    const analyzedCount = smartCare.data?.analises.length ?? 0;
    const attentionCount = smartCare.data?.analises.filter(
        (analysis) => analysis.prioridade === 'ALTA' || analysis.prioridade === 'MEDIA',
    ).length ?? 0;

    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(new Date()), 60_000);

        return () => clearInterval(interval);
    }, []);

    return (
        <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.content,
                    { paddingBottom: spacing.xxl + insets.bottom },
                ]}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.contentInner}>
                    <View style={styles.greetingBlock}>
                        <Text style={styles.greeting}>
                            Olá, {getFriendlyUsername(user?.username)}
                        </Text>
                        <Text style={styles.greetingDescription}>
                            Confira um resumo do seu atendimento.
                        </Text>
                    </View>

                    <View style={styles.sectionHeading}>
                        <Text style={styles.sectionTitle}>Hoje</Text>
                        <Text style={styles.sectionDescription}>
                            Indicadores atualizados com os dados da clínica.
                        </Text>
                    </View>

                    <View style={styles.metricsRow}>
                        <View
                            accessible
                            accessibilityLabel={pets.data
                                ? `${pets.data.totalElements} pacientes acessíveis`
                                : 'Resumo de pacientes'}
                            style={styles.metricCard}
                        >
                            <View style={styles.metricIcon}>
                                <Ionicons name="paw" size={20} color={colors.primary} />
                            </View>
                            <Text style={styles.metricLabel}>Pacientes acessíveis</Text>
                            {pets.isPending ? (
                                <ActivityIndicator
                                    size="small"
                                    color={colors.primary}
                                    style={styles.metricLoader}
                                />
                            ) : pets.isError ? (
                                <Text style={styles.metricError}>Indisponível</Text>
                            ) : (
                                <>
                                    <Text style={styles.metricValue}>{pets.data.totalElements}</Text>
                                    {pets.data.totalElements === 0 ? (
                                        <Text style={styles.metricCaption}>
                                            Nenhum paciente disponível.
                                        </Text>
                                    ) : null}
                                </>
                            )}
                        </View>

                        <View
                            accessible
                            accessibilityLabel={availability.data
                                ? `${publishedTodayCount} horários publicados hoje`
                                : 'Resumo de horários publicados hoje'}
                            style={styles.metricCard}
                        >
                            <View style={styles.metricIcon}>
                                <Ionicons name="calendar" size={20} color={colors.primary} />
                            </View>
                            <Text style={styles.metricLabel}>Horários publicados</Text>
                            {user?.veterinarianId == null ? (
                                <Text style={styles.metricError}>Indisponível</Text>
                            ) : availability.isPending ? (
                                <ActivityIndicator
                                    size="small"
                                    color={colors.primary}
                                    style={styles.metricLoader}
                                />
                            ) : availability.isError ? (
                                <Text style={styles.metricError}>Indisponível</Text>
                            ) : (
                                <Text style={styles.metricValue}>
                                    {publishedTodayCount}
                                </Text>
                            )}
                            {!availability.isPending && !availability.isError
                                && publishedTodayCount === 0 ? (
                                    <Text style={styles.metricCaption}>
                                        Nenhum horário publicado hoje.
                                    </Text>
                                ) : (
                                    <Text style={styles.metricCaption}>Hoje</Text>
                                )}
                        </View>
                    </View>

                    <View style={styles.sectionHeading}>
                        <Text style={styles.sectionTitle}>SmartCare</Text>
                        <Text style={styles.sectionDescription}>
                            Prioridades calculadas pelo serviço de acompanhamento.
                        </Text>
                    </View>

                    <View style={styles.smartCareCard}>
                        <View style={styles.smartCareHeader}>
                            <View style={styles.smartCareIcon}>
                                <Ionicons name="pulse" size={23} color={colors.primary} />
                            </View>
                            <View style={styles.smartCareCopy}>
                                {smartCare.isPending ? (
                                    <View style={styles.inlineLoading}>
                                        <ActivityIndicator size="small" color={colors.primary} />
                                        <Text style={styles.smartCareMessage}>
                                            Carregando resumo...
                                        </Text>
                                    </View>
                                ) : smartCare.isError ? (
                                    <>
                                        <Text style={styles.smartCareTitle}>
                                            SmartCare indisponível no momento.
                                        </Text>
                                        <Pressable
                                            accessibilityRole="button"
                                            accessibilityLabel="Tentar carregar o resumo SmartCare novamente"
                                            hitSlop={8}
                                            onPress={() => void smartCare.refetch()}
                                        >
                                            <Text style={styles.retryText}>Tentar novamente</Text>
                                        </Pressable>
                                    </>
                                ) : analyzedCount === 0 ? (
                                    <>
                                        <Text style={styles.smartCareTitle}>
                                            Nenhuma análise disponível.
                                        </Text>
                                        <Text style={styles.smartCareMessage}>
                                            Os demais dados continuam acessíveis normalmente.
                                        </Text>
                                    </>
                                ) : attentionCount > 0 ? (
                                    <>
                                        <Text style={styles.smartCareTitle}>
                                            {countLabel(
                                                attentionCount,
                                                'paciente requer acompanhamento',
                                                'pacientes requerem acompanhamento',
                                            )}
                                        </Text>
                                        <Text style={styles.smartCareMessage}>
                                            {countLabel(
                                                analyzedCount,
                                                'paciente analisado',
                                                'pacientes analisados',
                                            )}
                                        </Text>
                                    </>
                                ) : (
                                    <>
                                        <Text style={styles.smartCareTitle}>
                                            Nenhum paciente com prioridade elevada.
                                        </Text>
                                        <Text style={styles.smartCareMessage}>
                                            {countLabel(
                                                analyzedCount,
                                                'paciente analisado',
                                                'pacientes analisados',
                                            )}
                                        </Text>
                                    </>
                                )}
                            </View>
                        </View>

                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Abrir SmartCare"
                            style={({ pressed }) => [
                                styles.cardAction,
                                pressed && styles.pressed,
                            ]}
                            onPress={() => navigation.navigate('SmartCare')}
                        >
                            <Text style={styles.cardActionText}>Ver SmartCare</Text>
                            <Ionicons name="chevron-forward" size={18} color={colors.primary} />
                        </Pressable>
                    </View>

                    <View style={styles.sectionHeading}>
                        <Text style={styles.sectionTitle}>Ações rápidas</Text>
                        <Text style={styles.sectionDescription}>
                            Acesse uma tarefa que não está nas abas principais.
                        </Text>
                    </View>

                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Cadastrar paciente"
                        style={({ pressed }) => [
                            styles.quickAction,
                            pressed && styles.quickActionPressed,
                        ]}
                        onPress={() => navigation.navigate('RegisterTutorWithPet')}
                    >
                        <View style={styles.quickActionIcon}>
                            <Ionicons name="person-add" size={22} color={colors.onPrimary} />
                        </View>
                        <View style={styles.quickActionCopy}>
                            <Text style={styles.quickActionTitle}>Cadastrar paciente</Text>
                            <Text style={styles.quickActionDescription}>
                                Registre um novo tutor com os dados do pet.
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.primary} />
                    </Pressable>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

function createStyles(colors: ThemeColors) {
    return StyleSheet.create({
        safeArea: { flex: 1, backgroundColor: colors.background },
        scrollView: { flex: 1, backgroundColor: colors.background },
        content: { flexGrow: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.xl },
        contentInner: { width: '100%', maxWidth: 760, alignSelf: 'center' },
        greetingBlock: { marginBottom: spacing.xxl },
        greeting: {
            color: colors.text,
            fontSize: typography.title,
            fontWeight: '800',
            letterSpacing: -0.5,
        },
        greetingDescription: {
            marginTop: spacing.sm,
            color: colors.textSecondary,
            fontSize: typography.body,
            lineHeight: 23,
        },
        sectionHeading: { marginBottom: spacing.md },
        sectionTitle: { color: colors.text, fontSize: typography.heading, fontWeight: '800' },
        sectionDescription: {
            marginTop: spacing.xs,
            color: colors.textSecondary,
            fontSize: typography.caption,
            lineHeight: 20,
        },
        metricsRow: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: spacing.md,
            marginBottom: spacing.xxl,
        },
        metricCard: {
            flex: 1,
            minWidth: 145,
            minHeight: 142,
            padding: spacing.lg,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.lg,
            backgroundColor: colors.card,
            ...shadows.card,
        },
        metricIcon: {
            width: 38,
            height: 38,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: spacing.md,
            borderRadius: radii.md,
            backgroundColor: colors.primarySoft,
        },
        metricLabel: {
            color: colors.textSecondary,
            fontSize: typography.small,
            fontWeight: '700',
            lineHeight: 17,
        },
        metricValue: {
            marginTop: spacing.xs,
            color: colors.text,
            fontSize: typography.title,
            fontWeight: '800',
        },
        metricError: {
            marginTop: spacing.sm,
            color: colors.danger,
            fontSize: typography.caption,
            fontWeight: '700',
        },
        metricLoader: { alignSelf: 'flex-start', marginTop: spacing.md },
        metricCaption: {
            marginTop: spacing.xs,
            color: colors.textSecondary,
            fontSize: typography.small,
        },
        smartCareCard: {
            marginBottom: spacing.xxl,
            padding: spacing.lg,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.lg,
            backgroundColor: colors.card,
            ...shadows.card,
        },
        smartCareHeader: { flexDirection: 'row', alignItems: 'flex-start' },
        smartCareIcon: {
            width: 44,
            height: 44,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: radii.md,
            backgroundColor: colors.primarySoft,
        },
        smartCareCopy: {
            flex: 1,
            minHeight: 44,
            justifyContent: 'center',
            marginLeft: spacing.md,
        },
        smartCareTitle: {
            color: colors.text,
            fontSize: typography.body,
            fontWeight: '800',
            lineHeight: 22,
        },
        smartCareMessage: {
            marginTop: spacing.xs,
            color: colors.textSecondary,
            fontSize: typography.caption,
            lineHeight: 20,
        },
        inlineLoading: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
        retryText: {
            marginTop: spacing.sm,
            color: colors.primary,
            fontSize: typography.caption,
            fontWeight: '800',
        },
        cardAction: {
            minHeight: 48,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: spacing.lg,
            paddingTop: spacing.md,
            borderTopWidth: 1,
            borderTopColor: colors.border,
        },
        cardActionText: {
            color: colors.primary,
            fontSize: typography.caption,
            fontWeight: '800',
        },
        pressed: { opacity: 0.7 },
        quickAction: {
            minHeight: 72,
            flexDirection: 'row',
            alignItems: 'center',
            padding: spacing.md,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.lg,
            backgroundColor: colors.card,
        },
        quickActionPressed: {
            borderColor: colors.primary,
            backgroundColor: colors.primarySoft,
            transform: [{ scale: 0.99 }],
        },
        quickActionIcon: {
            width: 44,
            height: 44,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: radii.md,
            backgroundColor: colors.primaryAction,
        },
        quickActionCopy: { flex: 1, marginHorizontal: spacing.md },
        quickActionTitle: {
            color: colors.text,
            fontSize: typography.body,
            fontWeight: '800',
        },
        quickActionDescription: {
            marginTop: spacing.xs,
            color: colors.textSecondary,
            fontSize: typography.small,
            lineHeight: 17,
        },
    });
}
