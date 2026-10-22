import { useQuery } from '@tanstack/react-query';
import { getPetAnalysis } from '../../services/smartCareService';

export const SMART_CARE_ANALYSIS_QUERY_KEY = ['smartcare', 'analysis'] as const;

export function useSmartCareAnalysis(petId: number | null) {
    return useQuery({
        queryKey: [...SMART_CARE_ANALYSIS_QUERY_KEY, petId],
        queryFn: () => {
            if (petId === null || petId <= 0) {
                throw new Error('Pet não selecionado.');
            }

            return getPetAnalysis(petId);
        },
        enabled: petId !== null && petId > 0,
        retry: false,
    });
}
