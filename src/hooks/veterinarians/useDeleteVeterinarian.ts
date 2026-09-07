import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteVeterinarian } from '../../services/veterinarianService';

export function useDeleteVeterinarian() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteVeterinarian,
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['veterinarians'],
            });
        },
    });
}
