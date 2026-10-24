import {
    RegisterConsultationRequest,
    RegisterConsultationResponse,
} from '../types/consultation';
import { api } from './api';

export async function registerConsultation(
    request: RegisterConsultationRequest,
): Promise<RegisterConsultationResponse> {
    const response = await api.post<RegisterConsultationResponse>(
        '/workflows/consultations/register',
        request,
    );

    return response.data;
}
