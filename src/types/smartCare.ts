export type SmartCarePriority = 'BAIXA' | 'MEDIA' | 'ALTA';

export interface SmartCareAnalysis {
    petId: number;
    score: number;
    prioridade: SmartCarePriority;
    motivos: string[];
    recomendacao: string;
}
