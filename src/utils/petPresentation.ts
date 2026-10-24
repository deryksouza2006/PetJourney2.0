import { Pet, PetSex, PetSpecies } from '../types/pet';
import { isValidIsoDate } from './dateValidation';

export const PET_SPECIES_LABELS: Record<PetSpecies, string> = {
    CACHORRO: 'Cachorro',
    GATO: 'Gato',
    AVE: 'Ave',
    ROEDOR: 'Roedor',
    REPTIL: 'Réptil',
    OUTRO: 'Outro',
};

export const PET_SEX_LABELS: Record<PetSex, string> = {
    MACHO: 'Macho',
    FEMEA: 'Fêmea',
};

export function formatPetAge(birthDate: string | null, today = new Date()): string | null {
    if (!birthDate || !isValidIsoDate(birthDate)) {
        return null;
    }

    const [year, month, day] = birthDate.split('-').map(Number);
    let age = today.getFullYear() - year;
    const birthdayHasNotOccurred = today.getMonth() + 1 < month
        || (today.getMonth() + 1 === month && today.getDate() < day);

    if (birthdayHasNotOccurred) {
        age -= 1;
    }

    if (age < 0) {
        return null;
    }

    if (age === 0) {
        return 'menos de 1 ano';
    }

    return `${age} ${age === 1 ? 'ano' : 'anos'}`;
}

export function getPetSecondaryInformation(pet: Pet): string {
    const information = [
        pet.breed?.trim() || PET_SPECIES_LABELS[pet.species],
        formatPetAge(pet.birthDate),
        pet.sex ? PET_SEX_LABELS[pet.sex] : null,
    ].filter((value): value is string => Boolean(value));

    return information.join(' · ');
}
