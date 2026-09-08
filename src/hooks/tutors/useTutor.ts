import { useQuery } from '@tanstack/react-query';
import { getTutorById } from '../../services/tutorService';

export function useTutor(id: number | null) {
    return useQuery({
        queryKey: ['tutors', id],
        queryFn: () => {
            if (id === null) {
                throw new Error('Tutor não informado');
            }

            return getTutorById(id);
        },
        enabled: id !== null,
    });
}
