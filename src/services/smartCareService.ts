import { SmartCareAnalysis, SmartCareRankingResponse } from '../types/smartCare';
import { api } from './api';

export async function getPetAnalysis(petId: number): Promise<SmartCareAnalysis> {
    const response = await api.get<SmartCareAnalysis>(
        `/smartcare/pets/${petId}/analysis`,
    );

    return response.data;
}

export async function getRanking(): Promise<SmartCareRankingResponse> {
    const response = await api.get<SmartCareRankingResponse>('/smartcare/ranking');

    return response.data;
}
