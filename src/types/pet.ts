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

interface PageSort {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
}

interface PageDetails {
    pageNumber: number;
    pageSize: number;
    sort: PageSort;
    offset: number;
    paged: boolean;
    unpaged: boolean;
}

export interface PetPage {
    content: Pet[];
    pageable: PageDetails;
    totalPages: number;
    totalElements: number;
    last: boolean;
    size: number;
    number: number;
    sort: PageSort;
    numberOfElements: number;
    first: boolean;
    empty: boolean;
}
