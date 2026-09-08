import {
    Veterinarian,
    VeterinarianPage,
    VeterinarianRequest,
} from '../types/veterinarian';
import { api } from './api';

export async function getVeterinarians(
    page: number,
    size: number,
): Promise<VeterinarianPage> {
    const response = await api.get<VeterinarianPage>('/veterinarians', {
        params: { page, size },
    });

    return response.data;
}

export async function createVeterinarian(
    request: VeterinarianRequest,
): Promise<Veterinarian> {
    const response = await api.post<Veterinarian>('/veterinarians', request);

    return response.data;
}

export async function updateVeterinarian(
    id: number,
    request: VeterinarianRequest,
): Promise<Veterinarian> {
    const response = await api.put<Veterinarian>(
        `/veterinarians/${id}`,
        request,
    );

    return response.data;
}

export async function deleteVeterinarian(id: number): Promise<void> {
    await api.delete<void>(`/veterinarians/${id}`);
}
