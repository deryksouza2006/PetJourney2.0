import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '../../components/AppButton';
import { useTheme } from '../../contexts/ThemeContext';
import { usePetReport } from '../../hooks/reports/usePetReport';
import { radii, spacing, ThemeColors, typography } from '../../theme/tokens';
import { PetReportItem } from '../../types/report';

export function ClinicPetReportScreen() {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const report = usePetReport();
    const records = report.data ?? [];

    function renderItem({ item }: { item: PetReportItem }) {
        return (
            <View
                accessible
                accessibilityLabel={`${item.pet}. Tutor ${item.tutor}. Clínica ${item.clinica}.`}
                style={styles.row}
            >
                <View style={styles.rowIcon}>
                    <Ionicons name="paw" size={20} color={colors.primary} />
                </View>
                <View style={styles.rowCopy}>
                    <Text style={styles.petName} numberOfLines={1}>{item.pet}</Text>
                    <Text style={styles.tutorName} numberOfLines={1}>Tutor · {item.tutor}</Text>
                    <Text style={styles.clinicName} numberOfLines={2}>{item.clinica}</Text>
                </View>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['right', 'bottom', 'left']}>
            <View style={styles.container}>
                <View style={styles.heading}>
                    <Text style={styles.eyebrow}>RELATÓRIO</Text>
                    <Text style={styles.title}>Relação de Pacientes</Text>
                    <Text style={styles.description}>
                        Pacientes, tutores e clínica conforme os dados do relatório.
                    </Text>
                    {report.isSuccess ? (
                        <Text style={styles.count}>
                            {records.length === 1 ? '1 registro' : `${records.length} registros`}
                        </Text>
                    ) : null}
                </View>

                {report.isPending ? (
                    <View style={styles.centeredState}>
                        <ActivityIndicator size="small" color={colors.primary} />
                        <Text style={styles.stateMessage}>Carregando relatório...</Text>
                    </View>
                ) : report.isError ? (
                    <View style={styles.centeredState}>
                        <View style={styles.stateIcon}>
                            <Ionicons name="alert-circle-outline" size={24} color={colors.danger} />
                        </View>
                        <Text style={styles.stateTitle}>Não foi possível carregar o relatório.</Text>
                        <Text style={styles.stateMessage}>Tente novamente em alguns instantes.</Text>
                        <AppButton
                            label="Tentar novamente"
                            variant="secondary"
                            size="small"
                            onPress={() => void report.refetch()}
                        />
                    </View>
                ) : (
                    <FlatList
                        style={styles.listSurface}
                        data={records}
                        keyExtractor={(item) => item.petId.toString()}
                        renderItem={renderItem}
                        ItemSeparatorComponent={() => <View style={styles.divider} />}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={records.length === 0
                            ? styles.emptyListContent
                            : undefined}
                        ListEmptyComponent={(
                            <View style={styles.emptyState}>
                                <View style={styles.stateIcon}>
                                    <Ionicons name="paw-outline" size={24} color={colors.primary} />
                                </View>
                                <Text style={styles.stateTitle}>Nenhum paciente encontrado.</Text>
                            </View>
                        )}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

function createStyles(colors: ThemeColors) {
    return StyleSheet.create({
        safeArea: { flex: 1, backgroundColor: colors.background },
        container: {
            flex: 1,
            width: '100%',
            maxWidth: 760,
            alignSelf: 'center',
            paddingHorizontal: spacing.lg,
            backgroundColor: colors.background,
        },
        heading: { paddingTop: spacing.xl, paddingBottom: spacing.lg },
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
            marginTop: spacing.xs,
            color: colors.textSecondary,
            fontSize: typography.caption,
            lineHeight: 20,
        },
        count: {
            marginTop: spacing.sm,
            color: colors.primary,
            fontSize: typography.small,
            fontWeight: '800',
        },
        listSurface: {
            flex: 1,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.lg,
            backgroundColor: colors.surface,
        },
        row: {
            minHeight: 94,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.md,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
        },
        rowIcon: {
            width: 44,
            height: 44,
            flexShrink: 0,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: radii.pill,
            backgroundColor: colors.primarySoft,
        },
        rowCopy: { minWidth: 0, flex: 1 },
        petName: { color: colors.text, fontSize: typography.body, fontWeight: '800' },
        tutorName: {
            marginTop: spacing.xs,
            color: colors.textSecondary,
            fontSize: typography.small,
            lineHeight: 17,
        },
        clinicName: {
            marginTop: spacing.xs,
            color: colors.textSecondary,
            fontSize: typography.small,
            lineHeight: 17,
        },
        divider: {
            height: StyleSheet.hairlineWidth,
            marginLeft: 44 + spacing.lg + spacing.md,
            backgroundColor: colors.border,
        },
        emptyListContent: { flexGrow: 1 },
        emptyState: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.md,
            padding: spacing.xl,
        },
        centeredState: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.md,
            padding: spacing.xl,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.lg,
            backgroundColor: colors.surface,
        },
        stateIcon: {
            width: 48,
            height: 48,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: radii.pill,
            backgroundColor: colors.primarySoft,
        },
        stateTitle: {
            color: colors.text,
            fontSize: typography.body,
            fontWeight: '800',
            lineHeight: 22,
            textAlign: 'center',
        },
        stateMessage: {
            color: colors.textSecondary,
            fontSize: typography.caption,
            lineHeight: 20,
            textAlign: 'center',
        },
    });
}
