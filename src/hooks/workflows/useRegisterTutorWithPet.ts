import { useMutation, useQueryClient } from '@tanstack/react-query';
import { registerTutorWithPet } from '../../services/workflowService';

export function useRegisterTutorWithPet() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: registerTutorWithPet,
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['tutors'] }),
                queryClient.invalidateQueries({ queryKey: ['pets'] }),
            ]);
        },
    });
}
