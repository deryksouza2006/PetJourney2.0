import { PaginatedResponse } from './pagination';

export interface Clinic {
    id: number;
    name: string;
    cnpj: string;
    phone: string | null;
    email: string | null;
    address: string | null;
}

export interface ClinicRequest {
    name: string;
    cnpj: string;
    phone?: string;
    email?: string;
    address?: string;
}

export type ClinicPage = PaginatedResponse<Clinic>;
