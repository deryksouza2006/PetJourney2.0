const DEFAULT_API_URL = 'http://localhost:8080';
const API_URL = (process.env.PETJOURNEY_API_URL?.trim() || DEFAULT_API_URL)
    .replace(/\/+$/, '');

const LOGIN_CREDENTIALS = {
    username: 'dr.joao@petjourney.com',
    password: '123456',
};

let token = null;
let availabilityId = null;
let availabilityRemoved = false;
let exitCode = 0;

function pad(value) {
    return String(value).padStart(2, '0');
}

function createFutureAvailability() {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);

    const date = [
        futureDate.getFullYear(),
        pad(futureDate.getMonth() + 1),
        pad(futureDate.getDate()),
    ].join('-');

    return {
        startTime: `${date}T10:00:00`,
        endTime: `${date}T10:30:00`,
        rangeStart: `${date}T00:00:00`,
        rangeEnd: `${date}T23:59:59`,
    };
}

async function readResponseBody(response) {
    const body = await response.text();

    if (!body) {
        return null;
    }

    try {
        return JSON.parse(body);
    } catch {
        return body;
    }
}

function getErrorDetails(data) {
    if (data && typeof data === 'object') {
        const validationErrors = Object.values(data.validationErrors ?? {});

        if (validationErrors.length > 0) {
            return validationErrors.join('; ');
        }

        if (typeof data.message === 'string' && data.message.trim()) {
            return data.message.trim();
        }
    }

    return typeof data === 'string' && data.trim()
        ? data.trim()
        : 'sem detalhes adicionais';
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

async function request(path, options = {}) {
    try {
        const response = await fetch(`${API_URL}${path}`, options);
        const data = await readResponseBody(response);
        return { response, data };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Não foi possível acessar ${API_URL}: ${message}`);
    }
}

function authorizationHeaders() {
    return {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
}

function buildListPath(veterinarianId, rangeStart, rangeEnd) {
    const query = new URLSearchParams({
        start: rangeStart,
        end: rangeEnd,
        page: '0',
        size: '100',
        sort: 'startTime,asc',
    });

    return `/veterinarian-availabilities/veterinarian/${veterinarianId}?${query}`;
}

async function cleanupCreatedAvailability() {
    if (!token || availabilityId === null || availabilityRemoved) {
        return;
    }

    try {
        const { response, data } = await request(
            `/veterinarian-availabilities/${availabilityId}`,
            {
                method: 'DELETE',
                headers: authorizationHeaders(),
            },
        );

        if (response.ok || response.status === 404) {
            availabilityRemoved = true;
            console.log('CLEANUP - disponibilidade de teste removida após falha');
            return;
        }

        console.error(
            `WARN - falha na limpeza da disponibilidade ${availabilityId}: ` +
            `HTTP ${response.status} - ${getErrorDetails(data)}`,
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`WARN - falha na limpeza da disponibilidade ${availabilityId}: ${message}`);
    }
}

try {
    const loginResult = await request('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(LOGIN_CREDENTIALS),
    });

    assert(
        loginResult.response.status === 200,
        `Login retornou HTTP ${loginResult.response.status}: ${getErrorDetails(loginResult.data)}`,
    );
    assert(
        typeof loginResult.data?.token === 'string' && loginResult.data.token.trim().length > 0,
        'Login concluído sem token.',
    );
    assert(
        loginResult.data.role === 'VETERINARIO',
        `Perfil inválido no login: esperado VETERINARIO, recebido ${String(loginResult.data?.role)}.`,
    );

    const veterinarianId = Number(loginResult.data.veterinarianId);
    assert(
        Number.isInteger(veterinarianId) && veterinarianId > 0,
        'Login concluído sem veterinarianId válido.',
    );

    token = loginResult.data.token;
    console.log('PASS - login do veterinário validado');

    const { startTime, endTime, rangeStart, rangeEnd } = createFutureAvailability();
    const createResult = await request('/veterinarian-availabilities', {
        method: 'POST',
        headers: authorizationHeaders(),
        body: JSON.stringify({
            veterinarianId,
            startTime,
            endTime,
        }),
    });

    assert(
        createResult.response.ok,
        `Criação retornou HTTP ${createResult.response.status}: ${getErrorDetails(createResult.data)}`,
    );

    const createdId = Number(createResult.data?.id);

    if (Number.isInteger(createdId) && createdId > 0) {
        availabilityId = createdId;
    }

    assert(availabilityId !== null, 'Criação concluída sem ID de disponibilidade válido.');
    console.log('PASS - disponibilidade criada');

    const listPath = buildListPath(veterinarianId, rangeStart, rangeEnd);
    const firstListResult = await request(listPath, {
        headers: authorizationHeaders(),
    });

    assert(
        firstListResult.response.ok,
        `Listagem retornou HTTP ${firstListResult.response.status}: ` +
        getErrorDetails(firstListResult.data),
    );
    assert(
        Array.isArray(firstListResult.data?.content),
        'A listagem não retornou uma página Spring com o campo content.',
    );
    assert(
        firstListResult.data.content.some((item) => Number(item?.id) === availabilityId),
        `A disponibilidade ${availabilityId} não foi encontrada na listagem.`,
    );
    console.log('PASS - disponibilidade encontrada na listagem');

    const deleteResult = await request(
        `/veterinarian-availabilities/${availabilityId}`,
        {
            method: 'DELETE',
            headers: authorizationHeaders(),
        },
    );

    assert(
        deleteResult.response.ok,
        `Exclusão retornou HTTP ${deleteResult.response.status}: ${getErrorDetails(deleteResult.data)}`,
    );
    availabilityRemoved = true;
    console.log('PASS - disponibilidade removida');

    const secondListResult = await request(listPath, {
        headers: authorizationHeaders(),
    });

    assert(
        secondListResult.response.ok,
        `Segunda listagem retornou HTTP ${secondListResult.response.status}: ` +
        getErrorDetails(secondListResult.data),
    );
    assert(
        Array.isArray(secondListResult.data?.content),
        'A segunda listagem não retornou uma página Spring com o campo content.',
    );
    assert(
        !secondListResult.data.content.some((item) => Number(item?.id) === availabilityId),
        `A disponibilidade ${availabilityId} ainda aparece após a exclusão.`,
    );
    console.log('PASS - disponibilidade não aparece após exclusão');

    console.log('========================================');
    console.log('PETJOURNEY - TESTE DE INTEGRAÇÃO');
    console.log('Disponibilidade Veterinário: PASS');
    console.log('========================================');
} catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`FAIL - ${message}`);
    exitCode = 1;
} finally {
    await cleanupCreatedAvailability();
}

if (exitCode !== 0) {
    process.exit(1);
}
