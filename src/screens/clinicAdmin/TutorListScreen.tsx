import { NativeStackScreenProps } from '@react-navigation/native-stack';
import axios from 'axios';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '../../components/AppButton';
import { useDeleteTutor } from '../../hooks/tutors/useDeleteTutor';
import { useTutors } from '../../hooks/tutors/useTutors';
import { ClinicAdminStackParamList } from '../../navigation/ClinicAdminNavigator';
import { colors, radii, shadows, spacing, typography } from '../../theme/tokens';
import { Tutor } from '../../types/tutor';

type Props = NativeStackScreenProps<ClinicAdminStackParamList, 'Tutors'>;

export function TutorListScreen({ navigation }: Props) {
    const { data, isPending, isError } = useTutors();
    const deleteTutor = useDeleteTutor();

    async function deleteSelectedTutor(id: number): Promise<void> {
        try {
            await deleteTutor.mutateAsync(id);
        } catch (error: unknown) {
            if (axios.isAxiosError(error) && error.response?.status === 409) {
                Alert.alert(
                    'Não foi possível excluir',
                    'O tutor possui dados vinculados e não pode ser excluído.',
                );
                return;
            }

            Alert.alert(
                'Não foi possível excluir',
                'O tutor não pôde ser excluído.',
            );
        }
    }

    function confirmDelete(tutor: Tutor): void {
        if (deleteTutor.isPending) {
            return;
        }

        Alert.alert(
            `Excluir ${tutor.name}?`,
            'Essa ação não pode ser desfeita.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: () => void deleteSelectedTutor(tutor.id),
                },
            ],
        );
    }

    function renderTutor({ item }: { item: Tutor }) {
        const isDeleting = deleteTutor.isPending && deleteTutor.variables === item.id;

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.tutorIcon}>
                        <Text style={styles.tutorIconText}>TU</Text>
                    </View>
                    <View style={styles.cardHeaderCopy}>
                        <Text style={styles.tutorName}>{item.name}</Text>
                        <Text style={styles.cpf}>CPF {item.cpf}</Text>
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
                        onPress={() => navigation.navigate('EditTutor', { tutor: item })}
                        disabled={deleteTutor.isPending}
                    />
                    <AppButton
                        label="Excluir"
                        variant="danger"
                        size="small"
                        style={styles.cardAction}
                        onPress={() => confirmDelete(item)}
                        disabled={deleteTutor.isPending}
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
                    <Text style={styles.eyebrow}>ATENDIMENTO</Text>
                    <Text style={styles.title}>Tutores</Text>
                    <Text style={styles.description}>
                        Gerencie os responsáveis pelos pets da clínica.
                    </Text>
                    <AppButton
                        label="Cadastrar tutor"
                        onPress={() => navigation.navigate('CreateTutor')}
                        style={styles.createButton}
                    />
                </View>

                {isPending ? (
                    <View style={styles.stateContainer}>
                        <ActivityIndicator size="large" color={colors.primary} />
                        <Text style={styles.stateMessage}>Carregando tutores...</Text>
                    </View>
                ) : isError ? (
                    <View style={styles.stateCard}>
                        <Text style={styles.stateTitle}>Não foi possível carregar</Text>
                        <Text style={styles.stateMessage}>
                            Não foi possível carregar os tutores.
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        style={styles.listContainer}
                        data={data.content}
                        keyExtractor={(tutor) => tutor.id.toString()}
                        renderItem={renderTutor}
                        contentContainerStyle={
                            data.content.length === 0 ? styles.emptyList : styles.list
                        }
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.stateCard}>
                                <Text style={styles.stateTitle}>Nenhum tutor encontrado.</Text>
                                <Text style={styles.stateMessage}>
                                    Cadastre um tutor para começar.
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
    tutorIcon: {
        width: 46,
        height: 46,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: radii.md,
        backgroundColor: colors.primarySoft,
    },
    tutorIconText: {
        color: colors.primary,
        fontSize: typography.small,
        fontWeight: '800',
    },
    cardHeaderCopy: { flex: 1, marginLeft: spacing.md },
    tutorName: {
        color: colors.text,
        fontSize: typography.heading,
        fontWeight: '800',
    },
    cpf: {
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
