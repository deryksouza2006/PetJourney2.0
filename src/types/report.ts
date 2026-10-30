import { PetSex, PetSpecies } from './pet';

export interface PetReportItem {
    petId: number;
    tutorId: number;
    clinicId: number;
    pet: string;
    tutor: string;
    clinica: string;
}

export type PetWeightReportType = 'DETALHE' | 'SUBTOTAL' | 'TOTAL';

export interface PetWeightReportItem {
    tipo: PetWeightReportType;
    species: PetSpecies | null;
    sex: PetSex | null;
    pesoKg: number;
}
