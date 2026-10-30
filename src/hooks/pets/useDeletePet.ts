import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deletePet } from '../../services/petService';
import { PET_REPORT_QUERY_KEY } from '../reports/usePetReport';

export function useDeletePet() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deletePet,
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['pets'] }),
                queryClient.invalidateQueries({ queryKey: PET_REPORT_QUERY_KEY }),
            ]);
        },
    });
}
