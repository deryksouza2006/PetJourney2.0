import { PaginatedResponse } from './pagination';

export interface VeterinarianAvailability {
    id: number;
    veterinarianId: number;
    veterinarianName: string | null;
    clinicId: number | null;
    clinicName: string | null;
    startTime: string;
    endTime: string;
}

export interface VeterinarianAvailabilityRequest {
    veterinarianId: number;
    startTime: string;
    endTime: string;
}

export type VeterinarianAvailabilityPage =
    PaginatedResponse<VeterinarianAvailability>;
