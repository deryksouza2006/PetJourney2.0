import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateVeterinarian } from '../../services/veterinarianService';
import { VeterinarianRequest } from '../../types/veterinarian';

interface UpdateVeterinarianVariables {
    id: number;
    request: VeterinarianRequest;
}

export function useUpdateVeterinarian() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, request }: UpdateVeterinarianVariables) =>
            updateVeterinarian(id, request),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['veterinarians'],
            });
        },
    });
}
