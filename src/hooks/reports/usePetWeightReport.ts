import { useQuery } from '@tanstack/react-query';
import { getPetWeightReport } from '../../services/reportService';
import { PetSpecies } from '../../types/pet';

export const PET_WEIGHT_REPORT_QUERY_KEY = ['reports', 'pets', 'weight'] as const;

export function usePetWeightReport(species: PetSpecies | null) {
    return useQuery({
        queryKey: [...PET_WEIGHT_REPORT_QUERY_KEY, species],
        queryFn: () => getPetWeightReport(species),
    });
}
