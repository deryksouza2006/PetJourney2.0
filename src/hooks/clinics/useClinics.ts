import { useQuery } from '@tanstack/react-query';
import { getClinics } from '../../services/clinicService';

export function useClinics() {
    return useQuery({
        queryKey: ['clinics'],
        queryFn: getClinics,
    });
}
