import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteTutor } from '../../services/tutorService';

export function useDeleteTutor() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteTutor,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['tutors'] });
        },
    });
}
