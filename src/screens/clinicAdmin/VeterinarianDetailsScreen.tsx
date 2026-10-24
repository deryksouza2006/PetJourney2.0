import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppButton } from '../../components/AppButton';
import { VeterinarianAvatar } from '../../components/clinicAdmin/VeterinarianAvatar';
import { useVeterinarianAvailability } from '../../hooks/availability/useVeterinarianAvailability';
import { useDeleteVeterinarian } from '../../hooks/veterinarians/useDeleteVeterinarian';
import { ClinicAdminStackParamList } from '../../navigation/ClinicAdminNavigator';
import { colors, createThemedStyles, radii, spacing, typography } from '../../theme/tokens';
import { VeterinarianAvailability } from '../../types/veterinarianAvailability';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatLocalDateTime } from '../../utils/dateTimeFormatting';

type Props = NativeStackScreenProps<ClinicAdminStackParamList, 'VeterinarianDetails'>;

const AVAILABILITY_RANGE_DAYS = 30;

function toLocalApiDateTime(date: Date, endOfDay = false): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const time = endOfDay ? '23:59:59' : '00:00:00';

    return `${year}-${month}-${day}T${time}`;
}

function createAvailabilityRange(): { start: string; end: string } {
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + AVAILABILITY_RANGE_DAYS);

    return {
        start: toLocalApiDateTime(startDate),
        end: toLocalApiDateTime(endDate, true),
    };
}

function formatEndTime(dateTime: string): string {
    const match = /T(\d{2}):(\d{2})/.exec(dateTime);
    return match ? `${match[1]}:${match[2]}` : dateTime;
}

function formatSlot(slot: VeterinarianAvailability): string {
    return `${formatLocalDateTime(slot.startTime)} – ${formatEndTime(slot.endTime)}`;
}

function availabilityLabel(total: number): string {
    return total === 1 ? '1 horário cadastrado' : `${total} horários cadastrados`;
}

export function VeterinarianDetailsScreen({ navigation, route }: Props) {
    const { veterinarian } = route.params;
    const insets = useSafeAreaInsets();
    const availabilityRange = useMemo(createAvailabilityRange, []);
    const availability = useVeterinarianAvailability(
        veterinarian.id,
        availabilityRange.start,
        availabilityRange.end,
        0,
        3,
    );
    const deleteVeterinarian = useDeleteVeterinarian();
    const specialty = veterinarian.specialty?.trim();
    const email = veterinarian.email?.trim();
    const phone = veterinarian.phone?.trim();
    const clinicName = veterinarian.clinicName?.trim();

    async function deleteSelectedVeterinarian(): Promise<void> {
        try {
            await deleteVeterinarian.mutateAsync(veterinarian.id);
            Alert.alert('Veterinário excluído', 'O cadastro foi removido com sucesso.', [
                { text: 'OK', onPress: () => navigation.goBack() },
            ]);
        } catch (error: unknown) {
            Alert.alert(
                'Não foi possível excluir',
                getApiErrorMessage(error, 'Não foi possível excluir o veterinário. Tente novamente.'),
            );
        }
    }

    function confirmDelete(): void {
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
                    onPress: () => void deleteSelectedVeterinarian(),
                },
            ],
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['right', 'bottom', 'left']}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.content,
                    { paddingBottom: spacing.xxl + insets.bottom },
                ]}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.wrapper}>
                    <View style={styles.profileCard}>
                        <VeterinarianAvatar name={veterinarian.name} size="large" />
                        <Text style={styles.name}>{veterinarian.name}</Text>
                        <Text style={styles.professionalInfo}>
                            {email || `CRMV ${veterinarian.crmv}`}
                        </Text>
                    </View>

                    <View style={styles.summaryGrid}>
                        {specialty ? (
                            <View style={styles.summaryCard}>
                                <Ionicons name="medical-outline" size={20} color={colors.primary} />
                                <Text style={styles.summaryLabel}>ESPECIALIDADE</Text>
                                <Text style={styles.summaryValue}>{specialty}</Text>
                            </View>
                        ) : null}
                        <View style={styles.summaryCard}>
                            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                            <Text style={styles.summaryLabel}>PRÓXIMOS 30 DIAS</Text>
                            {availability.isPending ? (
                                <ActivityIndicator size="small" color={colors.primary} />
                            ) : availability.isError ? (
                                <Text style={styles.summaryUnavailable}>Indisponível</Text>
                            ) : (
                                <Text style={styles.summaryValue}>
                                    {availabilityLabel(availability.data.totalElements)}
                                </Text>
                            )}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>INFORMAÇÕES PROFISSIONAIS</Text>
                        <View style={styles.surface}>
                            <View style={styles.informationRow}>
                                <View style={styles.informationIcon}>
                                    <Ionicons name="ribbon-outline" size={20} color={colors.primary} />
                                </View>
                                <View style={styles.informationCopy}>
                                    <Text style={styles.informationLabel}>CRMV</Text>
                                    <Text style={styles.informationValue}>{veterinarian.crmv}</Text>
                                </View>
                            </View>
                            {clinicName ? (
                                <>
                                    <View style={styles.divider} />
                                    <View style={styles.informationRow}>
                                        <View style={styles.informationIcon}>
                                            <Ionicons name="business-outline" size={20} color={colors.primary} />
                                        </View>
                                        <View style={styles.informationCopy}>
                                            <Text style={styles.informationLabel}>Clínica</Text>
                                            <Text style={styles.informationValue}>{clinicName}</Text>
                                        </View>
                                    </View>
                                </>
                            ) : null}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>CONTATO</Text>
                        <View style={styles.surface}>
                            {email ? (
                                <View style={styles.informationRow}>
                                    <View style={styles.informationIcon}>
                                        <Ionicons name="mail-outline" size={20} color={colors.primary} />
                                    </View>
                                    <View style={styles.informationCopy}>
                                        <Text style={styles.informationLabel}>E-mail</Text>
                                        <Text style={styles.informationValue} selectable>{email}</Text>
                                    </View>
                                </View>
                            ) : null}
                            {email && phone ? <View style={styles.divider} /> : null}
                            {phone ? (
                                <View style={styles.informationRow}>
                                    <View style={styles.informationIcon}>
                                        <Ionicons name="call-outline" size={20} color={colors.primary} />
                                    </View>
                                    <View style={styles.informationCopy}>
                                        <Text style={styles.informationLabel}>Telefone</Text>
                                        <Text style={styles.informationValue} selectable>{phone}</Text>
                                    </View>
                                </View>
                            ) : null}
                            {!email && !phone ? (
                                <Text style={styles.emptyInformation}>
                                    Nenhuma informação de contato cadastrada.
                                </Text>
                            ) : null}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>DISPONIBILIDADE</Text>
                        <View style={styles.surface}>
                            <View style={styles.availabilityHeader}>
                                <View style={styles.informationIcon}>
                                    <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                                </View>
                                <View style={styles.informationCopy}>
                                    <Text style={styles.availabilityTitle}>Próximos horários</Text>
                                    <Text style={styles.availabilityDescription}>
                                        A disponibilidade é gerenciada pelo veterinário.
                                    </Text>
                                </View>
                            </View>

                            {availability.isPending ? (
                                <View style={styles.availabilityState}>
                                    <ActivityIndicator size="small" color={colors.primary} />
                                    <Text style={styles.stateText}>Carregando disponibilidade...</Text>
                                </View>
                            ) : availability.isError ? (
                                <View style={styles.availabilityState}>
                                    <Text style={styles.errorText}>
                                        Disponibilidade indisponível no momento.
                                    </Text>
                                    <AppButton
                                        label="Tentar novamente"
                                        variant="secondary"
                                        size="small"
                                        onPress={() => void availability.refetch()}
                                    />
                                </View>
                            ) : availability.data.content.length === 0 ? (
                                <Text style={styles.emptyInformation}>
                                    Nenhum horário cadastrado nos próximos 30 dias.
                                </Text>
                            ) : (
                                <View style={styles.slotList}>
                                    {availability.data.content.map((slot) => (
                                        <View key={slot.id} style={styles.slotRow}>
                                            <Ionicons name="time-outline" size={18} color={colors.primary} />
                                            <Text style={styles.slotText}>{formatSlot(slot)}</Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    </View>

                    <View style={styles.actions}>
                        <AppButton
                            label="Editar cadastro"
                            variant="secondary"
                            onPress={() => navigation.navigate('EditVeterinarian', { veterinarian })}
                            disabled={deleteVeterinarian.isPending}
                            style={styles.action}
                        />
                        <AppButton
                            label="Excluir"
                            variant="danger"
                            onPress={confirmDelete}
                            loading={deleteVeterinarian.isPending}
                            style={styles.action}
                        />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = createThemedStyles((themeColors) => ({
    safeArea: { flex: 1, backgroundColor: themeColors.background },
    scrollView: { flex: 1, backgroundColor: themeColors.background },
    content: { flexGrow: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.xl },
    wrapper: { width: '100%', maxWidth: 760, alignSelf: 'center' },
    profileCard: {
        alignItems: 'center',
        padding: spacing.xl,
        borderWidth: 1,
        borderColor: themeColors.border,
        borderRadius: radii.lg,
        backgroundColor: themeColors.surface,
    },
    name: {
        color: themeColors.text,
        fontSize: typography.title,
        fontWeight: '800',
        textAlign: 'center',
    },
    professionalInfo: {
        marginTop: spacing.xs,
        color: themeColors.textSecondary,
        fontSize: typography.caption,
        lineHeight: 20,
        textAlign: 'center',
    },
    summaryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
        marginTop: spacing.md,
        marginBottom: spacing.xxl,
    },
    summaryCard: {
        minWidth: 150,
        minHeight: 112,
        flex: 1,
        justifyContent: 'space-between',
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: themeColors.border,
        borderRadius: radii.lg,
        backgroundColor: themeColors.surface,
    },
    summaryLabel: {
        marginTop: spacing.md,
        color: themeColors.textSecondary,
        fontSize: typography.small,
        fontWeight: '800',
        letterSpacing: 0.8,
    },
    summaryValue: {
        marginTop: spacing.xs,
        color: themeColors.text,
        fontSize: typography.caption,
        fontWeight: '800',
        lineHeight: 20,
    },
    summaryUnavailable: {
        marginTop: spacing.xs,
        color: themeColors.textSecondary,
        fontSize: typography.caption,
        fontWeight: '700',
    },
    section: { marginBottom: spacing.xxl },
    sectionTitle: {
        marginBottom: spacing.md,
        color: themeColors.text,
        fontSize: typography.small,
        fontWeight: '800',
        letterSpacing: 1.2,
    },
    surface: {
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: themeColors.border,
        borderRadius: radii.lg,
        backgroundColor: themeColors.surface,
    },
    informationRow: {
        minHeight: 74,
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
    },
    informationIcon: {
        width: 40,
        height: 40,
        flexShrink: 0,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: radii.md,
        backgroundColor: themeColors.primarySoft,
    },
    informationCopy: { minWidth: 0, flex: 1, marginLeft: spacing.md },
    informationLabel: {
        color: themeColors.textSecondary,
        fontSize: typography.small,
        fontWeight: '700',
    },
    informationValue: {
        marginTop: spacing.xs,
        color: themeColors.text,
        fontSize: typography.caption,
        fontWeight: '700',
        lineHeight: 20,
    },
    divider: {
        height: 1,
        marginLeft: 40 + spacing.lg + spacing.md,
        backgroundColor: themeColors.border,
    },
    emptyInformation: {
        padding: spacing.lg,
        color: themeColors.textSecondary,
        fontSize: typography.caption,
        lineHeight: 20,
        textAlign: 'center',
    },
    availabilityHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: themeColors.border,
    },
    availabilityTitle: {
        color: themeColors.text,
        fontSize: typography.caption,
        fontWeight: '800',
    },
    availabilityDescription: {
        marginTop: spacing.xs,
        color: themeColors.textSecondary,
        fontSize: typography.small,
        lineHeight: 17,
    },
    availabilityState: {
        alignItems: 'center',
        gap: spacing.md,
        padding: spacing.xl,
    },
    stateText: { color: themeColors.textSecondary, fontSize: typography.caption },
    errorText: {
        color: themeColors.danger,
        fontSize: typography.caption,
        lineHeight: 20,
        textAlign: 'center',
    },
    slotList: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
    slotRow: {
        minHeight: 44,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingVertical: spacing.sm,
    },
    slotText: {
        minWidth: 0,
        flex: 1,
        color: themeColors.text,
        fontSize: typography.caption,
        lineHeight: 20,
    },
    actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
    action: { minWidth: 150, flex: 1 },
}));
