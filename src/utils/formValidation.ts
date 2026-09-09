const CNPJ_PATTERN = /^(?:\d{14}|\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function calculateCnpjCheckDigit(base: string, weights: number[]): number {
    const sum = base
        .split('')
        .reduce((total, digit, index) => total + Number(digit) * weights[index], 0);
    const remainder = sum % 11;

    return remainder < 2 ? 0 : 11 - remainder;
}

export function isValidCnpj(value: string): boolean {
    if (!CNPJ_PATTERN.test(value)) {
        return false;
    }

    const digits = value.replace(/\D/g, '');

    if (/^(\d)\1{13}$/.test(digits)) {
        return false;
    }

    const firstCheckDigit = calculateCnpjCheckDigit(
        digits.slice(0, 12),
        [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
    );
    const secondCheckDigit = calculateCnpjCheckDigit(
        `${digits.slice(0, 12)}${firstCheckDigit}`,
        [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
    );

    return digits.endsWith(`${firstCheckDigit}${secondCheckDigit}`);
}

export function isValidEmail(value: string): boolean {
    return EMAIL_PATTERN.test(value);
}
