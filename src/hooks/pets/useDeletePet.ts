import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deletePet } from '../../services/petService';

export function useDeletePet() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deletePet,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['pets'] });
        },
    });
}
