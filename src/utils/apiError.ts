import axios from 'axios';

interface ApiErrorResponse {
    message?: string;
    validationErrors?: Record<string, string>;
}

const NETWORK_ERROR_MESSAGE =
    'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.';

export function getApiErrorMessage(error: unknown, fallback: string): string {
    if (!axios.isAxiosError<ApiErrorResponse>(error)) {
        return fallback;
    }

    if (!error.response) {
        return NETWORK_ERROR_MESSAGE;
    }

    const validationMessages = Object.values(error.response.data?.validationErrors ?? {});

    if (validationMessages.length > 0) {
        return validationMessages.join('\n');
    }

    const message = error.response.data?.message?.trim();

    return message || fallback;
}
