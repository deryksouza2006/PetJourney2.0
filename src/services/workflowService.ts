import {
    RegisterTutorWithPetRequest,
    RegisterTutorWithPetResponse,
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
