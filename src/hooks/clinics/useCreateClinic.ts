import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClinic } from '../../services/clinicService';

export function useCreateClinic() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createClinic,
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['clinics'],
            });
        },
    });
}
