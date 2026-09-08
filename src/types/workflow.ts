import { Pet, PetRequest } from './pet';
import { Tutor, TutorRequest } from './tutor';

export interface RegisterTutorWithPetRequest {
    tutor: TutorRequest;
    pet: Omit<PetRequest, 'tutorId'>;
}

export interface RegisterTutorWithPetResponse {
    tutor: Tutor;
    pet: Pet;
    firstAccessCode: string | null;
}
