import { useQuery } from '@tanstack/react-query';
import { getAvailableVeterinarianSlots } from '../../services/veterinarianAvailabilityService';

export const FUTURE_AVAILABLE_SLOTS_QUERY_KEY = [
    'veterinarian-availability',
    'available',
    'future',
] as const;

export function useFutureAvailableSlots(start: string, end: string) {
    return useQuery({
        queryKey: [...FUTURE_AVAILABLE_SLOTS_QUERY_KEY, start, end],
        queryFn: () => getAvailableVeterinarianSlots(null, start, end, 0, 200),
    });
}
