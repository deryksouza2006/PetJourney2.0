import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '../../components/AppButton';
import { PaginationControls } from '../../components/PaginationControls';
import { useCancelAppointment } from '../../hooks/appointments/useCancelAppointment';
import { useAppointmentsByPet } from '../../hooks/appointments/useAppointmentsByPet';
import { usePets } from '../../hooks/pets/usePets';
import { TutorStackParamList } from '../../navigation/TutorNavigator';
import { colors, createThemedStyles, radii, shadows, spacing, typography } from '../../theme/tokens';
import { DEFAULT_PAGE_SIZE } from '../../types/pagination';
import { AppointmentResponse, AppointmentStatus } from '../../types/workflow';
import { getApiErrorMessage } from '../../utils/apiError';
import {
    canCancelAppointment,
    formatLocalDateTime,
} from '../../utils/dateTimeFormatting';

type Props = NativeStackScreenProps<TutorStackParamList, 'TutorAgenda'>;

function formatStatus(status: AppointmentStatus): string {
    return status.charAt(0) + status.slice(1).toLocaleLowerCase('pt-BR');
}

function compareAppointments(first: AppointmentResponse, second: AppointmentResponse): number {
    const now = Date.now();
    const firstTime = new Date(first.dateTime).getTime();
    const secondTime = new Date(second.dateTime).getTime();
    const firstIsFuture = Number.isFinite(firstTime) && firstTime >= now;
    const secondIsFuture = Number.isFinite(secondTime) && secondTime >= now;

    if (firstIsFuture !== secondIsFuture) {
        return firstIsFuture ? -1 : 1;
    }

    if (!Number.isFinite(firstTime)) {
        return 1;
    }
    if (!Number.isFinite(secondTime)) {
        return -1;
    }

    return firstIsFuture ? firstTime - secondTime : secondTime - firstTime;
}

export function TutorAgendaScreen(_props: Props) {
    const [selectedPetId, setSelectedPetId] = useState<number | null>(null);
    const [page, setPage] = useState(0);
    const [cancellingAppointmentId, setCancellingAppointmentId] = useState<number | null>(null);
    const [cancellationError, setCancellationError] = useState<string | null>(null);
    const pets = usePets(0, 100);
    const appointments = useAppointmentsByPet(selectedPetId, page, DEFAULT_PAGE_SIZE);
    const cancelAppointment = useCancelAppointment();
    const sortedAppointments = useMemo(
        () => [...(appointments.data?.content ?? [])].sort(compareAppointments),
        [appointments.data],
    );

    function selectPet(petId: number): void {
        setSelectedPetId(petId);
        setPage(0);
        setCancellationError(null);
    }

    async function handleCancel(appointmentId: number): Promise<void> {
        if (cancelAppointment.isPending) {
            return;
        }

        setCancellingAppointmentId(appointmentId);
        setCancellationError(null);

        try {
            await cancelAppointment.mutateAsync(appointmentId);
            Alert.alert('Consulta cancelada', 'Consulta cancelada com sucesso.');
        } catch (error: unknown) {
            setCancellationError(getApiErrorMessage(
                error,
                'Não foi possível cancelar a consulta. Tente novamente.',
            ));
        } finally {
            setCancellingAppointmentId(null);
        }
    }

    function confirmCancellation(appointmentId: number): void {
        setCancellationError(null);
        Alert.alert(
            'Cancelar consulta',
            'Tem certeza de que deseja cancelar esta consulta?',
            [
                { text: 'Voltar', style: 'cancel' },
                {
                    text: 'Cancelar consulta',
                    style: 'destructive',
                    onPress: () => void handleCancel(appointmentId),
                },
            ],
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['right', 'bottom', 'left']}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.wrapper}>
                    <Text style={styles.eyebrow}>ÁREA DO TUTOR</Text>
                    <Text style={styles.title}>Agenda</Text>
                    <Text style={styles.description}>
                        Selecione um dos seus pets para consultar as consultas agendadas.
                    </Text>

                    <View style={styles.sectionCard}>
                        <Text style={styles.sectionTitle}>Escolha o pet</Text>

                        {pets.isPending ? (
                            <LoadingState message="Carregando seus pets..." />
                        ) : pets.isError ? (
                            <View style={styles.stateBox}>
                                <Text style={styles.stateTitle}>Não foi possível carregar seus pets</Text>
                                <Text style={styles.stateMessage}>
                                    {getApiErrorMessage(
                                        pets.error,
                                        'Não foi possível consultar seus pets agora.',
                                    )}
                                </Text>
                                <AppButton
                                    label="Tentar novamente"
                                    onPress={() => void pets.refetch()}
                                    variant="secondary"
                                    size="small"
                                    style={styles.retryButton}
                                />
                            </View>
                        ) : pets.data.content.length === 0 ? (
                            <StateMessage title="Nenhum pet encontrado." />
                        ) : (
                            <View style={styles.petOptions}>
                                {pets.data.content.map((pet) => {
                                    const isSelected = pet.id === selectedPetId;

                                    return (
                                        <Pressable
                                            key={pet.id}
                                            accessibilityRole="button"
                                            accessibilityState={{ selected: isSelected }}
                                            style={({ pressed }) => [
                                                styles.petCard,
                                                isSelected && styles.petCardSelected,
                                                pressed && styles.cardPressed,
                                            ]}
                                            onPress={() => selectPet(pet.id)}
                                        >
                                            <Text style={[
                                                styles.petName,
                                                isSelected && styles.selectedText,
                                            ]}>
                                                {pet.name}
                                            </Text>
                                            <Text style={styles.petSpecies}>{pet.species}</Text>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        )}
                    </View>

                    <View style={styles.agendaSection}>
                        <Text style={styles.sectionTitle}>Consultas</Text>

                        {cancellationError ? (
                            <Text style={styles.errorText}>{cancellationError}</Text>
                        ) : null}

                        {selectedPetId === null ? (
                            <StateMessage text="Selecione um pet para visualizar a agenda." />
                        ) : appointments.isPending ? (
                            <LoadingState message="Carregando consultas..." />
                        ) : appointments.isError ? (
                            <View style={styles.stateBox}>
                                <Text style={styles.stateTitle}>Não foi possível carregar a agenda</Text>
                                <Text style={styles.stateMessage}>
                                    {getApiErrorMessage(
                                        appointments.error,
                                        'Não foi possível consultar as consultas deste pet.',
                                    )}
                                </Text>
                                <AppButton
                                    label="Tentar novamente"
                                    onPress={() => void appointments.refetch()}
                                    variant="secondary"
                                    size="small"
                                    style={styles.retryButton}
                                />
                            </View>
                        ) : sortedAppointments.length === 0 ? (
                            <StateMessage title="Nenhuma consulta encontrada para este pet." />
                        ) : (
                            <View style={styles.appointmentList}>
                                {sortedAppointments.map((appointment) => (
                                    <AppointmentCard
                                        key={appointment.id}
                                        appointment={appointment}
                                        isCancelling={
                                            cancelAppointment.isPending
                                            && cancellingAppointmentId === appointment.id
                                        }
                                        cancellationDisabled={cancelAppointment.isPending}
                                        onCancel={() => confirmCancellation(appointment.id)}
                                    />
                                ))}

                                <PaginationControls
                                    page={appointments.data.number}
                                    totalPages={appointments.data.totalPages}
                                    isFirst={appointments.data.first}
                                    isLast={appointments.data.last}
                                    disabled={appointments.isFetching}
                                    onPrevious={() => setPage(appointments.data.number - 1)}
                                    onNext={() => setPage(appointments.data.number + 1)}
                                />
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

interface AppointmentCardProps {
    appointment: AppointmentResponse;
    isCancelling: boolean;
    cancellationDisabled: boolean;
    onCancel: () => void;
}

function AppointmentCard({
    appointment,
    isCancelling,
    cancellationDisabled,
    onCancel,
}: AppointmentCardProps) {
    const isCancellable = appointment.status === 'PENDENTE'
        && canCancelAppointment(appointment.dateTime);

    return (
        <View style={styles.appointmentCard}>
            <View style={styles.appointmentHeader}>
                <Text style={styles.appointmentTitle}>{appointment.title}</Text>
                <View style={[
                    styles.statusBadge,
                    appointment.status === 'CANCELADO' && styles.statusCancelled,
                    appointment.status === 'REALIZADO' && styles.statusCompleted,
                ]}>
                    <Text style={[
                        styles.statusText,
                        appointment.status === 'CANCELADO' && styles.statusCancelledText,
                        appointment.status === 'REALIZADO' && styles.statusCompletedText,
                    ]}>
                        {formatStatus(appointment.status)}
                    </Text>
                </View>
            </View>

            <Text style={styles.appointmentDate}>
                {formatLocalDateTime(appointment.dateTime)}
            </Text>
            <Text style={styles.appointmentDetail}>
                {appointment.veterinarianName ?? 'Veterinário não informado'}
            </Text>
            {appointment.clinicName ? (
                <Text style={styles.appointmentDetail}>{appointment.clinicName}</Text>
            ) : null}
            {appointment.description ? (
                <Text style={styles.appointmentDescription}>{appointment.description}</Text>
            ) : null}
            {isCancellable ? (
                <AppButton
                    label="Cancelar consulta"
                    onPress={onCancel}
                    variant="danger"
                    size="small"
                    disabled={cancellationDisabled}
                    loading={isCancelling}
                    style={styles.cancelButton}
                />
            ) : null}
        </View>
    );
}

function LoadingState({ message }: { message: string }) {
    return (
        <View style={styles.loadingState}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.stateMessage}>{message}</Text>
        </View>
    );
}

function StateMessage({ title, text }: { title?: string; text?: string }) {
    return (
        <View style={styles.stateBox}>
            {title ? <Text style={styles.stateTitle}>{title}</Text> : null}
            {text ? <Text style={styles.stateMessage}>{text}</Text> : null}
        </View>
    );
}

const styles = createThemedStyles((colors) => ({
    safeArea: { flex: 1, backgroundColor: colors.background },
    scrollView: { flex: 1, backgroundColor: colors.background },
    content: { flexGrow: 1, padding: spacing.xl },
    wrapper: { width: '100%', maxWidth: 760, alignSelf: 'center' },
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
        marginBottom: spacing.xl,
        color: colors.textSecondary,
        fontSize: typography.body,
        lineHeight: 23,
    },
    sectionCard: {
        padding: spacing.xl,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.lg,
        backgroundColor: colors.surface,
        ...shadows.card,
    },
    sectionTitle: { color: colors.text, fontSize: typography.heading, fontWeight: '800' },
    petOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
        marginTop: spacing.xl,
    },
    petCard: {
        minWidth: 130,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.md,
        backgroundColor: colors.background,
    },
    petCardSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
    cardPressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
    petName: { color: colors.text, fontSize: typography.body, fontWeight: '800' },
    petSpecies: {
        marginTop: spacing.xs,
        color: colors.textSecondary,
        fontSize: typography.small,
    },
    selectedText: { color: colors.primaryDark },
    agendaSection: { marginTop: spacing.xxl },
    appointmentList: { gap: spacing.lg, marginTop: spacing.xl },
    appointmentCard: {
        padding: spacing.xl,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.lg,
        backgroundColor: colors.surface,
        ...shadows.card,
    },
    appointmentHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: spacing.md,
    },
    appointmentTitle: {
        flex: 1,
        color: colors.text,
        fontSize: typography.heading,
        fontWeight: '800',
    },
    appointmentDate: {
        marginTop: spacing.lg,
        color: colors.primaryDark,
        fontSize: typography.body,
        fontWeight: '700',
    },
    appointmentDetail: {
        marginTop: spacing.sm,
        color: colors.textSecondary,
        fontSize: typography.caption,
        lineHeight: 20,
    },
    appointmentDescription: {
        marginTop: spacing.lg,
        paddingTop: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        color: colors.text,
        fontSize: typography.caption,
        lineHeight: 21,
    },
    cancelButton: { marginTop: spacing.xl },
    statusBadge: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radii.pill,
        backgroundColor: colors.primarySoft,
    },
    statusText: { color: colors.primaryDark, fontSize: typography.small, fontWeight: '800' },
    statusCancelled: { backgroundColor: colors.errorSurface },
    statusCancelledText: { color: colors.danger },
    statusCompleted: { backgroundColor: colors.successSurface },
    statusCompletedText: { color: colors.success },
    loadingState: {
        alignItems: 'center',
        gap: spacing.md,
        marginTop: spacing.xl,
        padding: spacing.xl,
    },
    stateBox: {
        alignItems: 'center',
        marginTop: spacing.xl,
        padding: spacing.xl,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.md,
        backgroundColor: colors.surface,
    },
    stateTitle: {
        color: colors.text,
        fontSize: typography.caption,
        fontWeight: '800',
        textAlign: 'center',
    },
    stateMessage: {
        color: colors.textSecondary,
        fontSize: typography.caption,
        lineHeight: 20,
        textAlign: 'center',
    },
    retryButton: { marginTop: spacing.lg },
    errorText: {
        marginTop: spacing.lg,
        color: colors.danger,
        fontSize: typography.caption,
        lineHeight: 20,
        textAlign: 'center',
    },
}));
