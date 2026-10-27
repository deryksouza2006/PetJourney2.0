import { PaginatedResponse } from './pagination';

interface ResourceLink {
    rel: string;
    href: string;
}

export type MedicationStatus = 'ATIVO' | 'FINALIZADO' | 'CANCELADO';

export interface Medication {
    id: number;
    name: string;
    dosage: string | null;
    frequency: string | null;
    startDate: string | null;
    endDate: string | null;
    observations: string | null;
    status: MedicationStatus;
    petName: string | null;
    veterinarianName: string | null;
    links?: ResourceLink[];
}

export type MedicationPage = PaginatedResponse<Medication>;
