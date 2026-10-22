import { useQuery } from '@tanstack/react-query';
import { getRanking } from '../../services/smartCareService';

export const SMART_CARE_RANKING_QUERY_KEY = ['smartcare', 'ranking'] as const;

export function useSmartCareRanking() {
    return useQuery({
        queryKey: SMART_CARE_RANKING_QUERY_KEY,
        queryFn: getRanking,
        retry: false,
    });
}
