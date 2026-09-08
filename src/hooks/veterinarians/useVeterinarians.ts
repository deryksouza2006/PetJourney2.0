import { useQuery } from '@tanstack/react-query';
import { getVeterinarians } from '../../services/veterinarianService';
import { DEFAULT_PAGE_SIZE } from '../../types/pagination';

export function useVeterinarians(page = 0, size = DEFAULT_PAGE_SIZE) {
    return useQuery({
        queryKey: ['veterinarians', page, size],
        queryFn: () => getVeterinarians(page, size),
    });
}
