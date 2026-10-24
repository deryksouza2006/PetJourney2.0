import { useQuery } from '@tanstack/react-query';
import { getPetReport } from '../../services/reportService';

export const PET_REPORT_QUERY_KEY = ['reports', 'pets'] as const;

export function usePetReport() {
    return useQuery({
        queryKey: PET_REPORT_QUERY_KEY,
        queryFn: getPetReport,
    });
}
