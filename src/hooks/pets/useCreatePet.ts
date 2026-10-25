import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPet } from '../../services/petService';
import { PET_REPORT_QUERY_KEY } from '../reports/usePetReport';

export function useCreatePet() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createPet,
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['pets'] }),
                queryClient.invalidateQueries({ queryKey: PET_REPORT_QUERY_KEY }),
            ]);
        },
    });
}
