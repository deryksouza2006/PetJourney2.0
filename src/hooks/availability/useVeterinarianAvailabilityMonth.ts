import { useQuery } from '@tanstack/react-query';
import { getVeterinarianAvailabilities } from '../../services/veterinarianAvailabilityService';
import { VeterinarianAvailability } from '../../types/veterinarianAvailability';
import { VETERINARIAN_AVAILABILITY_QUERY_KEY } from './useVeterinarianAvailability';

const MONTH_PAGE_SIZE = 100;

async function getMonthAvailabilities(
    veterinarianId: number,
    start: string,
    end: string,
): Promise<VeterinarianAvailability[]> {
    const firstPage = await getVeterinarianAvailabilities(
        veterinarianId,
        start,
        end,
        0,
        MONTH_PAGE_SIZE,
    );

    if (firstPage.totalPages <= 1) {
        return firstPage.content;
    }

    const remainingPages = await Promise.all(
        Array.from({ length: firstPage.totalPages - 1 }, (_, index) =>
            getVeterinarianAvailabilities(
                veterinarianId,
                start,
                end,
                index + 1,
                MONTH_PAGE_SIZE,
            ),
        ),
    );

    return [firstPage, ...remainingPages].flatMap((page) => page.content);
}

export function useVeterinarianAvailabilityMonth(
    veterinarianId: number | null,
    start: string,
    end: string,
) {
    return useQuery({
        queryKey: [
            ...VETERINARIAN_AVAILABILITY_QUERY_KEY,
            'month',
            veterinarianId,
            start,
            end,
        ],
        queryFn: () => {
            if (veterinarianId === null) {
                throw new Error('Veterinário não identificado na sessão.');
            }

            return getMonthAvailabilities(veterinarianId, start, end);
        },
        enabled: veterinarianId !== null,
    });
}
