import { useMutation } from '@tanstack/react-query';
import { createClinicAdmin } from '../../services/systemAdminService';
import { ClinicAdminRequest } from '../../types/clinicAdmin';

interface CreateClinicAdminVariables {
    clinicId: number;
    request: ClinicAdminRequest;
}

export function useCreateClinicAdmin() {
    return useMutation({
        mutationFn: ({ clinicId, request }: CreateClinicAdminVariables) =>
            createClinicAdmin(clinicId, request),
    });
}
