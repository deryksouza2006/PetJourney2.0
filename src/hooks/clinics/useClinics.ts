import { useQuery } from '@tanstack/react-query';
import { getClinics } from '../../services/clinicService';
import { DEFAULT_PAGE_SIZE } from '../../types/pagination';

export const CLINICS_QUERY_KEY = ['clinics'] as const;

export function useClinics(page = 0, size = DEFAULT_PAGE_SIZE) {
    return useQuery({
        queryKey: [...CLINICS_QUERY_KEY, page, size],
        queryFn: () => getClinics(page, size),
    });
}
