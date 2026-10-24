import { MedicalRecord } from './medicalRecord';
import { Medication } from './medication';
import { AppointmentResponse } from './workflow';

export interface ConsultationMedicationRequest {
    name: string;
    dosage?: string;
    frequency?: string;
    startDate?: string;
    endDate?: string;
    observations?: string;
}

export interface RegisterConsultationRequest {
    appointmentId: number;
    mainComplaint: string;
    diagnosis?: string;
    conduct?: string;
    observations?: string;
    clinicalNotes?: string;
    recommendations?: string;
    prescriptionNotes?: string;
    medications?: ConsultationMedicationRequest[];
}

export interface RegisterConsultationResponse {
    appointment: AppointmentResponse;
    medicalRecord: MedicalRecord;
    medications: Medication[];
}
