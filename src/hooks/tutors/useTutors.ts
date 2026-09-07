import { useQuery } from '@tanstack/react-query';
import { getTutors } from '../../services/tutorService';

export function useTutors() {
    return useQuery({
        queryKey: ['tutors'],
        queryFn: getTutors,
    });
}
