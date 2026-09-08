import { useQuery } from '@tanstack/react-query';
import { getClinics } from '../../services/clinicService';
import { DEFAULT_PAGE_SIZE } from '../../types/pagination';

export function useClinics(page = 0, size = DEFAULT_PAGE_SIZE) {
    return useQuery({
        queryKey: ['clinics', page, size],
        queryFn: () => getClinics(page, size),
    });
}
