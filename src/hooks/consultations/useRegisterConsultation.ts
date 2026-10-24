import { useMutation, useQueryClient } from '@tanstack/react-query';
import { registerConsultation } from '../../services/consultationService';
import { APPOINTMENTS_QUERY_KEY } from '../appointments/useAppointmentsByPet';
import { MEDICAL_RECORDS_QUERY_KEY } from '../medicalRecords/useMedicalRecordsByPet';
import { MEDICATIONS_QUERY_KEY } from '../medications/useMedicationsByPet';
import { SMART_CARE_ANALYSIS_QUERY_KEY } from '../smartCare/useSmartCareAnalysis';
import { SMART_CARE_RANKING_QUERY_KEY } from '../smartCare/useSmartCareRanking';

export function useRegisterConsultation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: registerConsultation,
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: APPOINTMENTS_QUERY_KEY }),
                queryClient.invalidateQueries({ queryKey: MEDICAL_RECORDS_QUERY_KEY }),
                queryClient.invalidateQueries({ queryKey: MEDICATIONS_QUERY_KEY }),
                queryClient.invalidateQueries({ queryKey: SMART_CARE_ANALYSIS_QUERY_KEY }),
                queryClient.invalidateQueries({ queryKey: SMART_CARE_RANKING_QUERY_KEY }),
            ]);
        },
    });
}
