import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteClinic } from '../../services/clinicService';

export function useDeleteClinic() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteClinic,
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['clinics'],
            });
        },
    });
}
