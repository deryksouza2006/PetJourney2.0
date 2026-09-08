import { useQuery } from '@tanstack/react-query';
import { getPetById } from '../../services/petService';

export function usePet(id: number) {
    return useQuery({
        queryKey: ['pets', id],
        queryFn: () => getPetById(id),
    });
}
