import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '../../components/AppButton';
import { AppInput } from '../../components/AppInput';
import { PaginationControls } from '../../components/PaginationControls';
import { useAuth } from '../../contexts/AuthContext';
import { useCreateVeterinarianAvailability } from '../../hooks/availability/useCreateVeterinarianAvailability';
import { useDeleteVeterinarianAvailability } from '../../hooks/availability/useDeleteVeterinarianAvailability';
import { useVeterinarianAvailability } from '../../hooks/availability/useVeterinarianAvailability';
import { VeterinarianStackParamList } from '../../navigation/VeterinarianNavigator';
import { colors, createThemedStyles, radii, shadows, spacing, typography } from '../../theme/tokens';
import { DEFAULT_PAGE_SIZE } from '../../types/pagination';
import {
    VeterinarianAvailability,
    VeterinarianAvailabilityRequest,
} from '../../types/veterinarianAvailability';
import { getApiErrorMessage } from '../../utils/apiError';
import { dateInputToIsoDate } from '../../utils/dateValidation';
import { formatDateInput, formatTimeInput } from '../../utils/inputMasks';

type Props = NativeStackScreenProps<
    VeterinarianStackParamList,
    'VeterinarianAvailability'
>;

const AVAILABILITY_RANGE_START = '1900-01-01T00:00:00';
const AVAILABILITY_RANGE_END = '9999-12-31T23:59:59';
const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

function formatDate(dateTime: string): string {
    const match = /^(\d{4})-(\d{2})-(\d{2})T/.exec(dateTime);

    return match ? `${match[3]}/${match[2]}/${match[1]}` : dateTime;
}

function formatTime(dateTime: string): string {
    const match = /T(\d{2}:\d{2})/.exec(dateTime);

    return match?.[1] ?? dateTime;
}

export function VeterinarianAvailabilityScreen(_props: Props) {
    const { user } = useAuth();
    const veterinarianId = user?.veterinarianId ?? null;
    const [page, setPage] = useState(0);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const startTimeInputRef = useRef<TextInput>(null);
    const endTimeInputRef = useRef<TextInput>(null);
    const availability = useVeterinarianAvailability(
        veterinarianId,
        AVAILABILITY_RANGE_START,
        AVAILABILITY_RANGE_END,
        page,
        DEFAULT_PAGE_SIZE,
    );
    const createAvailability = useCreateVeterinarianAvailability();
    const deleteAvailability = useDeleteVeterinarianAvailability();

    function resetForm(): void {
        setDate('');
        setStartTime('');
        setEndTime('');
        setErrorMessage(null);
    }

    function toggleForm(): void {
        if (isFormOpen) {
            resetForm();
            setIsFormOpen(false);
            return;
        }

        setSuccessMessage(null);
        setIsFormOpen(true);
    }

    async function handleCreate(): Promise<void> {
        const trimmedDate = date.trim();
        const trimmedStartTime = startTime.trim();
        const trimmedEndTime = endTime.trim();

        if (!trimmedDate || !trimmedStartTime || !trimmedEndTime) {
            setErrorMessage('Data, início e fim são obrigatórios.');
            return;
        }

        const isoDate = dateInputToIsoDate(trimmedDate);

        if (!isoDate) {
            setErrorMessage('Informe uma data válida no formato DD/MM/AAAA.');
            return;
        }

        if (!TIME_PATTERN.test(trimmedStartTime) || !TIME_PATTERN.test(trimmedEndTime)) {
            setErrorMessage('Informe horários válidos no formato HH:mm.');
            return;
        }

        if (trimmedEndTime <= trimmedStartTime) {
            setErrorMessage('O horário final deve ser maior que o horário inicial.');
            return;
        }

        if (veterinarianId === null) {
            setErrorMessage('Não foi possível identificar o veterinário da sessão.');
            return;
        }

        const request: VeterinarianAvailabilityRequest = {
            veterinarianId,
            startTime: `${isoDate}T${trimmedStartTime}:00`,
            endTime: `${isoDate}T${trimmedEndTime}:00`,
        };

        setErrorMessage(null);

        try {
            await createAvailability.mutateAsync(request);
            resetForm();
            setIsFormOpen(false);
            setSuccessMessage('Horário adicionado com sucesso.');
        } catch (error: unknown) {
            setErrorMessage(
                getApiErrorMessage(
                    error,
                    'Não foi possível adicionar o horário. Verifique os dados e tente novamente.',
                ),
            );
        }
    }

    async function handleDelete(id: number): Promise<void> {
        try {
            await deleteAvailability.mutateAsync(id);

            if (
                availability.data &&
                availability.data.number > 0 &&
                availability.data.numberOfElements === 1
            ) {
                setPage(availability.data.number - 1);
            }

            setSuccessMessage('Horário removido com sucesso.');
        } catch (error: unknown) {
            Alert.alert(
                'Não foi possível remover',
                getApiErrorMessage(error, 'Não foi possível remover o horário. Tente novamente.'),
            );
        }
    }

    function confirmDelete(item: VeterinarianAvailability): void {
        if (deleteAvailability.isPending) {
            return;
        }

        Alert.alert(
            'Remover horário?',
            `${formatDate(item.startTime)}, das ${formatTime(item.startTime)} às ${formatTime(item.endTime)}.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Remover',
                    style: 'destructive',
                    onPress: () => void handleDelete(item.id),
                },
            ],
        );
    }

    function renderAvailability({ item }: { item: VeterinarianAvailability }) {
        const isRemoving =
            deleteAvailability.isPending && deleteAvailability.variables === item.id;

        return (
            <View style={styles.availabilityCard}>
                <View style={styles.availabilityCopy}>
                    <Text style={styles.availabilityDate}>{formatDate(item.startTime)}</Text>
                    <Text style={styles.availabilityTime}>
                        {formatTime(item.startTime)} - {formatTime(item.endTime)}
                    </Text>
                </View>
                <AppButton
                    label="Remover"
                    onPress={() => confirmDelete(item)}
                    variant="danger"
                    size="small"
                    loading={isRemoving}
                    disabled={deleteAvailability.isPending || createAvailability.isPending}
                    style={styles.removeButton}
                />
            </View>
        );
    }

    const listData = availability.data?.content ?? [];

    return (
        <SafeAreaView style={styles.safeArea} edges={['right', 'bottom', 'left']}>
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <FlatList
                    style={styles.listContainer}
                    data={listData}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderAvailability}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.content}
                    ListHeaderComponent={
                        <View style={styles.headerWrapper}>
                            <View style={styles.heading}>
                                <Text style={styles.eyebrow}>AGENDA PROFISSIONAL</Text>
                                <Text style={styles.title}>Minha disponibilidade</Text>
                                <Text style={styles.description}>
                                    Cadastre e gerencie os horários em que você está disponível.
                                </Text>
                                <AppButton
                                    label={isFormOpen ? 'Cancelar' : '+ Adicionar horário'}
                                    onPress={toggleForm}
                                    variant={isFormOpen ? 'secondary' : 'primary'}
                                    disabled={
                                        veterinarianId === null ||
                                        createAvailability.isPending ||
                                        deleteAvailability.isPending
                                    }
                                    style={styles.addButton}
                                />
                            </View>

                            {isFormOpen ? (
                                <View style={styles.formCard}>
                                    <Text style={styles.sectionTitle}>Novo horário</Text>
                                    <Text style={styles.requiredHint}>
                                        Todos os campos são obrigatórios.
                                    </Text>
                                    <View style={styles.fields}>
                                        <AppInput
                                            label="Data *"
                                            value={date}
                                            onChangeText={(text) => setDate(formatDateInput(text))}
                                            placeholder="DD/MM/AAAA"
                                            keyboardType="numeric"
                                            autoCapitalize="none"
                                            maxLength={10}
                                            editable={!createAvailability.isPending}
                                            returnKeyType="next"
                                            onSubmitEditing={() => startTimeInputRef.current?.focus()}
                                        />
                                        <View style={styles.timeFields}>
                                            <View style={styles.timeField}>
                                                <AppInput
                                                    ref={startTimeInputRef}
                                                    label="Início *"
                                                    value={startTime}
                                                    onChangeText={(text) =>
                                                        setStartTime(formatTimeInput(text))
                                                    }
                                                    placeholder="HH:mm"
                                                    keyboardType="numeric"
                                                    autoCapitalize="none"
                                                    maxLength={5}
                                                    editable={!createAvailability.isPending}
                                                    returnKeyType="next"
                                                    onSubmitEditing={() =>
                                                        endTimeInputRef.current?.focus()
                                                    }
                                                />
                                            </View>
                                            <View style={styles.timeField}>
                                                <AppInput
                                                    ref={endTimeInputRef}
                                                    label="Fim *"
                                                    value={endTime}
                                                    onChangeText={(text) =>
                                                        setEndTime(formatTimeInput(text))
                                                    }
                                                    placeholder="HH:mm"
                                                    keyboardType="numeric"
                                                    autoCapitalize="none"
                                                    maxLength={5}
                                                    editable={!createAvailability.isPending}
                                                    returnKeyType="done"
                                                    onSubmitEditing={() => void handleCreate()}
                                                />
                                            </View>
                                        </View>
                                    </View>

                                    {errorMessage ? (
                                        <View
                                            style={styles.errorContainer}
                                            accessibilityLiveRegion="polite"
                                        >
                                            <Text style={styles.error}>{errorMessage}</Text>
                                        </View>
                                    ) : null}

                                    <AppButton
                                        label="Salvar horário"
                                        onPress={() => void handleCreate()}
                                        loading={createAvailability.isPending}
                                        disabled={deleteAvailability.isPending}
                                    />
                                </View>
                            ) : null}

                            {successMessage ? (
                                <View
                                    style={styles.successContainer}
                                    accessibilityLiveRegion="polite"
                                >
                                    <Text style={styles.success}>{successMessage}</Text>
                                </View>
                            ) : null}

                            {listData.length > 0 ? (
                                <Text style={styles.listTitle}>Horários cadastrados</Text>
                            ) : null}
                        </View>
                    }
                    ListEmptyComponent={
                        veterinarianId === null ? (
                            <View style={styles.stateCard}>
                                <Text style={styles.stateTitle}>Sessão não identificada</Text>
                                <Text style={styles.stateMessage}>
                                    Não foi possível identificar o veterinário da sessão.
                                </Text>
                            </View>
                        ) : availability.isPending ? (
                            <View style={styles.stateContainer}>
                                <ActivityIndicator size="large" color={colors.primary} />
                                <Text style={styles.stateMessage}>Carregando horários...</Text>
                            </View>
                        ) : availability.isError ? (
                            <View style={styles.stateCard}>
                                <Text style={styles.stateTitle}>Não foi possível carregar</Text>
                                <Text style={styles.stateMessage}>
                                    Não foi possível carregar sua disponibilidade.
                                </Text>
                                <AppButton
                                    label="Tentar novamente"
                                    onPress={() => void availability.refetch()}
                                    variant="secondary"
                                    size="small"
                                    style={styles.retryButton}
                                />
                            </View>
                        ) : (
                            <View style={styles.stateCard}>
                                <Text style={styles.stateTitle}>
                                    Nenhum horário disponível cadastrado.
                                </Text>
                            </View>
                        )
                    }
                    ListFooterComponent={
                        availability.data && availability.data.totalPages > 0 ? (
                            <PaginationControls
                                page={availability.data.number}
                                totalPages={availability.data.totalPages}
                                isFirst={availability.data.first}
                                isLast={availability.data.last}
                                disabled={
                                    availability.isFetching ||
                                    createAvailability.isPending ||
                                    deleteAvailability.isPending
                                }
                                onPrevious={() => setPage(availability.data.number - 1)}
                                onNext={() => setPage(availability.data.number + 1)}
                            />
                        ) : null
                    }
                />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = createThemedStyles((colors) => ({
    safeArea: { flex: 1, backgroundColor: colors.background },
    keyboardView: { flex: 1 },
    listContainer: { flex: 1, backgroundColor: colors.background },
    content: {
        flexGrow: 1,
        width: '100%',
        maxWidth: 760,
        alignSelf: 'center',
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.xxl,
    },
    headerWrapper: { width: '100%' },
    heading: { paddingVertical: spacing.xl },
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
    addButton: { alignSelf: 'flex-start', marginTop: spacing.xl },
    formCard: {
        marginBottom: spacing.xl,
        padding: spacing.xl,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.lg,
        backgroundColor: colors.surface,
        ...shadows.card,
    },
    sectionTitle: { color: colors.text, fontSize: typography.heading, fontWeight: '800' },
    requiredHint: {
        marginTop: spacing.xs,
        color: colors.textSecondary,
        fontSize: typography.caption,
    },
    fields: { gap: spacing.lg, marginVertical: spacing.xl },
    timeFields: { flexDirection: 'row', gap: spacing.md },
    timeField: { flex: 1 },
    errorContainer: {
        marginBottom: spacing.lg,
        padding: spacing.md,
        borderLeftWidth: 3,
        borderLeftColor: colors.danger,
        borderRadius: radii.sm,
        backgroundColor: colors.errorSurface,
    },
    error: { color: colors.danger, fontSize: typography.caption, lineHeight: 20 },
    successContainer: {
        marginBottom: spacing.xl,
        padding: spacing.md,
        borderLeftWidth: 3,
        borderLeftColor: colors.success,
        borderRadius: radii.sm,
        backgroundColor: colors.successSurface,
    },
    success: { color: colors.success, fontSize: typography.caption, lineHeight: 20 },
    listTitle: {
        marginBottom: spacing.lg,
        color: colors.text,
        fontSize: typography.heading,
        fontWeight: '800',
    },
    availabilityCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.lg,
        marginBottom: spacing.lg,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.lg,
        backgroundColor: colors.surface,
        ...shadows.card,
    },
    availabilityCopy: { flex: 1 },
    availabilityDate: {
        color: colors.text,
        fontSize: typography.body,
        fontWeight: '800',
    },
    availabilityTime: {
        marginTop: spacing.sm,
        color: colors.textSecondary,
        fontSize: typography.caption,
    },
    removeButton: { minWidth: 108 },
    stateContainer: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.md,
        minHeight: 220,
    },
    stateCard: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 160,
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
    retryButton: { marginTop: spacing.lg },
}));
