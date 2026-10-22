import { PaginatedResponse } from './pagination';

interface ResourceLink {
    rel: string;
    href: string;
}

export interface MedicalRecord {
    id: number;
    registrationDate: string;
    mainComplaint: string | null;
    diagnosis: string | null;
    conduct: string | null;
    observations: string | null;
    clinicalNotes: string | null;
    recommendations: string | null;
    prescriptionNotes: string | null;
    appointmentId: number | null;
    petName: string | null;
    veterinarianName: string | null;
    clinicName: string | null;
    links?: ResourceLink[];
}

export type MedicalRecordPage = PaginatedResponse<MedicalRecord>;
