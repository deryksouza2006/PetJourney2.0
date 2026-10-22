import { MedicationPage } from '../types/medication';
import { api } from './api';

export async function getMedicationsByPet(
    petId: number,
    page: number,
    size: number,
): Promise<MedicationPage> {
    const response = await api.get<MedicationPage>(`/medications/pet/${petId}`, {
        params: {
            page,
            size,
            sort: 'startDate,desc',
        },
    });

    return response.data;
}
