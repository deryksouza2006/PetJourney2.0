import { useQuery } from '@tanstack/react-query';
import { getTutors } from '../../services/tutorService';
import { DEFAULT_PAGE_SIZE } from '../../types/pagination';

export function useTutors(page = 0, size = DEFAULT_PAGE_SIZE) {
    return useQuery({
        queryKey: ['tutors', page, size],
        queryFn: () => getTutors(page, size),
    });
}
