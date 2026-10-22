import { useQuery } from '@tanstack/react-query';
import { getAppointmentsByPet } from '../../services/appointmentService';
import { DEFAULT_PAGE_SIZE } from '../../types/pagination';

export const APPOINTMENTS_QUERY_KEY = ['appointments'] as const;

export function useAppointmentsByPet(
    petId: number | null,
    page = 0,
    size = DEFAULT_PAGE_SIZE,
) {
    return useQuery({
        queryKey: [...APPOINTMENTS_QUERY_KEY, 'pet', petId, page, size],
        queryFn: () => {
            if (petId === null) {
                throw new Error('Pet não selecionado.');
            }

            return getAppointmentsByPet(petId, page, size);
        },
        enabled: petId !== null,
    });
}
