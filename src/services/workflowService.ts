import {
    AppointmentResponse,
    RegisterTutorWithPetRequest,
    RegisterTutorWithPetResponse,
    ScheduleAppointmentRequest,
} from '../types/workflow';
import { api } from './api';

export async function registerTutorWithPet(
    request: RegisterTutorWithPetRequest,
): Promise<void> {
    await api.post<RegisterTutorWithPetResponse>(
        '/workflows/tutors/register-with-pet',
        request,
    );
}

export async function scheduleAppointment(
    request: ScheduleAppointmentRequest,
): Promise<AppointmentResponse> {
    const response = await api.post<AppointmentResponse>(
        '/workflows/appointments/schedule',
        request,
    );

    return response.data;
}
