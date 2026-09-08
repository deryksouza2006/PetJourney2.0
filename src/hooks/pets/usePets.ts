import { useQuery } from '@tanstack/react-query';
import { getPets } from '../../services/petService';
import { DEFAULT_PAGE_SIZE } from '../../types/pagination';

export function usePets(page = 0, size = DEFAULT_PAGE_SIZE) {
    return useQuery({
        queryKey: ['pets', page, size],
        queryFn: () => getPets(page, size),
    });
}
