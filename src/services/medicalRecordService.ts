import { MedicalRecordPage } from '../types/medicalRecord';
import { api } from './api';

export async function getMedicalRecordsByPet(
    petId: number,
    page: number,
    size: number,
): Promise<MedicalRecordPage> {
    const response = await api.get<MedicalRecordPage>(`/medical-records/pet/${petId}`, {
        params: {
            page,
            size,
            sort: 'registrationDate,desc',
        },
    });

    return response.data;
}
