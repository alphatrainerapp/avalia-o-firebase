'use client';

/**
 * Lógica científica para avaliação de Força Muscular.
 */

export interface StrengthClassification {
    label: string;
    color: string;
}

/**
 * Calcula o 1RM estimado usando a fórmula de Brzycki.
 * Fórmula: Carga / (1.0278 - (0.0278 * Reps))
 */
export function calculate1RM(weight: number, reps: number): number {
    if (reps === 1) return weight;
    if (reps > 10) {
        // Para mais de 10 reps, a fórmula de Epley tende a ser mais precisa.
        return weight * (1 + reps / 30);
    }
    const rm = weight / (1.0278 - (0.0278 * reps));
    return Math.round(rm * 10) / 10;
}

/**
 * Calcula o Índice de Força Relativa (IFR).
 * Fórmula: 1RM Total / Peso Corporal
 */
export function calculateRelativeStrength(total1RM: number, bodyWeight: number): number {
    if (!bodyWeight || bodyWeight <= 0) return 0;
    return Math.round((total1RM / bodyWeight) * 100) / 100;
}

/**
 * Classifica a força relativa baseada em tabelas normativas simplificadas.
 */
export function getStrengthClassification(ifr: number, gender: 'Masculino' | 'Feminino'): StrengthClassification {
    if (ifr === 0) return { label: 'N/A', color: 'text-muted-foreground' };

    if (gender === 'Masculino') {
        if (ifr < 1.0) return { label: 'Baixa', color: 'text-red-500' };
        if (ifr < 1.5) return { label: 'Média', color: 'text-yellow-500' };
        if (ifr < 2.0) return { label: 'Boa', color: 'text-green-400' };
        if (ifr < 2.5) return { label: 'Excelente', color: 'text-green-500' };
        return { label: 'Elite', color: 'text-cyan-500' };
    } else {
        if (ifr < 0.6) return { label: 'Baixa', color: 'text-red-500' };
        if (ifr < 1.0) return { label: 'Média', color: 'text-yellow-500' };
        if (ifr < 1.3) return { label: 'Boa', color: 'text-green-400' };
        if (ifr < 1.6) return { label: 'Excelente', color: 'text-green-500' };
        return { label: 'Elite', color: 'text-cyan-500' };
    }
}
