import { useQuery } from '@tanstack/react-query';
import { getPetWeightReport } from '../../services/reportService';

export const PET_WEIGHT_REPORT_QUERY_KEY = ['reports', 'pets', 'weight'] as const;

export function usePetWeightReport() {
    return useQuery({
        queryKey: PET_WEIGHT_REPORT_QUERY_KEY,
        queryFn: getPetWeightReport,
    });
}
