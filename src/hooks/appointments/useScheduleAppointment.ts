import { useMutation, useQueryClient } from '@tanstack/react-query';
import { scheduleAppointment } from '../../services/workflowService';
import {
    AppointmentNotificationResult,
    scheduleAppointmentNotifications,
} from '../../services/notificationService';
import { FUTURE_AVAILABLE_SLOTS_QUERY_KEY } from '../availability/useFutureAvailableSlots';
import { APPOINTMENTS_QUERY_KEY } from './useAppointmentsByPet';

export function useScheduleAppointment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (request: Parameters<typeof scheduleAppointment>[0]) => {
            const appointment = await scheduleAppointment(request);
            let notifications: AppointmentNotificationResult = {
                permissionGranted: false,
                reminderScheduled: false,
                shouldWarnPermissionDenied: false,
            };

            try {
                notifications = await scheduleAppointmentNotifications({
                    appointment,
                    petId: request.petId,
                });
            } catch {
                // A confirmação da API não pode ser revertida por uma falha nativa local.
            }

            return { appointment, notifications };
        },
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: FUTURE_AVAILABLE_SLOTS_QUERY_KEY,
                }),
                queryClient.invalidateQueries({
                    queryKey: APPOINTMENTS_QUERY_KEY,
                }),
            ]);
        },
    });
}
