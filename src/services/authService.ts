import { api } from './api';
import {
    AuthUser,
    FirstAccessRequest,
    LoginRequest,
    LoginResponse,
} from '../types/auth';

export async function login(
    credentials: LoginRequest
): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>(
        '/auth/login',
        credentials
    );

    return response.data;
}

export async function getMe(): Promise<AuthUser> {
    const response = await api.get<AuthUser>('/auth/me');

    return response.data;
}

export async function activateFirstAccess(
    request: FirstAccessRequest
): Promise<AuthUser> {
    const response = await api.post<AuthUser>(
        '/auth/first-access/activate',
        request
    );

    return response.data;
}
