import { PaginatedResponse } from './pagination';

export type PetSpecies =
    | 'CACHORRO'
    | 'GATO'
    | 'AVE'
    | 'ROEDOR'
    | 'REPTIL'
    | 'OUTRO';

export type PetSex = 'MACHO' | 'FEMEA';

export interface Pet {
    id: number;
    name: string;
    species: PetSpecies;
    breed: string | null;
    sex: PetSex | null;
    birthDate: string | null;
    weight: number | null;
    tutorId: number | null;
    tutorName: string | null;
}

export interface PetRequest {
    name: string;
    species: PetSpecies;
    breed?: string;
    sex?: PetSex;
    birthDate?: string;
    weight?: number;
    tutorId: number;
}

export type PetPage = PaginatedResponse<Pet>;
