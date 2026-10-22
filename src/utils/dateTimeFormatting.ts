export function formatLocalDateTime(dateTime: string): string {
    const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(dateTime);

    if (!match) {
        return dateTime;
    }

    return `${match[3]}/${match[2]}/${match[1]} às ${match[4]}:${match[5]}`;
}

const CANCELLATION_WINDOW_MS = 24 * 60 * 60 * 1000;

export function localDateTimeToDate(dateTime: string): Date | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/.exec(dateTime);

    if (!match) {
        return null;
    }

    const year = Number(match[1]);
    const month = Number(match[2]) - 1;
    const day = Number(match[3]);
    const hours = Number(match[4]);
    const minutes = Number(match[5]);
    const seconds = Number(match[6] ?? 0);
    const parsed = new Date(year, month, day, hours, minutes, seconds);

    if (
        parsed.getFullYear() !== year
        || parsed.getMonth() !== month
        || parsed.getDate() !== day
        || parsed.getHours() !== hours
        || parsed.getMinutes() !== minutes
        || parsed.getSeconds() !== seconds
    ) {
        return null;
    }

    return parsed;
}

export function canCancelAppointment(dateTime: string, now = Date.now()): boolean {
    const appointmentDate = localDateTimeToDate(dateTime);

    return appointmentDate !== null
        && appointmentDate.getTime() - now > CANCELLATION_WINDOW_MS;
}
