import { useQueries } from '@tanstack/react-query';
import { DEFAULT_PAGE_SIZE } from '../../types/pagination';
import { AppointmentResponse } from '../../types/workflow';
import { localDateTimeToDate } from '../../utils/dateTimeFormatting';
import { appointmentsByPetQueryOptions } from './useAppointmentsByPet';

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

export function useTutorHomeAppointments(
    petIds: number[],
    size = DEFAULT_PAGE_SIZE,
) {
    const uniquePetIds = [...new Set(petIds)];
    const queries = useQueries({
        queries: uniquePetIds.map((petId) => (
            appointmentsByPetQueryOptions(petId, 0, size)
        )),
    });
    const appointmentsById = new Map<number, AppointmentResponse>();

    for (const query of queries) {
        for (const appointment of query.data?.content ?? []) {
            appointmentsById.set(appointment.id, appointment);
        }
    }

    const appointments = [...appointmentsById.values()]
        .sort(compareByDateTime)
        .slice(0, size);

    return {
        data: appointments,
        isPending: queries.some((query) => query.isPending),
        isError: queries.some((query) => query.isError),
        refetch: async () => {
            await Promise.all(
                queries
                    .filter((query) => query.isError)
                    .map((query) => query.refetch()),
            );
        },
    };
}
