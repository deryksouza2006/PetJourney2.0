import { Pet, PetPage, PetRequest } from '../types/pet';
import { api } from './api';

export async function getPets(page: number, size: number): Promise<PetPage> {
    const response = await api.get<PetPage>('/pets', {
        params: { page, size },
    });

    return response.data;
}

export async function getPetById(id: number): Promise<Pet> {
    const response = await api.get<Pet>(`/pets/${id}`);

    return response.data;
}

export async function createPet(request: PetRequest): Promise<Pet> {
    const response = await api.post<Pet>('/pets', request);

    return response.data;
}

export async function updatePet(
    id: number,
    request: PetRequest,
): Promise<Pet> {
    const response = await api.put<Pet>(`/pets/${id}`, request);

    return response.data;
}

export async function deletePet(id: number): Promise<void> {
    await api.delete<void>(`/pets/${id}`);
}
