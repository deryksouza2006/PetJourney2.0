import { UserRole } from './auth';

export interface ClinicAdminRequest {
    username: string;
    password: string;
}

export interface ClinicAdminResponse {
    id: number;
    username: string;
    role: UserRole;
    active: boolean;
    clinicId: number | null;
    tutorId: number | null;
    veterinarianId: number | null;
}
