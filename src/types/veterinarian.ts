import { PaginatedResponse } from './pagination';

export interface Veterinarian {
    id: number;
    name: string;
    crmv: string;
    phone: string | null;
    email: string | null;
    specialty: string | null;
    clinicName: string | null;
}

export interface VeterinarianRequest {
    name: string;
    crmv: string;
    phone?: string;
    email?: string;
    specialty?: string;
    clinicId: number;
}

export type VeterinarianPage = PaginatedResponse<Veterinarian>;
