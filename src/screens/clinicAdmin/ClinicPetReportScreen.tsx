import Ionicons from '@expo/vector-icons/Ionicons';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '../../components/AppButton';
import { PetAvatar } from '../../components/veterinarian/PetAvatar';
import { usePetReport } from '../../hooks/reports/usePetReport';
import { colors, createThemedStyles, radii, spacing, typography } from '../../theme/tokens';
import { PetReportItem } from '../../types/report';

export function ClinicPetReportScreen() {
    const report = usePetReport();

    function renderItem({ item }: { item: PetReportItem }) {
        return (
            <View style={styles.row}>
                <PetAvatar />
                <View style={styles.rowCopy}>
                    <Text style={styles.petName} numberOfLines={1}>{item.pet}</Text>
                    <Text style={styles.tutorName} numberOfLines={1}>Tutor · {item.tutor}</Text>
                </View>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['right', 'bottom', 'left']}>
            <View style={styles.container}>
                <View style={styles.heading}>
                    <Text style={styles.eyebrow}>RELATÓRIO</Text>
                    <Text style={styles.title}>Pets da Clínica</Text>
                    <Text style={styles.description}>
                        Pets e tutores retornados pelo relatório da clínica.
                    </Text>
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
                        data={report.data}
                        keyExtractor={(item) => item.petId.toString()}
                        renderItem={renderItem}
                        ItemSeparatorComponent={() => <View style={styles.divider} />}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={report.data.length === 0
                            ? styles.emptyListContent
                            : undefined}
                        ListEmptyComponent={(
                            <View style={styles.emptyState}>
                                <View style={styles.stateIcon}>
                                    <Ionicons name="paw-outline" size={24} color={colors.primary} />
                                </View>
                                <Text style={styles.stateTitle}>
                                    Nenhum pet encontrado no relatório.
                                </Text>
                            </View>
                        )}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = createThemedStyles((themeColors) => ({
    safeArea: { flex: 1, backgroundColor: themeColors.background },
    container: {
        flex: 1,
        width: '100%',
        maxWidth: 760,
        alignSelf: 'center',
        paddingHorizontal: spacing.lg,
        backgroundColor: themeColors.background,
    },
    heading: { paddingTop: spacing.xl, paddingBottom: spacing.lg },
    eyebrow: {
        color: themeColors.primary,
        fontSize: typography.small,
        fontWeight: '800',
        letterSpacing: 1.2,
    },
    title: {
        marginTop: spacing.xs,
        color: themeColors.text,
        fontSize: typography.title,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    description: {
        marginTop: spacing.xs,
        color: themeColors.textSecondary,
        fontSize: typography.caption,
        lineHeight: 20,
    },
    listSurface: {
        flex: 1,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: themeColors.border,
        borderRadius: radii.lg,
        backgroundColor: themeColors.surface,
    },
    row: {
        minHeight: 78,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    rowCopy: { minWidth: 0, flex: 1 },
    petName: {
        color: themeColors.text,
        fontSize: typography.body,
        fontWeight: '800',
    },
    tutorName: {
        marginTop: spacing.xs,
        color: themeColors.textSecondary,
        fontSize: typography.small,
        lineHeight: 17,
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        marginLeft: 48 + spacing.lg + spacing.md,
        backgroundColor: themeColors.border,
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
        borderColor: themeColors.border,
        borderRadius: radii.lg,
        backgroundColor: themeColors.surface,
    },
    stateIcon: {
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: radii.pill,
        backgroundColor: themeColors.primarySoft,
    },
    stateTitle: {
        color: themeColors.text,
        fontSize: typography.body,
        fontWeight: '800',
        lineHeight: 22,
        textAlign: 'center',
    },
    stateMessage: {
        color: themeColors.textSecondary,
        fontSize: typography.caption,
        lineHeight: 20,
        textAlign: 'center',
    },
}));
