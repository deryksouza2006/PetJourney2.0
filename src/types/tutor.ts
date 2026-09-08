import { PaginatedResponse } from './pagination';

export interface Tutor {
    id: number;
    name: string;
    cpf: string;
    phone: string | null;
    email: string | null;
    clinicId: number | null;
    clinicName: string | null;
}

export interface TutorRequest {
    name: string;
    cpf: string;
    phone?: string;
    email?: string;
}

export type TutorPage = PaginatedResponse<Tutor>;
