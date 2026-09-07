import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createVeterinarian } from '../../services/veterinarianService';

export function useCreateVeterinarian() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createVeterinarian,
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['veterinarians'],
            });
        },
    });
}
