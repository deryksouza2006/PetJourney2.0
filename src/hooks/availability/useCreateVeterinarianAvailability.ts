import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createVeterinarianAvailability } from '../../services/veterinarianAvailabilityService';
import { VETERINARIAN_AVAILABILITY_QUERY_KEY } from './useVeterinarianAvailability';

export function useCreateVeterinarianAvailability() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createVeterinarianAvailability,
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: VETERINARIAN_AVAILABILITY_QUERY_KEY,
            });
        },
    });
}
