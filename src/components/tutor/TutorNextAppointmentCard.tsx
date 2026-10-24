import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { radii, shadows, spacing, ThemeColors, typography } from '../../theme/tokens';
import { Pet } from '../../types/pet';
import { AppointmentResponse } from '../../types/workflow';
import { localDateTimeToDate } from '../../utils/dateTimeFormatting';

interface TutorNextAppointmentCardProps {
    pet: Pet | null;
    appointments: AppointmentResponse[];
    isPetLoading: boolean;
    isPetError: boolean;
    isAppointmentLoading: boolean;
    isAppointmentError: boolean;
    onRetry: () => void;
    onSchedule: () => void;
}

const SHORT_MONTHS = [
    'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
    'jul', 'ago', 'set', 'out', 'nov', 'dez',
] as const;

function formatShortDate(date: string): string {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(date);

    if (!match) {
        return date;
    }

    const month = SHORT_MONTHS[Number(match[2]) - 1];

    return month ? `${match[3]} ${month}` : date;
}

function formatTime(dateTime: string): string {
    return /T(\d{2}:\d{2})/.exec(dateTime)?.[1] ?? dateTime;
}

function isToday(dateTime: string): boolean {
    const date = localDateTimeToDate(dateTime);

    if (!date) {
        return false;
    }

    const today = new Date();

    return date.getFullYear() === today.getFullYear()
        && date.getMonth() === today.getMonth()
        && date.getDate() === today.getDate();
}

function findNextAppointment(appointments: AppointmentResponse[]): AppointmentResponse | null {
    const now = Date.now();

    return appointments
        .map((appointment) => ({
            appointment,
            date: localDateTimeToDate(appointment.dateTime),
        }))
        .filter(({ appointment, date }) => (
            appointment.status === 'PENDENTE'
            && date !== null
            && date.getTime() >= now
        ))
        .sort((first, second) => (
            first.date?.getTime() ?? Number.POSITIVE_INFINITY
        ) - (
            second.date?.getTime() ?? Number.POSITIVE_INFINITY
        ))[0]?.appointment ?? null;
}

export function TutorNextAppointmentCard({
    pet,
    appointments,
    isPetLoading,
    isPetError,
    isAppointmentLoading,
    isAppointmentError,
    onRetry,
    onSchedule,
}: TutorNextAppointmentCardProps) {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const nextAppointment = useMemo(
        () => findNextAppointment(appointments),
        [appointments],
    );

    return (
        <View style={styles.card}>
            <View style={styles.heading}>
                <Text style={styles.eyebrow}>PRÓXIMA CONSULTA</Text>
                {nextAppointment && isToday(nextAppointment.dateTime) ? (
                    <View style={styles.todayBadge}>
                        <Text style={styles.todayBadgeText}>HOJE</Text>
                    </View>
                ) : null}
            </View>

            {isPetLoading ? (
                <LoadingState message="Carregando seu pet..." colors={colors} styles={styles} />
            ) : isPetError ? (
                <Text style={styles.empty}>
                    Não foi possível identificar o pet para consultar a agenda.
                </Text>
            ) : !pet ? (
                <Text style={styles.empty}>Nenhuma consulta agendada.</Text>
            ) : isAppointmentLoading ? (
                <LoadingState message="Consultando agenda..." colors={colors} styles={styles} />
            ) : isAppointmentError ? (
                <View style={styles.state}>
                    <Text style={styles.empty}>Agenda indisponível no momento.</Text>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Tentar carregar a próxima consulta novamente"
                        style={({ pressed }) => [styles.retry, pressed && styles.pressed]}
                        onPress={onRetry}
                    >
                        <Text style={styles.retryText}>Tentar novamente</Text>
                    </Pressable>
                </View>
            ) : nextAppointment ? (
                <View style={styles.body}>
                    <View style={styles.main}>
                        <View style={styles.petAvatar}>
                            <Ionicons name="paw" size={23} color={colors.onPrimary} />
                        </View>
                        <View style={styles.copy}>
                            <Text style={styles.title}>{nextAppointment.title}</Text>
                            <Text style={styles.petName}>
                                {nextAppointment.petName ?? pet.name}
                            </Text>
                        </View>
                        <View style={styles.when}>
                            <Text style={styles.time}>{formatTime(nextAppointment.dateTime)}</Text>
                            <Text style={styles.date}>{formatShortDate(nextAppointment.dateTime)}</Text>
                        </View>
                    </View>
                    <View style={styles.details}>
                        <DetailRow
                            icon="medical-outline"
                            value={nextAppointment.veterinarianName ?? 'Veterinário não informado'}
                            colors={colors}
                            styles={styles}
                        />
                        <DetailRow
                            icon="business-outline"
                            value={nextAppointment.clinicName ?? 'Clínica não informada'}
                            colors={colors}
                            styles={styles}
                        />
                    </View>
                </View>
            ) : (
                <View style={styles.state}>
                    <Ionicons name="calendar-outline" size={25} color={colors.onPrimary} />
                    <Text style={styles.empty}>Nenhuma consulta agendada para {pet.name}.</Text>
                </View>
            )}

            {pet ? (
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Agendar consulta"
                    style={({ pressed }) => [styles.action, pressed && styles.pressed]}
                    onPress={onSchedule}
                >
                    <Ionicons name="add-circle-outline" size={18} color={colors.onPrimary} />
                    <Text style={styles.actionText}>
                        {nextAppointment ? 'Agendar outra consulta' : 'Agendar consulta'}
                    </Text>
                </Pressable>
            ) : null}
        </View>
    );
}

type Styles = ReturnType<typeof createStyles>;

function LoadingState({
    message,
    colors,
    styles,
}: { message: string; colors: ThemeColors; styles: Styles }) {
    return (
        <View style={styles.loading}>
            <ActivityIndicator size="small" color={colors.onPrimary} />
            <Text style={styles.empty}>{message}</Text>
        </View>
    );
}

function DetailRow({
    icon,
    value,
    colors,
    styles,
}: {
    icon: 'medical-outline' | 'business-outline';
    value: string;
    colors: ThemeColors;
    styles: Styles;
}) {
    return (
        <View style={styles.detailRow}>
            <Ionicons name={icon} size={16} color={colors.onPrimary} />
            <Text style={styles.detailText}>{value}</Text>
        </View>
    );
}

function createStyles(colors: ThemeColors) {
    return StyleSheet.create({
        card: {
            overflow: 'hidden',
            marginBottom: spacing.xxl,
            padding: spacing.lg,
            borderRadius: radii.lg,
            backgroundColor: colors.primaryAction,
            ...shadows.card,
        },
        heading: {
            minHeight: 24,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        eyebrow: {
            color: colors.onPrimary,
            fontSize: typography.small,
            fontWeight: '800',
            letterSpacing: 1.2,
        },
        todayBadge: {
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs,
            borderRadius: radii.pill,
            backgroundColor: colors.overlayLight,
        },
        todayBadgeText: { color: colors.onPrimary, fontSize: 10, fontWeight: '800' },
        body: { marginTop: spacing.lg },
        main: { flexDirection: 'row', alignItems: 'center' },
        petAvatar: {
            width: 44,
            height: 44,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: radii.pill,
            backgroundColor: colors.overlayLight,
        },
        copy: { flex: 1, marginHorizontal: spacing.md },
        title: { color: colors.onPrimary, fontSize: typography.body, fontWeight: '800' },
        petName: {
            marginTop: spacing.xs,
            color: colors.onPrimary,
            fontSize: typography.caption,
            opacity: 0.84,
        },
        when: { alignItems: 'flex-end' },
        time: { color: colors.onPrimary, fontSize: typography.heading, fontWeight: '800' },
        date: {
            marginTop: spacing.xs,
            color: colors.onPrimary,
            fontSize: typography.small,
            opacity: 0.84,
        },
        details: {
            gap: spacing.sm,
            marginTop: spacing.lg,
            paddingTop: spacing.md,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: colors.overlayLight,
        },
        detailRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
        detailText: {
            flex: 1,
            color: colors.onPrimary,
            fontSize: typography.caption,
            lineHeight: 20,
        },
        state: {
            minHeight: 104,
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.sm,
            paddingVertical: spacing.md,
        },
        loading: {
            minHeight: 104,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.sm,
        },
        empty: {
            color: colors.onPrimary,
            fontSize: typography.caption,
            lineHeight: 20,
            textAlign: 'center',
        },
        retry: {
            minHeight: 44,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: spacing.lg,
            borderRadius: radii.md,
            backgroundColor: colors.overlayLight,
        },
        retryText: { color: colors.onPrimary, fontSize: typography.caption, fontWeight: '800' },
        action: {
            minHeight: 48,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.sm,
            marginTop: spacing.lg,
            paddingTop: spacing.md,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: colors.overlayLight,
        },
        actionText: { color: colors.onPrimary, fontSize: typography.caption, fontWeight: '800' },
        pressed: { opacity: 0.72 },
    });
}
