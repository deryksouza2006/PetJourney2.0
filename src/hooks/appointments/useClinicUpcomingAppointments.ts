import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAppointmentsByDateRange } from '../../services/appointmentService';
import { AppointmentResponse } from '../../types/workflow';
import { localDateTimeToDate } from '../../utils/dateTimeFormatting';
import { APPOINTMENTS_QUERY_KEY } from './useAppointmentsByPet';

const SEARCH_PAGE_SIZE = 20;
const SEARCH_END = '9999-12-31T23:59:59';

function toLocalApiDateTime(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

function compareByDateTime(
    first: AppointmentResponse,
    second: AppointmentResponse,
): number {
    const firstDate = localDateTimeToDate(first.dateTime);
    const secondDate = localDateTimeToDate(second.dateTime);

    if (firstDate === null) {
        return secondDate === null ? 0 : 1;
    }

    if (secondDate === null) {
        return -1;
    }

    return firstDate.getTime() - secondDate.getTime();
}

export function useClinicUpcomingAppointments(
    clinicId: number | null,
    limit = 3,
) {
    const start = useMemo(() => toLocalApiDateTime(new Date()), []);

    return useQuery({
        queryKey: [
            ...APPOINTMENTS_QUERY_KEY,
            'clinic-upcoming',
            clinicId,
            start,
            SEARCH_END,
            limit,
        ],
        queryFn: async () => {
            if (clinicId === null) {
                throw new Error('Clínica não identificada.');
            }

            const pendingAppointments: AppointmentResponse[] = [];
            let page = 0;
            let isLastPage = false;

            while (!isLastPage && pendingAppointments.length < limit) {
                const response = await getAppointmentsByDateRange(
                    start,
                    SEARCH_END,
                    page,
                    SEARCH_PAGE_SIZE,
                );

                pendingAppointments.push(
                    ...response.content.filter(
                        (appointment) => appointment.status === 'PENDENTE',
                    ),
                );
                isLastPage = response.last;
                page += 1;
            }

            return pendingAppointments
                .sort(compareByDateTime)
                .slice(0, limit);
        },
        enabled: clinicId !== null,
    });
}
