import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateClinic } from '../../services/clinicService';
import { ClinicRequest } from '../../types/clinic';

interface UpdateClinicVariables {
    id: number;
    request: ClinicRequest;
}

export function useUpdateClinic() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, request }: UpdateClinicVariables) =>
            updateClinic(id, request),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['clinics'],
            });
        },
    });
}
