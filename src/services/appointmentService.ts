import { AppointmentPage, AppointmentResponse } from '../types/workflow';
import { api } from './api';

export async function getAppointmentsByPet(
    petId: number,
    page: number,
    size: number,
): Promise<AppointmentPage> {
    const response = await api.get<AppointmentPage>(`/appointments/pet/${petId}`, {
        params: {
            page,
            size,
            sort: 'dateTime,asc',
        },
    });

    return response.data;
}

export async function cancelAppointment(
    appointmentId: number,
): Promise<AppointmentResponse> {
    const response = await api.patch<AppointmentResponse>(
        `/appointments/${appointmentId}/cancel`,
    );

    return response.data;
}
