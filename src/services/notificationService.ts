import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { AppointmentResponse } from '../types/workflow';
import { formatLocalDateTime, localDateTimeToDate } from '../utils/dateTimeFormatting';

const APPOINTMENT_CHANNEL_ID = 'appointments';
const REMINDER_ADVANCE_MS = 24 * 60 * 60 * 1000;

let permissionPromptAttempted = false;
let permissionDeniedWarningIssued = false;
let initializationPromise: Promise<void> | null = null;

export interface AppointmentNotificationData extends Record<string, unknown> {
    type: 'appointment';
    appointmentId: number;
    petId: number;
    notificationKind: 'confirmation' | 'reminder';
}

export interface AppointmentNotificationResult {
    permissionGranted: boolean;
    reminderScheduled: boolean;
    shouldWarnPermissionDenied: boolean;
}

interface ScheduleAppointmentNotificationsInput {
    appointment: AppointmentResponse;
    petId: number;
}

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export function initializeLocalNotifications(): Promise<void> {
    if (initializationPromise) {
        return initializationPromise;
    }

    initializationPromise = (async () => {
        if (Platform.OS !== 'android') {
            return;
        }

        await Notifications.setNotificationChannelAsync(APPOINTMENT_CHANNEL_ID, {
            name: 'Consultas',
            description: 'Confirmações e lembretes de consultas veterinárias',
            importance: Notifications.AndroidImportance.HIGH,
            sound: 'default',
            vibrationPattern: [0, 250, 250, 250],
        });
    })();

    return initializationPromise;
}

async function ensureNotificationPermission(): Promise<{
    granted: boolean;
    shouldWarn: boolean;
}> {
    await initializeLocalNotifications();
    let permission = await Notifications.getPermissionsAsync();

    if (!permission.granted && permission.canAskAgain && !permissionPromptAttempted) {
        permissionPromptAttempted = true;
        permission = await Notifications.requestPermissionsAsync({
            ios: {
                allowAlert: true,
                allowBadge: false,
                allowSound: true,
            },
        });
    }

    if (permission.granted) {
        return { granted: true, shouldWarn: false };
    }

    const shouldWarn = !permissionDeniedWarningIssued;
    permissionDeniedWarningIssued = true;
    return { granted: false, shouldWarn };
}

function notificationData(
    appointmentId: number,
    petId: number,
    notificationKind: AppointmentNotificationData['notificationKind'],
): AppointmentNotificationData {
    return {
        type: 'appointment',
        appointmentId,
        petId,
        notificationKind,
    };
}

function immediateTrigger(): Notifications.NotificationTriggerInput {
    return Platform.OS === 'android'
        ? { channelId: APPOINTMENT_CHANNEL_ID }
        : null;
}

export async function scheduleAppointmentNotifications({
    appointment,
    petId,
}: ScheduleAppointmentNotificationsInput): Promise<AppointmentNotificationResult> {
    const permission = await ensureNotificationPermission();

    if (!permission.granted) {
        return {
            permissionGranted: false,
            reminderScheduled: false,
            shouldWarnPermissionDenied: permission.shouldWarn,
        };
    }

    const petName = appointment.petName ?? 'seu pet';
    const veterinarianName = appointment.veterinarianName ?? 'o veterinário';

    await Notifications.scheduleNotificationAsync({
        content: {
            title: 'Consulta agendada',
            body: `Consulta de ${petName} com ${veterinarianName} em ${formatLocalDateTime(appointment.dateTime)}.`,
            sound: 'default',
            data: notificationData(appointment.id, petId, 'confirmation'),
        },
        trigger: immediateTrigger(),
    });

    const appointmentDate = localDateTimeToDate(appointment.dateTime);

    if (!appointmentDate) {
        return {
            permissionGranted: true,
            reminderScheduled: false,
            shouldWarnPermissionDenied: false,
        };
    }

    const reminderDate = new Date(appointmentDate.getTime() - REMINDER_ADVANCE_MS);

    if (reminderDate.getTime() <= Date.now()) {
        return {
            permissionGranted: true,
            reminderScheduled: false,
            shouldWarnPermissionDenied: false,
        };
    }

    const appointmentTime = `${String(appointmentDate.getHours()).padStart(2, '0')}:${String(
        appointmentDate.getMinutes(),
    ).padStart(2, '0')}`;

    await Notifications.scheduleNotificationAsync({
        content: {
            title: 'Lembrete de consulta',
            body: `A consulta de ${petName} é amanhã às ${appointmentTime}.`,
            sound: 'default',
            data: notificationData(appointment.id, petId, 'reminder'),
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: reminderDate,
            channelId: Platform.OS === 'android' ? APPOINTMENT_CHANNEL_ID : undefined,
        },
    });

    return {
        permissionGranted: true,
        reminderScheduled: true,
        shouldWarnPermissionDenied: false,
    };
}

export async function cancelScheduledAppointmentNotifications(
    appointmentId: number,
): Promise<void> {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    const matchingNotifications = scheduledNotifications.filter((notification) => {
        const data = getAppointmentNotificationData(notification.content.data);
        return data?.appointmentId === appointmentId;
    });

    await Promise.all(matchingNotifications.map((notification) =>
        Notifications.cancelScheduledNotificationAsync(notification.identifier),
    ));
}

export function getAppointmentNotificationData(
    data: Record<string, unknown> | null | undefined,
): AppointmentNotificationData | null {
    if (
        data?.type !== 'appointment'
        || typeof data.appointmentId !== 'number'
        || typeof data.petId !== 'number'
        || (data.notificationKind !== 'confirmation' && data.notificationKind !== 'reminder')
    ) {
        return null;
    }

    return {
        type: 'appointment',
        appointmentId: data.appointmentId,
        petId: data.petId,
        notificationKind: data.notificationKind,
    };
}
