import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updatePet } from '../../services/petService';
import { PetRequest } from '../../types/pet';
import { PET_REPORT_QUERY_KEY } from '../reports/usePetReport';

interface UpdatePetVariables {
    id: number;
    request: PetRequest;
}

export function useUpdatePet() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, request }: UpdatePetVariables) =>
            updatePet(id, request),
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['pets'] }),
                queryClient.invalidateQueries({ queryKey: PET_REPORT_QUERY_KEY }),
            ]);
        },
    });
}
