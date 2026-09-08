import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '../../components/AppButton';
import { useDeleteClinic } from '../../hooks/clinics/useDeleteClinic';
import { useClinics } from '../../hooks/clinics/useClinics';
import { SystemAdminStackParamList } from '../../navigation/SystemAdminNavigator';
import { colors, radii, shadows, spacing, typography } from '../../theme/tokens';
import { Clinic } from '../../types/clinic';

type Props = NativeStackScreenProps<SystemAdminStackParamList, 'Clinics'>;

export function ClinicListScreen({ navigation }: Props) {
    const { data, isPending, isError } = useClinics();
    const deleteClinic = useDeleteClinic();

    async function deleteSelectedClinic(id: number): Promise<void> {
        try {
            await deleteClinic.mutateAsync(id);
        } catch {
            Alert.alert(
                'Não foi possível excluir',
                'A clínica não pôde ser excluída. Ela pode possuir dados vinculados.',
            );
        }
    }

    function confirmDelete(clinic: Clinic): void {
        if (deleteClinic.isPending) {
            return;
        }

        Alert.alert(
            `Excluir ${clinic.name}?`,
            'Essa ação não pode ser desfeita.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: () => void deleteSelectedClinic(clinic.id),
                },
            ],
        );
    }

    function renderClinic({ item }: { item: Clinic }) {
        const isDeleting = deleteClinic.isPending && deleteClinic.variables === item.id;

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.clinicIcon}>
                        <Text style={styles.clinicIconText}>CL</Text>
                    </View>
                    <View style={styles.cardHeaderCopy}>
                        <Text style={styles.clinicName}>{item.name}</Text>
                        <Text style={styles.cnpj}>CNPJ {item.cnpj}</Text>
                    </View>
                </View>

                <View style={styles.details}>
                    <View style={styles.detailBlock}>
                        <Text style={styles.detailLabel}>Telefone</Text>
                        <Text style={styles.detailValue}>{item.phone ?? 'Não informado'}</Text>
                    </View>
                    <View style={styles.detailBlock}>
                        <Text style={styles.detailLabel}>E-mail</Text>
                        <Text style={styles.detailValue}>{item.email ?? 'Não informado'}</Text>
                    </View>
                    <View style={styles.detailBlockWide}>
                        <Text style={styles.detailLabel}>Endereço</Text>
                        <Text style={styles.detailValue}>{item.address ?? 'Não informado'}</Text>
                    </View>
                </View>

                <View style={styles.cardActions}>
                    <AppButton
                        label="Criar administrador"
                        variant="secondary"
                        size="small"
                        style={styles.adminButton}
                        onPress={() =>
                            navigation.navigate('CreateClinicAdmin', {
                                clinicId: item.id,
                                clinicName: item.name,
                            })
                        }
                        disabled={deleteClinic.isPending}
                    />
                    <View style={styles.secondaryActions}>
                        <AppButton
                            label="Editar"
                            variant="secondary"
                            size="small"
                            style={styles.secondaryAction}
                            onPress={() => navigation.navigate('EditClinic', { clinic: item })}
                            disabled={deleteClinic.isPending}
                        />
                        <AppButton
                            label="Excluir"
                            variant="danger"
                            size="small"
                            style={styles.secondaryAction}
                            onPress={() => confirmDelete(item)}
                            disabled={deleteClinic.isPending}
                            loading={isDeleting}
                        />
                    </View>
                </View>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['right', 'bottom', 'left']}>
            <View style={styles.container}>
                <View style={styles.heading}>
                    <Text style={styles.eyebrow}>ADMINISTRAÇÃO</Text>
                    <Text style={styles.title}>Clínicas</Text>
                    <Text style={styles.description}>
                        Gerencie as clínicas vinculadas à plataforma.
                    </Text>
                    <AppButton
                        label="Cadastrar clínica"
                        onPress={() => navigation.navigate('CreateClinic')}
                        style={styles.createButton}
                    />
                </View>

                {isPending ? (
                    <View style={styles.stateContainer}>
                        <ActivityIndicator size="large" color={colors.primary} />
                        <Text style={styles.stateMessage}>Carregando clínicas...</Text>
                    </View>
                ) : isError ? (
                    <View style={styles.stateCard}>
                        <Text style={styles.stateTitle}>Não foi possível carregar</Text>
                        <Text style={styles.stateMessage}>
                            Não foi possível carregar as clínicas.
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        style={styles.listContainer}
                        data={data.content}
                        keyExtractor={(clinic) => clinic.id.toString()}
                        renderItem={renderClinic}
                        contentContainerStyle={
                            data.content.length === 0 ? styles.emptyList : styles.list
                        }
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.stateCard}>
                                <Text style={styles.stateTitle}>Nenhuma clínica encontrada.</Text>
                                <Text style={styles.stateMessage}>
                                    Cadastre uma clínica para começar.
                                </Text>
                            </View>
                        }
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    container: { flex: 1, paddingHorizontal: spacing.xl, backgroundColor: colors.background },
    heading: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingVertical: spacing.xl },
    eyebrow: {
        marginBottom: spacing.sm,
        color: colors.primary,
        fontSize: typography.small,
        fontWeight: '800',
        letterSpacing: 1.4,
    },
    title: {
        color: colors.text,
        fontSize: typography.title,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    description: {
        marginTop: spacing.sm,
        color: colors.textSecondary,
        fontSize: typography.body,
        lineHeight: 23,
    },
    createButton: { alignSelf: 'flex-start', marginTop: spacing.xl },
    listContainer: { flex: 1, width: '100%', maxWidth: 760, alignSelf: 'center' },
    list: { paddingBottom: spacing.xxl },
    emptyList: { flexGrow: 1, justifyContent: 'center', paddingBottom: spacing.xxl },
    card: {
        marginBottom: spacing.lg,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.lg,
        backgroundColor: colors.surface,
        ...shadows.card,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center' },
    clinicIcon: {
        width: 46,
        height: 46,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: radii.md,
        backgroundColor: colors.primarySoft,
    },
    clinicIconText: { color: colors.primary, fontSize: typography.small, fontWeight: '800' },
    cardHeaderCopy: { flex: 1, marginLeft: spacing.md },
    clinicName: { color: colors.text, fontSize: typography.heading, fontWeight: '800' },
    cnpj: { marginTop: spacing.xs, color: colors.textSecondary, fontSize: typography.caption },
    details: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.lg,
        marginTop: spacing.xl,
        paddingTop: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    detailBlock: { flexGrow: 1, flexBasis: 180 },
    detailBlockWide: { width: '100%' },
    detailLabel: {
        marginBottom: spacing.xs,
        color: colors.textSecondary,
        fontSize: typography.small,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    detailValue: { color: colors.text, fontSize: typography.caption, lineHeight: 20 },
    cardActions: {
        gap: spacing.md,
        marginTop: spacing.xl,
        paddingTop: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    adminButton: { alignSelf: 'stretch' },
    secondaryActions: { flexDirection: 'row', gap: spacing.md },
    secondaryAction: { flex: 1 },
    stateContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
    stateCard: {
        width: '100%',
        maxWidth: 760,
        alignSelf: 'center',
        padding: spacing.xl,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.lg,
        backgroundColor: colors.surface,
    },
    stateTitle: {
        color: colors.text,
        fontSize: typography.body,
        fontWeight: '800',
        textAlign: 'center',
    },
    stateMessage: {
        marginTop: spacing.sm,
        color: colors.textSecondary,
        fontSize: typography.caption,
        lineHeight: 20,
        textAlign: 'center',
    },
});
