export type UserRole =
    | 'ADMIN_SISTEMA'
    | 'ADMIN_CLINICA'
    | 'VETERINARIO'
    | 'TUTOR';

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    role: UserRole;
    clinicId: number | null;
    tutorId: number | null;
    veterinarianId: number | null;
}

export interface AuthUser {
    id: number;
    username: string;
    role: UserRole;
    active: boolean;
    clinicId: number | null;
    tutorId: number | null;
    veterinarianId: number | null;
}