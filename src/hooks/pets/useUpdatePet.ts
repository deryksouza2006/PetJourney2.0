import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updatePet } from '../../services/petService';
import { PetRequest } from '../../types/pet';

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
            await queryClient.invalidateQueries({ queryKey: ['pets'] });
        },
    });
}
