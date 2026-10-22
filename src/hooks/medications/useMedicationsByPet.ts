import { useQuery } from '@tanstack/react-query';
import { getMedicationsByPet } from '../../services/medicationService';
import { DEFAULT_PAGE_SIZE } from '../../types/pagination';

export const MEDICATIONS_QUERY_KEY = ['medications'] as const;

export function useMedicationsByPet(
    petId: number | null,
    page = 0,
    size = DEFAULT_PAGE_SIZE,
) {
    return useQuery({
        queryKey: [...MEDICATIONS_QUERY_KEY, 'pet', petId, page, size],
        queryFn: () => {
            if (petId === null) {
                throw new Error('Pet não selecionado.');
            }

            return getMedicationsByPet(petId, page, size);
        },
        enabled: petId !== null,
    });
}
