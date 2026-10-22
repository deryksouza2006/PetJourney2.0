import { useQuery } from '@tanstack/react-query';
import { getMedicalRecordsByPet } from '../../services/medicalRecordService';
import { DEFAULT_PAGE_SIZE } from '../../types/pagination';

export const MEDICAL_RECORDS_QUERY_KEY = ['medical-records'] as const;

export function useMedicalRecordsByPet(
    petId: number | null,
    page = 0,
    size = DEFAULT_PAGE_SIZE,
) {
    return useQuery({
        queryKey: [...MEDICAL_RECORDS_QUERY_KEY, 'pet', petId, page, size],
        queryFn: () => {
            if (petId === null) {
                throw new Error('Pet não selecionado.');
            }

            return getMedicalRecordsByPet(petId, page, size);
        },
        enabled: petId !== null,
    });
}
