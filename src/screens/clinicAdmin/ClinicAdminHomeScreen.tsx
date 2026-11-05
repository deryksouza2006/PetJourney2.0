import Ionicons from '@expo/vector-icons/Ionicons';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ClinicMetricGrid } from '../../components/clinicAdmin/ClinicMetricGrid';
import { ClinicSmartCareSummary } from '../../components/clinicAdmin/ClinicSmartCareSummary';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useClinicUpcomingAppointments } from '../../hooks/appointments/useClinicUpcomingAppointments';
import { usePets } from '../../hooks/pets/usePets';
import { useSmartCareRanking } from '../../hooks/smartCare/useSmartCareRanking';
import { useVeterinarians } from '../../hooks/veterinarians/useVeterinarians';
import {
    ClinicAdminStackParamList,
    ClinicAdminTabParamList,
} from '../../navigation/ClinicAdminNavigator';
import { radii, spacing, ThemeColors, typography } from '../../theme/tokens';
import { formatLocalDateTime } from '../../utils/dateTimeFormatting';

type Props = CompositeScreenProps<
    BottomTabScreenProps<ClinicAdminTabParamList, 'ClinicAdminHome'>,
    NativeStackScreenProps<ClinicAdminStackParamList>
>;

export function ClinicAdminHomeScreen({ navigation }: Props) {
    const { user } = useAuth();
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const pets = usePets(0, 1);
    const veterinarians = useVeterinarians(0, 3);
    const upcomingAppointments = useClinicUpcomingAppointments(user?.clinicId ?? null);
    const smartCare = useSmartCareRanking();
    const alerts = useMemo(
        () => (smartCare.data?.analises ?? []).filter(
            (analysis) => analysis.prioridade === 'ALTA' || analysis.prioridade === 'MEDIA',
        ),
        [smartCare.data],
    );
    const clinicName = veterinarians.data?.content.find(
        (veterinarian) => veterinarian.clinicName?.trim(),
    )?.clinicName?.trim() || 'Sua clínica';

    return (
        <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.contentInner}>
                    <View style={styles.introduction}>
                        <Text style={styles.clinicName}>{clinicName}</Text>
                        <Text style={styles.subtitle}>Painel de gestão da clínica</Text>
                    </View>

                    <ClinicMetricGrid
                        patients={{
                            value: pets.data?.totalElements ?? null,
                            isLoading: pets.isPending,
                            isError: pets.isError,
                        }}
                        veterinarians={{
                            value: veterinarians.data?.totalElements ?? null,
                            isLoading: veterinarians.isPending,
                            isError: veterinarians.isError,
                        }}
                        alerts={{
                            value: smartCare.data ? alerts.length : null,
                            isLoading: smartCare.isPending,
                            isError: smartCare.isError,
                        }}
                    />

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>PRÓXIMAS VISITAS</Text>
                        {upcomingAppointments.isPending ? (
                            <View style={styles.visitsState}>
                                <ActivityIndicator size="small" color={colors.primary} />
                                <Text style={styles.visitsStateText}>Carregando próximas visitas...</Text>
                            </View>
                        ) : upcomingAppointments.isError ? (
                            <View style={styles.visitsState}>
                                <View style={styles.visitsIcon}>
                                    <Ionicons name="alert-circle-outline" size={22} color={colors.danger} />
                                </View>
                                <View style={styles.visitsCopy}>
                                    <Text style={styles.visitsTitle}>Agenda indisponível no momento.</Text>
                                    <Pressable
                                        accessibilityRole="button"
                                        accessibilityLabel="Tentar carregar as próximas visitas novamente"
                                        hitSlop={8}
                                        onPress={() => void upcomingAppointments.refetch()}
                                    >
                                        <Text style={styles.retryText}>Tentar novamente</Text>
                                    </Pressable>
                                </View>
                            </View>
                        ) : upcomingAppointments.data.length === 0 ? (
                            <View style={styles.visitsState}>
                                <View style={styles.visitsIcon}>
                                    <Ionicons name="calendar-outline" size={22} color={colors.primary} />
                                </View>
                                <Text style={styles.visitsStateText}>
                                    Nenhuma consulta futura agendada.
                                </Text>
                            </View>
                        ) : (
                            <View style={styles.visitsList}>
                                {upcomingAppointments.data.map((appointment, index) => (
                                    <View
                                        key={appointment.id}
                                        style={[
                                            styles.visitRow,
                                            index > 0 && styles.visitRowDivider,
                                        ]}
                                    >
                                        <View style={styles.visitsIcon}>
                                            <Ionicons name="calendar-outline" size={22} color={colors.primary} />
                                        </View>
                                        <View style={styles.visitsCopy}>
                                            <Text style={styles.visitsTitle}>{appointment.title}</Text>
                                            <Text style={styles.visitsDescription}>
                                                {formatLocalDateTime(appointment.dateTime)}
                                            </Text>
                                            <Text style={styles.visitsDescription}>
                                                {`${appointment.petName ?? 'Pet não informado'} • ${
                                                    appointment.veterinarianName
                                                    ?? 'Veterinário não informado'
                                                }`}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>

                    <ClinicSmartCareSummary
                        alerts={alerts}
                        isLoading={smartCare.isPending}
                        isError={smartCare.isError}
                        onRetry={() => void smartCare.refetch()}
                        onOpenSmartCare={() => navigation.navigate('SmartCare')}
                    />
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
        contentInner: { width: '100%', maxWidth: 760, alignSelf: 'center' },
        introduction: { marginBottom: spacing.xl },
        clinicName: {
            color: colors.text,
            fontSize: typography.title,
            fontWeight: '800',
            letterSpacing: -0.5,
        },
        subtitle: {
            marginTop: spacing.sm,
            color: colors.textSecondary,
            fontSize: typography.caption,
            lineHeight: 20,
        },
        section: { marginBottom: spacing.xxl },
        sectionTitle: {
            marginBottom: spacing.md,
            color: colors.text,
            fontSize: typography.small,
            fontWeight: '800',
            letterSpacing: 1.2,
        },
        visitsState: {
            minHeight: 96,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.md,
            padding: spacing.lg,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.lg,
            backgroundColor: colors.card,
        },
        visitsList: {
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.lg,
            backgroundColor: colors.card,
        },
        visitRow: {
            minHeight: 96,
            flexDirection: 'row',
            alignItems: 'center',
            padding: spacing.lg,
        },
        visitRowDivider: {
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: colors.border,
        },
        visitsIcon: {
            width: 44,
            height: 44,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: radii.md,
            backgroundColor: colors.primarySoft,
        },
        visitsCopy: { flex: 1, marginLeft: spacing.md },
        visitsStateText: {
            color: colors.textSecondary,
            fontSize: typography.caption,
            lineHeight: 20,
            textAlign: 'center',
        },
        visitsTitle: {
            color: colors.text,
            fontSize: typography.caption,
            fontWeight: '800',
            lineHeight: 20,
        },
        visitsDescription: {
            marginTop: spacing.xs,
            color: colors.textSecondary,
            fontSize: typography.small,
            lineHeight: 17,
        },
        retryText: {
            marginTop: spacing.sm,
            color: colors.primary,
            fontSize: typography.caption,
            fontWeight: '800',
        },
    });
}
