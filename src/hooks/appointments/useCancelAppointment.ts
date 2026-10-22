import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cancelAppointment } from '../../services/appointmentService';
import { cancelScheduledAppointmentNotifications } from '../../services/notificationService';
import { FUTURE_AVAILABLE_SLOTS_QUERY_KEY } from '../availability/useFutureAvailableSlots';
import { APPOINTMENTS_QUERY_KEY } from './useAppointmentsByPet';

export function useCancelAppointment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: cancelAppointment,
        onSuccess: async (_appointment, appointmentId) => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: APPOINTMENTS_QUERY_KEY,
                }),
                queryClient.invalidateQueries({
                    queryKey: FUTURE_AVAILABLE_SLOTS_QUERY_KEY,
                }),
                cancelScheduledAppointmentNotifications(appointmentId).catch(() => undefined),
            ]);
        },
    });
}
