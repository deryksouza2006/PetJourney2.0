import { useQuery } from '@tanstack/react-query';
import { getVeterinarianAvailabilities } from '../../services/veterinarianAvailabilityService';
import { DEFAULT_PAGE_SIZE } from '../../types/pagination';

export const VETERINARIAN_AVAILABILITY_QUERY_KEY = [
    'veterinarianAvailabilities',
] as const;

export function useVeterinarianAvailability(
    veterinarianId: number | null,
    start: string,
    end: string,
    page = 0,
    size = DEFAULT_PAGE_SIZE,
) {
    return useQuery({
        queryKey: [
            ...VETERINARIAN_AVAILABILITY_QUERY_KEY,
            veterinarianId,
            start,
            end,
            page,
            size,
        ],
        queryFn: () => {
            if (veterinarianId === null) {
                throw new Error('Veterinário não identificado na sessão.');
            }

            return getVeterinarianAvailabilities(
                veterinarianId,
                start,
                end,
                page,
                size,
            );
        },
        enabled: veterinarianId !== null,
    });
}
