import Ionicons from '@expo/vector-icons/Ionicons';
import { ComponentProps, ReactNode, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { radii, spacing, ThemeColors, typography } from '../../theme/tokens';
import { MedicalRecord } from '../../types/medicalRecord';
import { Medication, MedicationStatus } from '../../types/medication';
import { AppointmentResponse, AppointmentStatus } from '../../types/workflow';
import { formatLocalDate, formatLocalDateTime } from '../../utils/dateTimeFormatting';

type IoniconName = ComponentProps<typeof Ionicons>['name'];
type StatusTone = 'success' | 'warning' | 'danger' | 'neutral';

interface ClinicalRowProps {
    icon: IoniconName;
    title: string;
    primaryDetail: string;
    secondaryDetail?: string | null;
    trailing?: ReactNode;
}

function ClinicalRow({
    icon,
    title,
    primaryDetail,
    secondaryDetail,
    trailing,
}: ClinicalRowProps) {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    return (
        <View style={styles.row}>
            <View style={styles.icon}>
                <Ionicons name={icon} size={20} color={colors.primary} />
            </View>
            <View style={styles.copy}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.primaryDetail}>{primaryDetail}</Text>
                {secondaryDetail ? (
                    <Text style={styles.secondaryDetail}>{secondaryDetail}</Text>
                ) : null}
            </View>
            {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
        </View>
    );
}

function StatusBadge({ label, tone }: { label: string; tone: StatusTone }) {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    return (
        <View style={[
            styles.statusBadge,
            tone === 'success' && styles.successBadge,
            tone === 'warning' && styles.warningBadge,
            tone === 'danger' && styles.dangerBadge,
            tone === 'neutral' && styles.neutralBadge,
        ]}>
            <Text style={[
                styles.statusLabel,
                tone === 'success' && styles.successLabel,
                tone === 'warning' && styles.warningLabel,
                tone === 'danger' && styles.dangerLabel,
                tone === 'neutral' && styles.neutralLabel,
            ]}>
                {label}
            </Text>
        </View>
    );
}

function getMedicationStatusTone(status: MedicationStatus): StatusTone {
    if (status === 'ATIVO') {
        return 'success';
    }

    return status === 'CANCELADO' ? 'danger' : 'neutral';
}

function getAppointmentStatusTone(status: AppointmentStatus): StatusTone {
    if (status === 'PENDENTE') {
        return 'warning';
    }

    return status === 'CANCELADO' ? 'danger' : 'success';
}

export function PetMedicalRecordRow({ record }: { record: MedicalRecord }) {
    const title = record.diagnosis?.trim()
        || record.mainComplaint?.trim()
        || 'Registro clínico';
    const professional = record.veterinarianName?.trim() || 'Veterinário não informado';

    return (
        <ClinicalRow
            icon="document-text-outline"
            title={title}
            primaryDetail={`${formatLocalDateTime(record.registrationDate)} • ${professional}`}
            secondaryDetail={record.clinicName}
        />
    );
}

export function PetMedicationRow({ medication }: { medication: Medication }) {
    const period = medication.endDate
        ? `${formatLocalDate(medication.startDate)} – ${formatLocalDate(medication.endDate)}`
        : `Desde ${formatLocalDate(medication.startDate)}`;

    return (
        <ClinicalRow
            icon="medkit-outline"
            title={medication.name}
            primaryDetail={`${medication.dosage} • ${medication.frequency}`}
            secondaryDetail={period}
            trailing={(
                <StatusBadge
                    label={medication.status}
                    tone={getMedicationStatusTone(medication.status)}
                />
            )}
        />
    );
}

export function PetAppointmentRow({ appointment }: { appointment: AppointmentResponse }) {
    const professionals = [
        appointment.veterinarianName?.trim() || null,
        appointment.clinicName?.trim() || null,
    ].filter((value): value is string => Boolean(value));

    return (
        <ClinicalRow
            icon="calendar-outline"
            title={appointment.title}
            primaryDetail={formatLocalDateTime(appointment.dateTime)}
            secondaryDetail={professionals.length > 0 ? professionals.join(' • ') : null}
            trailing={(
                <StatusBadge
                    label={appointment.status}
                    tone={getAppointmentStatusTone(appointment.status)}
                />
            )}
        />
    );
}

function createStyles(colors: ThemeColors) {
    return StyleSheet.create({
        row: {
            minHeight: 88,
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: spacing.md,
            padding: spacing.lg,
            backgroundColor: colors.surface,
        },
        icon: {
            width: 38,
            height: 38,
            flexShrink: 0,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: radii.pill,
            backgroundColor: colors.primarySoft,
        },
        copy: { flex: 1, minWidth: 0 },
        title: { color: colors.text, fontSize: typography.caption, fontWeight: '800', lineHeight: 20 },
        primaryDetail: {
            marginTop: spacing.xs,
            color: colors.textSecondary,
            fontSize: typography.small,
            lineHeight: 18,
        },
        secondaryDetail: {
            marginTop: 2,
            color: colors.textSecondary,
            fontSize: typography.small,
            lineHeight: 18,
        },
        trailing: { flexShrink: 0, alignItems: 'flex-end' },
        statusBadge: {
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs,
            borderWidth: 1,
            borderRadius: radii.pill,
        },
        statusLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 0.3 },
        successBadge: { borderColor: colors.success, backgroundColor: colors.successSurface },
        successLabel: { color: colors.success },
        warningBadge: { borderColor: colors.warning, backgroundColor: colors.warningSurface },
        warningLabel: { color: colors.warningText },
        dangerBadge: { borderColor: colors.errorBorder, backgroundColor: colors.errorSurface },
        dangerLabel: { color: colors.danger },
        neutralBadge: { borderColor: colors.border, backgroundColor: colors.inputBackground },
        neutralLabel: { color: colors.textSecondary },
    });
}
