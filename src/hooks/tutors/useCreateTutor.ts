import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTutor } from '../../services/tutorService';

export function useCreateTutor() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createTutor,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['tutors'] });
        },
    });
}
