import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTutor } from '../../services/tutorService';
import { TutorRequest } from '../../types/tutor';

interface UpdateTutorVariables {
    id: number;
    request: TutorRequest;
}

export function useUpdateTutor() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, request }: UpdateTutorVariables) =>
            updateTutor(id, request),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['tutors'] });
        },
    });
}
