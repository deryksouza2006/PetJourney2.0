import { useQuery } from '@tanstack/react-query';
import { getVeterinarians } from '../../services/veterinarianService';

export function useVeterinarians() {
    return useQuery({
        queryKey: ['veterinarians'],
        queryFn: getVeterinarians,
    });
}
