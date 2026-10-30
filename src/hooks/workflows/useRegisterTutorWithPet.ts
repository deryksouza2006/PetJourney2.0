import { useMutation, useQueryClient } from '@tanstack/react-query';
import { registerTutorWithPet } from '../../services/workflowService';
import { PET_REPORT_QUERY_KEY } from '../reports/usePetReport';

export function useRegisterTutorWithPet() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: registerTutorWithPet,
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['tutors'] }),
                queryClient.invalidateQueries({ queryKey: ['pets'] }),
                queryClient.invalidateQueries({ queryKey: PET_REPORT_QUERY_KEY }),
            ]);
        },
    });
}
