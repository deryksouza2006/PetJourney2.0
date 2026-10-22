export type SmartCarePriority = 'BAIXA' | 'MEDIA' | 'ALTA';

export interface SmartCareAnalysis {
    petId: number;
    score: number;
    prioridade: SmartCarePriority;
    motivos: string[];
    recomendacao: string;
}

export interface SmartCareRankingItem extends SmartCareAnalysis {
    petName: string;
}

export interface SmartCareInsufficientDataPet {
    petId: number;
    petName: string;
}

export interface SmartCareRankingResponse {
    analises: SmartCareRankingItem[];
    semDadosSuficientes: SmartCareInsufficientDataPet[];
}
