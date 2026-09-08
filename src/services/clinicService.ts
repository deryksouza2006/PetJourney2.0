import { Clinic, ClinicPage, ClinicRequest } from '../types/clinic';
import { api } from './api';

export async function getClinics(page: number, size: number): Promise<ClinicPage> {
    const response = await api.get<ClinicPage>('/clinics', {
        params: { page, size },
    });

    return response.data;
}

export async function createClinic(request: ClinicRequest): Promise<Clinic> {
    const response = await api.post<Clinic>('/clinics', request);

    return response.data;
}

export async function updateClinic(
    id: number,
    request: ClinicRequest,
): Promise<Clinic> {
    const response = await api.put<Clinic>(`/clinics/${id}`, request);

    return response.data;
}

export async function deleteClinic(id: number): Promise<void> {
    await api.delete<void>(`/clinics/${id}`);
}
