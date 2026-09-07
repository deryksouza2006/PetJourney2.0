import {
    ClinicAdminRequest,
    ClinicAdminResponse,
} from '../types/clinicAdmin';
import { api } from './api';

export async function createClinicAdmin(
    clinicId: number,
    request: ClinicAdminRequest,
): Promise<ClinicAdminResponse> {
    const response = await api.post<ClinicAdminResponse>(
        `/system/clinics/${clinicId}/admins`,
        request,
    );

    return response.data;
}
