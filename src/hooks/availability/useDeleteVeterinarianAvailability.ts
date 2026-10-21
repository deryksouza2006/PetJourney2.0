import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteVeterinarianAvailability } from '../../services/veterinarianAvailabilityService';
import { VETERINARIAN_AVAILABILITY_QUERY_KEY } from './useVeterinarianAvailability';

export function useDeleteVeterinarianAvailability() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteVeterinarianAvailability,
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: VETERINARIAN_AVAILABILITY_QUERY_KEY,
            });
        },
    });
}
