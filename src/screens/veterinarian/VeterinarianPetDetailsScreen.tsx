import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '../../components/AppButton';
import { PaginationControls } from '../../components/PaginationControls';
import {
    PetAppointmentRow,
    PetMedicalRecordRow,
    PetMedicationRow,
} from '../../components/veterinarian/PetClinicalRows';
import { PetClinicalHeader } from '../../components/veterinarian/PetClinicalHeader';
import { PetSmartCareCard } from '../../components/veterinarian/PetSmartCareCard';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppointmentsByPet } from '../../hooks/appointments/useAppointmentsByPet';
import { useMedicalRecordsByPet } from '../../hooks/medicalRecords/useMedicalRecordsByPet';
import { useMedicationsByPet } from '../../hooks/medications/useMedicationsByPet';
import { usePet } from '../../hooks/pets/usePet';
import { useSmartCareRanking } from '../../hooks/smartCare/useSmartCareRanking';
import { VeterinarianStackParamList } from '../../navigation/VeterinarianNavigator';
import { radii, spacing, ThemeColors, typography } from '../../theme/tokens';
import { DEFAULT_PAGE_SIZE } from '../../types/pagination';
import { AppointmentResponse } from '../../types/workflow';
import { localDateTimeToDate } from '../../utils/dateTimeFormatting';

type Props = NativeStackScreenProps<VeterinarianStackParamList, 'PetDetails'>;
type PetDetailTab = 'overview' | 'records' | 'medications' | 'appointments';

const TABS: Array<{ value: PetDetailTab; label: string }> = [
    { value: 'overview', label: 'Visão geral' },
    { value: 'records', label: 'Prontuários' },
    { value: 'medications', label: 'Medicamentos' },
    { value: 'appointments', label: 'Consultas' },
];

function compareAppointments(first: AppointmentResponse, second: AppointmentResponse): number {
    const now = Date.now();
    const firstDate = localDateTimeToDate(first.dateTime);
    const secondDate = localDateTimeToDate(second.dateTime);
    const firstTime = firstDate?.getTime() ?? Number.NaN;
    const secondTime = secondDate?.getTime() ?? Number.NaN;
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

export function VeterinarianPetDetailsScreen({ navigation, route }: Props) {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const petId = route.params.petId;
    const [selectedTab, setSelectedTab] = useState<PetDetailTab>('overview');
    const [recordsPage, setRecordsPage] = useState(0);
    const [medicationsPage, setMedicationsPage] = useState(0);
    const [appointmentsPage, setAppointmentsPage] = useState(0);
    const pet = usePet(petId);
    const smartCare = useSmartCareRanking({ staleTime: Number.POSITIVE_INFINITY });
    const medicalRecords = useMedicalRecordsByPet(
        selectedTab === 'records' ? petId : null,
        recordsPage,
        DEFAULT_PAGE_SIZE,
    );
    const medications = useMedicationsByPet(
        selectedTab === 'medications' ? petId : null,
        medicationsPage,
        DEFAULT_PAGE_SIZE,
    );
    const appointments = useAppointmentsByPet(
        selectedTab === 'appointments' ? petId : null,
        appointmentsPage,
        DEFAULT_PAGE_SIZE,
    );
    const smartCareAnalysis = smartCare.data?.analises.find((item) => item.petId === petId) ?? null;
    const hasInsufficientSmartCareData = smartCare.data?.semDadosSuficientes.some(
        (item) => item.petId === petId,
    ) ?? false;
    const sortedAppointments = useMemo(
        () => [...(appointments.data?.content ?? [])].sort(compareAppointments),
        [appointments.data?.content],
    );

    if (pet.isPending) {
        return (
            <SafeAreaView style={styles.centered} edges={['right', 'bottom', 'left']}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.stateMessage}>Carregando paciente...</Text>
            </SafeAreaView>
        );
    }

    if (pet.isError) {
        return (
            <SafeAreaView style={styles.centered} edges={['right', 'bottom', 'left']}>
                <View style={styles.stateCard}>
                    <Text style={styles.stateTitle}>Não foi possível carregar</Text>
                    <Text style={styles.stateMessage}>
                        Não foi possível carregar os dados deste paciente.
                    </Text>
                    <AppButton
                        label="Tentar novamente"
                        onPress={() => void pet.refetch()}
                        variant="secondary"
                        size="small"
                        style={styles.retryButton}
                    />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['right', 'bottom', 'left']}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <PetClinicalHeader pet={pet.data} />

                <ScrollView
                    horizontal
                    nestedScrollEnabled
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.tabsContent}
                    style={styles.tabsScroll}
                >
                    {TABS.map((tab) => {
                        const isSelected = selectedTab === tab.value;

                        return (
                            <Pressable
                                key={tab.value}
                                accessibilityRole="tab"
                                accessibilityState={{ selected: isSelected }}
                                onPress={() => setSelectedTab(tab.value)}
                                style={({ pressed }) => [
                                    styles.tab,
                                    isSelected && styles.selectedTab,
                                    pressed && styles.pressed,
                                ]}
                            >
                                <Text style={[
                                    styles.tabLabel,
                                    isSelected && styles.selectedTabLabel,
                                ]}>
                                    {tab.label}
                                </Text>
                            </Pressable>
                        );
                    })}
                </ScrollView>

                <View style={styles.tabContent}>
                    {selectedTab === 'overview' ? (
                        <PetSmartCareCard
                            analysis={smartCareAnalysis}
                            hasInsufficientData={hasInsufficientSmartCareData}
                            isLoading={smartCare.isPending}
                            isError={smartCare.isError && !smartCare.data}
                            isRetrying={smartCare.isFetching}
                            onRetry={() => void smartCare.refetch()}
                        />
                    ) : null}

                    {selectedTab === 'records' ? (
                        <View>
                            <Text style={styles.sectionTitle}>Prontuários</Text>
                            {medicalRecords.isPending ? (
                                <TabLoadingState message="Carregando prontuários..." />
                            ) : medicalRecords.isError ? (
                                <TabErrorState
                                    message="Não foi possível carregar os prontuários."
                                    isRetrying={medicalRecords.isFetching}
                                    onRetry={() => void medicalRecords.refetch()}
                                />
                            ) : medicalRecords.data.content.length === 0 ? (
                                <TabEmptyState message="Nenhum prontuário registrado." />
                            ) : (
                                <View style={styles.listSurface}>
                                    {medicalRecords.data.content.map((record, index) => (
                                        <View key={record.id}>
                                            {index > 0 ? <View style={styles.divider} /> : null}
                                            <PetMedicalRecordRow record={record} />
                                        </View>
                                    ))}
                                    <View style={styles.paginationWrapper}>
                                        <PaginationControls
                                            page={medicalRecords.data.number}
                                            totalPages={medicalRecords.data.totalPages}
                                            isFirst={medicalRecords.data.first}
                                            isLast={medicalRecords.data.last}
                                            disabled={medicalRecords.isFetching}
                                            onPrevious={() => setRecordsPage(medicalRecords.data.number - 1)}
                                            onNext={() => setRecordsPage(medicalRecords.data.number + 1)}
                                        />
                                    </View>
                                </View>
                            )}
                        </View>
                    ) : null}

                    {selectedTab === 'medications' ? (
                        <View>
                            <Text style={styles.sectionTitle}>Medicamentos</Text>
                            {medications.isPending ? (
                                <TabLoadingState message="Carregando medicamentos..." />
                            ) : medications.isError ? (
                                <TabErrorState
                                    message="Não foi possível carregar os medicamentos."
                                    isRetrying={medications.isFetching}
                                    onRetry={() => void medications.refetch()}
                                />
                            ) : medications.data.content.length === 0 ? (
                                <TabEmptyState message="Nenhum medicamento registrado." />
                            ) : (
                                <View style={styles.listSurface}>
                                    {medications.data.content.map((medication, index) => (
                                        <View key={medication.id}>
                                            {index > 0 ? <View style={styles.divider} /> : null}
                                            <PetMedicationRow medication={medication} />
                                        </View>
                                    ))}
                                    <View style={styles.paginationWrapper}>
                                        <PaginationControls
                                            page={medications.data.number}
                                            totalPages={medications.data.totalPages}
                                            isFirst={medications.data.first}
                                            isLast={medications.data.last}
                                            disabled={medications.isFetching}
                                            onPrevious={() => setMedicationsPage(medications.data.number - 1)}
                                            onNext={() => setMedicationsPage(medications.data.number + 1)}
                                        />
                                    </View>
                                </View>
                            )}
                        </View>
                    ) : null}

                    {selectedTab === 'appointments' ? (
                        <View>
                            <Text style={styles.sectionTitle}>Consultas</Text>
                            {appointments.isPending ? (
                                <TabLoadingState message="Carregando consultas..." />
                            ) : appointments.isError ? (
                                <TabErrorState
                                    message="Não foi possível carregar as consultas."
                                    isRetrying={appointments.isFetching}
                                    onRetry={() => void appointments.refetch()}
                                />
                            ) : sortedAppointments.length === 0 ? (
                                <TabEmptyState message="Nenhuma consulta encontrada." />
                            ) : (
                                <View style={styles.listSurface}>
                                    {sortedAppointments.map((appointment, index) => (
                                        <View key={appointment.id}>
                                            {index > 0 ? <View style={styles.divider} /> : null}
                                            <PetAppointmentRow appointment={appointment} />
                                            {appointment.status === 'PENDENTE' ? (
                                                <AppButton
                                                    label="Registrar atendimento"
                                                    onPress={() => navigation.navigate(
                                                        'RegisterConsultation',
                                                        { petId, appointment },
                                                    )}
                                                    variant="secondary"
                                                    size="small"
                                                    style={styles.appointmentAction}
                                                />
                                            ) : null}
                                        </View>
                                    ))}
                                    <View style={styles.paginationWrapper}>
                                        <PaginationControls
                                            page={appointments.data.number}
                                            totalPages={appointments.data.totalPages}
                                            isFirst={appointments.data.first}
                                            isLast={appointments.data.last}
                                            disabled={appointments.isFetching}
                                            onPrevious={() => setAppointmentsPage(appointments.data.number - 1)}
                                            onNext={() => setAppointmentsPage(appointments.data.number + 1)}
                                        />
                                    </View>
                                </View>
                            )}
                        </View>
                    ) : null}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

function TabLoadingState({ message }: { message: string }) {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    return (
        <View style={styles.tabState}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.stateMessage}>{message}</Text>
        </View>
    );
}

function TabEmptyState({ message }: { message: string }) {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    return (
        <View style={styles.tabState}>
            <Text style={styles.stateMessage}>{message}</Text>
        </View>
    );
}

interface TabErrorStateProps {
    message: string;
    isRetrying: boolean;
    onRetry: () => void;
}

function TabErrorState({ message, isRetrying, onRetry }: TabErrorStateProps) {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    return (
        <View style={styles.tabState}>
            <Text style={styles.stateMessage}>{message}</Text>
            <AppButton
                label="Tentar novamente"
                onPress={onRetry}
                variant="secondary"
                size="small"
                loading={isRetrying}
            />
        </View>
    );
}

function createStyles(colors: ThemeColors) {
    return StyleSheet.create({
        safeArea: { flex: 1, backgroundColor: colors.background },
        scroll: { flex: 1, backgroundColor: colors.background },
        content: {
            width: '100%',
            maxWidth: 760,
            alignSelf: 'center',
            padding: spacing.lg,
            paddingBottom: spacing.xxxl,
        },
        centered: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.md,
            padding: spacing.xl,
            backgroundColor: colors.background,
        },
        tabsScroll: {
            marginHorizontal: -spacing.lg,
            marginTop: spacing.xl,
        },
        tabsContent: {
            gap: spacing.xs,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.xs,
            borderRadius: radii.lg,
            backgroundColor: colors.inputBackground,
        },
        tab: {
            minHeight: 42,
            minWidth: 94,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: spacing.md,
            borderWidth: 1,
            borderColor: 'transparent',
            borderRadius: radii.md,
        },
        selectedTab: {
            borderColor: colors.border,
            backgroundColor: colors.surface,
        },
        pressed: { opacity: 0.72 },
        tabLabel: {
            color: colors.textSecondary,
            fontSize: typography.small,
            fontWeight: '700',
        },
        selectedTabLabel: { color: colors.text, fontWeight: '900' },
        tabContent: { marginTop: spacing.xl },
        sectionTitle: {
            marginBottom: spacing.lg,
            color: colors.text,
            fontSize: typography.heading,
            fontWeight: '800',
        },
        listSurface: {
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.lg,
            backgroundColor: colors.surface,
        },
        divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
        appointmentAction: {
            marginHorizontal: spacing.lg,
            marginBottom: spacing.lg,
        },
        paginationWrapper: { paddingHorizontal: spacing.lg },
        tabState: {
            minHeight: 132,
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.md,
            padding: spacing.xl,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.lg,
            backgroundColor: colors.surface,
        },
        stateCard: {
            width: '100%',
            maxWidth: 520,
            alignItems: 'center',
            padding: spacing.xl,
            borderWidth: 1,
            borderColor: colors.errorBorder,
            borderRadius: radii.lg,
            backgroundColor: colors.errorSurface,
        },
        stateTitle: {
            color: colors.text,
            fontSize: typography.body,
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
    });
}
