import { Pet, PetRequest } from './pet';
import { PaginatedResponse } from './pagination';
import { Tutor, TutorRequest } from './tutor';

export interface RegisterTutorWithPetRequest {
    tutor: TutorRequest;
    pet: Omit<PetRequest, 'tutorId'>;
}

export interface RegisterTutorWithPetResponse {
    tutor: Tutor;
    pet: Pet;
    firstAccessCode: string | null;
}

export interface ScheduleAppointmentRequest {
    title: string;
    description?: string;
    petId: number;
    clinicId: number;
    veterinarianId: number;
    dateTime: string;
}

export type AppointmentStatus = 'PENDENTE' | 'REALIZADO' | 'CANCELADO';

export interface AppointmentResponse {
    id: number;
    title: string;
    description: string | null;
    dateTime: string;
    status: AppointmentStatus;
    petName: string | null;
    veterinarianName: string | null;
    clinicName: string | null;
    links?: Array<{
        rel: string;
        href: string;
    }>;
}

export type AppointmentPage = PaginatedResponse<AppointmentResponse>;
