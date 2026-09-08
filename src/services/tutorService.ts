import { Tutor, TutorPage, TutorRequest } from '../types/tutor';
import { api } from './api';

export async function getTutors(page: number, size: number): Promise<TutorPage> {
    const response = await api.get<TutorPage>('/tutors', {
        params: { page, size },
    });

    return response.data;
}

export async function getTutorById(id: number): Promise<Tutor> {
    const response = await api.get<Tutor>(`/tutors/${id}`);

    return response.data;
}

export async function createTutor(request: TutorRequest): Promise<Tutor> {
    const response = await api.post<Tutor>('/tutors', request);

    return response.data;
}

export async function updateTutor(
    id: number,
    request: TutorRequest,
): Promise<Tutor> {
    const response = await api.put<Tutor>(`/tutors/${id}`, request);

    return response.data;
}

export async function deleteTutor(id: number): Promise<void> {
    await api.delete<void>(`/tutors/${id}`);
}
