import Ionicons from '@expo/vector-icons/Ionicons';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ClinicMetricGrid } from '../../components/clinicAdmin/ClinicMetricGrid';
import { ClinicSmartCareSummary } from '../../components/clinicAdmin/ClinicSmartCareSummary';
import { ClinicTeamSummary } from '../../components/clinicAdmin/ClinicTeamSummary';
import { useTheme } from '../../contexts/ThemeContext';
import { usePets } from '../../hooks/pets/usePets';
import { useSmartCareRanking } from '../../hooks/smartCare/useSmartCareRanking';
import { useVeterinarians } from '../../hooks/veterinarians/useVeterinarians';
import {
    ClinicAdminStackParamList,
    ClinicAdminTabParamList,
} from '../../navigation/ClinicAdminNavigator';
import { radii, spacing, ThemeColors, typography } from '../../theme/tokens';

type Props = CompositeScreenProps<
    BottomTabScreenProps<ClinicAdminTabParamList, 'ClinicAdminHome'>,
    NativeStackScreenProps<ClinicAdminStackParamList>
>;

export function ClinicAdminHomeScreen({ navigation }: Props) {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const pets = usePets(0, 1);
    const veterinarians = useVeterinarians(0, 3);
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
                contentContainerStyle={[
                    styles.content,
                    { paddingBottom: spacing.xxl + insets.bottom },
                ]}
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
                        <View style={styles.visitsState}>
                            <View style={styles.visitsIcon}>
                                <Ionicons name="calendar-outline" size={22} color={colors.primary} />
                            </View>
                            <View style={styles.visitsCopy}>
                                <Text style={styles.visitsTitle}>
                                    Próximas visitas ainda não estão disponíveis
                                </Text>
                                <Text style={styles.visitsDescription}>
                                    A consulta de agendamentos atual é vinculada individualmente a cada pet.
                                </Text>
                            </View>
                        </View>
                    </View>

                    <ClinicTeamSummary
                        veterinarians={veterinarians.data?.content ?? []}
                        total={veterinarians.data?.totalElements ?? 0}
                        isLoading={veterinarians.isPending}
                        isError={veterinarians.isError}
                        onRetry={() => void veterinarians.refetch()}
                        onPress={() => navigation.navigate('ClinicTeam')}
                    />

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
        content: { flexGrow: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.xl },
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
            padding: spacing.lg,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.lg,
            backgroundColor: colors.card,
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
    });
}
