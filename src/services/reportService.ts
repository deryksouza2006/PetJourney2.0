import { PetSpecies } from '../types/pet';
import { PetReportItem, PetWeightReportItem } from '../types/report';
import { api } from './api';

export async function getPetReport(): Promise<PetReportItem[]> {
    const response = await api.get<PetReportItem[]>('/reports/pets');
    return response.data;
}

export async function getPetWeightReport(
    species: PetSpecies | null,
): Promise<PetWeightReportItem[]> {
    const response = await api.get<PetWeightReportItem[]>('/reports/pets/weight', {
        params: { species: species ?? undefined },
    });

    return response.data;
}
