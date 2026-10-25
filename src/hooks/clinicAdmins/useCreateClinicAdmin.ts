import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClinicAdmin } from '../../services/systemAdminService';
import { ClinicAdminRequest } from '../../types/clinicAdmin';
import { CLINICS_QUERY_KEY } from '../clinics/useClinics';

interface CreateClinicAdminVariables {
    clinicId: number;
    request: ClinicAdminRequest;
}

export function useCreateClinicAdmin() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ clinicId, request }: CreateClinicAdminVariables) =>
            createClinicAdmin(clinicId, request),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: CLINICS_QUERY_KEY });
        },
    });
}
