'use client';

/**
 * Lógica científica avançada para avaliação de Força Muscular Alpha Trainer.
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
    if (reps === 0) return 0;
    if (reps > 10) {
        return weight * (1 + reps / 30); // Epley
    }
    const rm = weight / (1.0278 - (0.0278 * reps));
    return Math.round(rm * 10) / 10;
}

/**
 * Prediz o 1RM dinâmico a partir de um pico isométrico (IMTP ou isolado).
 * Utiliza fatores de conversão baseados em correlação (Ex: Haff et al., 2005)
 */
export function predict1RMFromIsometric(peakKgf: number, exercise: string): number {
    const factors: Record<string, number> = {
        'imtp_squat': 1.15,
        'imtp_deadlift': 1.25,
        'squat': 1.1,
        'bench': 1.05,
        'row': 1.02
    };
    const factor = factors[exercise] || 1;
    return Math.round(peakKgf * factor * 10) / 10;
}

/**
 * Gera as zonas de treinamento dinâmico baseadas no 1RM.
 */
export function calculateTrainingZones(oneRM: number) {
    const percentages = [1, 0.95, 0.90, 0.85, 0.80, 0.75, 0.70, 0.65, 0.60];
    return percentages.map(p => ({
        percentage: (p * 100).toFixed(0),
        load: Math.round(oneRM * p)
    }));
}

/**
 * Calcula o Score Alpha Force (0-100).
 * Baseado na força relativa total ponderada por exercícios principais.
 */
export function calculateAlphaForceScore(dynamicTests: any[], isometricTests: any, bodyWeight: number): { score: number, classification: string, color: string } {
    if (!bodyWeight || bodyWeight <= 0) return { score: 0, classification: 'N/A', color: 'text-muted-foreground' };

    // Ponderação: Soma dos 1RMs / Peso Corporal
    let totalRelative = 0;
    
    // De testes dinâmicos
    dynamicTests.forEach(t => {
        totalRelative += (t.estimated1RM / bodyWeight);
    });

    // Score simples de 0 a 100 baseado no IFR (Ex: Atleta de Elite IFR > 5.0 no Big 3)
    const score = Math.min(100, Math.round((totalRelative / 5) * 100));

    let classification = 'Muito Baixo';
    let color = 'text-red-500';

    if (score > 80) { classification = 'Excelente'; color = 'text-cyan-500'; }
    else if (score > 60) { classification = 'Bom'; color = 'text-green-500'; }
    else if (score > 40) { classification = 'Médio'; color = 'text-yellow-500'; }
    else if (score > 20) { classification = 'Baixo'; color = 'text-orange-500'; }

    return { score, classification, color };
}

export function calculateRelativeStrength(total1RM: number, bodyWeight: number): number {
    if (!bodyWeight || bodyWeight <= 0) return 0;
    return Math.round((total1RM / bodyWeight) * 100) / 100;
}

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
