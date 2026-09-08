import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '../../components/AppButton';
import { PaginationControls } from '../../components/PaginationControls';
import { useDeleteVeterinarian } from '../../hooks/veterinarians/useDeleteVeterinarian';
import { useVeterinarians } from '../../hooks/veterinarians/useVeterinarians';
import { ClinicAdminStackParamList } from '../../navigation/ClinicAdminNavigator';
import { colors, radii, shadows, spacing, typography } from '../../theme/tokens';
import { Veterinarian } from '../../types/veterinarian';

type Props = NativeStackScreenProps<ClinicAdminStackParamList, 'Veterinarians'>;

export function VeterinarianListScreen({ navigation }: Props) {
    const [page, setPage] = useState(0);
    const { data, isPending, isError, isFetching } = useVeterinarians(page);
    const deleteVeterinarian = useDeleteVeterinarian();

    async function deleteSelectedVeterinarian(id: number): Promise<void> {
        try {
            await deleteVeterinarian.mutateAsync(id);

            if (data && data.number > 0 && data.numberOfElements === 1) {
                setPage(data.number - 1);
            }
        } catch {
            Alert.alert(
                'Não foi possível excluir',
                'O veterinário não pôde ser excluído. Ele pode possuir dados vinculados.',
            );
        }
    }

    function confirmDelete(veterinarian: Veterinarian): void {
        if (deleteVeterinarian.isPending) {
            return;
        }

        Alert.alert(
            `Excluir ${veterinarian.name}?`,
            'Essa ação não pode ser desfeita.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: () => void deleteSelectedVeterinarian(veterinarian.id),
                },
            ],
        );
    }

    function renderVeterinarian({ item }: { item: Veterinarian }) {
        const isDeleting =
            deleteVeterinarian.isPending && deleteVeterinarian.variables === item.id;

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.veterinarianIcon}>
                        <Text style={styles.veterinarianIconText}>VT</Text>
                    </View>
                    <View style={styles.cardHeaderCopy}>
                        <Text style={styles.veterinarianName}>{item.name}</Text>
                        <Text style={styles.crmv}>CRMV {item.crmv}</Text>
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
                    <View style={styles.detailBlock}>
                        <Text style={styles.detailLabel}>Especialidade</Text>
                        <Text style={styles.detailValue}>{item.specialty ?? 'Não informada'}</Text>
                    </View>
                    <View style={styles.detailBlock}>
                        <Text style={styles.detailLabel}>Clínica</Text>
                        <Text style={styles.detailValue}>{item.clinicName ?? 'Não informada'}</Text>
                    </View>
                </View>

                <View style={styles.cardActions}>
                    <AppButton
                        label="Editar"
                        variant="secondary"
                        size="small"
                        style={styles.cardAction}
                        onPress={() =>
                            navigation.navigate('EditVeterinarian', {
                                veterinarian: item,
                            })
                        }
                        disabled={deleteVeterinarian.isPending}
                    />
                    <AppButton
                        label="Excluir"
                        variant="danger"
                        size="small"
                        style={styles.cardAction}
                        onPress={() => confirmDelete(item)}
                        disabled={deleteVeterinarian.isPending}
                        loading={isDeleting}
                    />
                </View>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['right', 'bottom', 'left']}>
            <View style={styles.container}>
                <View style={styles.heading}>
                    <Text style={styles.eyebrow}>EQUIPE CLÍNICA</Text>
                    <Text style={styles.title}>Veterinários</Text>
                    <Text style={styles.description}>
                        Gerencie os profissionais vinculados à clínica.
                    </Text>
                    <AppButton
                        label="Cadastrar veterinário"
                        onPress={() => navigation.navigate('CreateVeterinarian')}
                        style={styles.createButton}
                    />
                </View>

                {isPending ? (
                    <View style={styles.stateContainer}>
                        <ActivityIndicator size="large" color={colors.primary} />
                        <Text style={styles.stateMessage}>Carregando veterinários...</Text>
                    </View>
                ) : isError ? (
                    <View style={styles.stateCard}>
                        <Text style={styles.stateTitle}>Não foi possível carregar</Text>
                        <Text style={styles.stateMessage}>
                            Não foi possível carregar os veterinários.
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        style={styles.listContainer}
                        data={data.content}
                        keyExtractor={(veterinarian) => veterinarian.id.toString()}
                        renderItem={renderVeterinarian}
                        contentContainerStyle={
                            data.content.length === 0 ? styles.emptyList : styles.list
                        }
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.stateCard}>
                                <Text style={styles.stateTitle}>
                                    Nenhum veterinário encontrado.
                                </Text>
                                <Text style={styles.stateMessage}>
                                    Cadastre um veterinário para começar.
                                </Text>
                            </View>
                        }
                        ListFooterComponent={
                            data.totalPages > 0 ? (
                                <PaginationControls
                                    page={data.number}
                                    totalPages={data.totalPages}
                                    isFirst={data.first}
                                    isLast={data.last}
                                    disabled={isFetching || deleteVeterinarian.isPending}
                                    onPrevious={() => setPage(data.number - 1)}
                                    onNext={() => setPage(data.number + 1)}
                                />
                            ) : null
                        }
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    container: {
        flex: 1,
        paddingHorizontal: spacing.xl,
        backgroundColor: colors.background,
    },
    heading: {
        width: '100%',
        maxWidth: 760,
        alignSelf: 'center',
        paddingVertical: spacing.xl,
    },
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
    veterinarianIcon: {
        width: 46,
        height: 46,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: radii.md,
        backgroundColor: colors.primarySoft,
    },
    veterinarianIconText: {
        color: colors.primary,
        fontSize: typography.small,
        fontWeight: '800',
    },
    cardHeaderCopy: { flex: 1, marginLeft: spacing.md },
    veterinarianName: {
        color: colors.text,
        fontSize: typography.heading,
        fontWeight: '800',
    },
    crmv: {
        marginTop: spacing.xs,
        color: colors.textSecondary,
        fontSize: typography.caption,
    },
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
        flexDirection: 'row',
        gap: spacing.md,
        marginTop: spacing.xl,
        paddingTop: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    cardAction: { flex: 1 },
    stateContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.md,
    },
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
