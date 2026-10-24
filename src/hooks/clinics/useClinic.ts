import { useQuery } from '@tanstack/react-query';
import { getClinicById } from '../../services/clinicService';

export function useClinic(id: number | null) {
    return useQuery({
        queryKey: ['clinics', 'detail', id],
        queryFn: () => {
            if (id === null) {
                throw new Error('Clínica não identificada na sessão.');
            }

            return getClinicById(id);
        },
        enabled: id !== null,
    });
}
