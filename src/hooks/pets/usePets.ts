import { useQuery } from '@tanstack/react-query';
import { getPets } from '../../services/petService';

export function usePets() {
    return useQuery({
        queryKey: ['pets'],
        queryFn: getPets,
    });
}
