import {
    VeterinarianAvailability,
    VeterinarianAvailabilityPage,
    VeterinarianAvailabilityRequest,
} from '../types/veterinarianAvailability';
import { api } from './api';

export async function getVeterinarianAvailabilities(
    veterinarianId: number,
    start: string,
    end: string,
    page: number,
    size: number,
): Promise<VeterinarianAvailabilityPage> {
    const response = await api.get<VeterinarianAvailabilityPage>(
        `/veterinarian-availabilities/veterinarian/${veterinarianId}`,
        {
            params: {
                start,
                end,
                page,
                size,
                sort: 'startTime,asc',
            },
        },
    );

    return response.data;
}

export async function createVeterinarianAvailability(
    request: VeterinarianAvailabilityRequest,
): Promise<VeterinarianAvailability> {
    const response = await api.post<VeterinarianAvailability>(
        '/veterinarian-availabilities',
        request,
    );

    return response.data;
}

export async function deleteVeterinarianAvailability(id: number): Promise<void> {
    await api.delete<void>(`/veterinarian-availabilities/${id}`);
}
