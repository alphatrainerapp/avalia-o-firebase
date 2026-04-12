'use client';
import { getPlaceholderImage } from './placeholder-images';

export type SkinfoldKeys = 'subscapular' | 'tricipital' | 'bicipital' | 'peitoral' | 'axilarMedia' | 'supraIliaca' | 'supraspinale' | 'abdominal' | 'coxa' | 'panturrilha';

export type BoneDiameterKeys = 'biestiloidal' | 'bicondilarFemur' | 'bicondilarUmero';

export type BioimpedanceScale = 'omron' | 'inbody' | null;

export type BioimpedanceOmron = {
    weight?: number;
    bmi?: number;
    bodyFatPercentage?: number;
    skeletalMusclePercentage?: number;
    visceralFatLevel?: number;
    basalMetabolicRate?: number;
    metabolicAge?: number;
    leanBodyMass?: number;
    bodyFatMass?: number;
};

export type BioimpedanceInBody = {
    totalBodyWeight?: number;
    skeletalMuscleMass?: number;
    bodyFatMass?: number;
    totalBodyWater?: number;
    bodyProtein?: number;
    bodyMinerals?: number;
    fatFreeMass?: number;
    rightArmLeanMass?: number;
    leftArmLeanMass?: number;
    rightLegLeanMass?: number;
    leftLegLeanMass?: number;
    trunkLeanMass?: number;
    trunkFat?: number;
    rightArmFat?: number;
    leftArmFat?: number;
    rightLegFat?: number;
    leftLegFat?: number;
    waistHipRatio?: number;
    bmi?: number;
    bodyFatPercentage?: number;
    visceralFatArea?: number;
    basalMetabolicRate?: number;
};

export type VO2MaxData = {
    protocol?: string;
    vo2?: number;
    vAM?: number;
    classification?: string;
    hrMax?: number;
    hrRest?: number;
    bloodPressureSystolic?: number;
    bloodPressureDiastolic?: number;
    distance?: number;
    totalTimeSeconds?: number;
    recoveryHR?: number;
    stages?: any[];
    zoneConfig?: any[]; // Armazena a configuração de zonas customizada
};


export type Evaluation = {
    id: string;
    clientId: string;
    clientName: string;
    date: string; // YYYY-MM-DD
    protocol: string;
    observations?: string;
    bodyMeasurements: {
        weight: number;
        height: number;
        waistCircumference: number;
        hipCircumference: number;
    };
    bodyComposition: {
        bodyFatPercentage: number;
    };
    perimetria?: {
        [key: string]: number | undefined;
        ombro?: number;
        torax?: number;
        cintura?: number;
        abdomen?: number;
        quadril?: number;
        bracoDRelaxado?: number;
        bracoDContraido?: number;
        bracoERelaxado?: number;
        bracoEContraido?: number;
        antebracoD?: number;
        antebracoE?: number;
        coxaProximalD?: number;
        coxaProximalE?: number;
        coxaMedialD?: number;
        coxaMedialE?: number;
        panturrilhaD?: number;
        panturrilhaE?: number;
    };
    skinFolds?: {
        [key in SkinfoldKeys]?: number;
    };
    boneDiameters?: {
        [key in BoneDiameterKeys]?: number;
    };
    bioimpedance: {
      scaleType: BioimpedanceScale;
      omron?: BioimpedanceOmron;
      inbody?: BioimpedanceInBody;
    };
    posturalPhotos?: { [key: string]: string | undefined };
    posturalDeviations?: { [key: string]: string[] };
    vo2MaxData?: VO2MaxData;
};

export type Client = {
    id: string;
    name: string;
    email: string;
    avatarUrl: string;
    age: number;
    gender: 'Masculino' | 'Feminino';
    height: number;
    bodyMeasurements?: {
        weight: number;
    };
};

export type BodyComposition = {
    fatMassKg: number;
    leanMassKg: number;
    muscleMassKg: number;
    boneMassKg: number;
    residualMassKg: number;
    fatMassPercentage: number;
    muscleMassPercentage: number;
    boneMassPercentage: number;
    residualMassPercentage: number;
    idealWeight: number;
    fatLossNeeded: number;
};

export const clients: Client[] = [
    { id: 'cli_1', name: 'João da Silva', email: 'joao.silva@example.com', avatarUrl: getPlaceholderImage('client-john-doe-avatar')?.imageUrl || '', age: 34, gender: 'Masculino', height: 180, bodyMeasurements: { weight: 85 } },
    { id: 'cli_2', name: 'Maria Oliveira', email: 'maria.oliveira@example.com', avatarUrl: getPlaceholderImage('client-jane-smith-avatar')?.imageUrl || '', age: 28, gender: 'Feminino', height: 165, bodyMeasurements: { weight: 65 } },
    { id: 'cli_3', name: 'Pedro Santos', email: 'pedro.santos@example.com', avatarUrl: getPlaceholderImage('client-peter-jones-avatar')?.imageUrl || '', age: 45, gender: 'Masculino', height: 190, bodyMeasurements: { weight: 95 } },
];

export const evaluations: Evaluation[] = [
    {
        id: 'eval_maria_1',
        clientId: 'cli_2',
        clientName: 'Maria Oliveira',
        date: '2023-11-10',
        protocol: 'Pollock 3 dobras',
        bodyMeasurements: { weight: 72.5, height: 165, waistCircumference: 84, hipCircumference: 105 },
        bodyComposition: { bodyFatPercentage: 32.4 },
        perimetria: { ombro: 102, torax: 94, cintura: 84, abdomen: 92, quadril: 105, bracoDRelaxado: 31, bracoERelaxado: 30.5, coxaMedialD: 58, coxaMedialE: 57.5 },
        skinFolds: { tricipital: 18, supraIliaca: 22, coxa: 28 },
        bioimpedance: { scaleType: null },
        posturalPhotos: {
            front: 'https://picsum.photos/seed/maria1front/600/800',
            back: 'https://picsum.photos/seed/maria1back/600/800',
            right: 'https://picsum.photos/seed/maria1right/600/800',
            left: 'https://picsum.photos/seed/maria1left/600/800'
        },
        posturalDeviations: {
            anterior: ['Cabeça inclinada', 'Ombro elevado'],
            posterior: ['Escápula alada D'],
            lateral_direita: ['Cabeça projetada', 'Hipercifose torácica'],
            lateral_esquerda: ['Cabeça projetada']
        },
        vo2MaxData: {
            protocol: 'cooper',
            vo2: 38.5,
            vAM: 11.2,
            classification: 'Médio',
            hrMax: 188,
            hrRest: 62,
            bloodPressureSystolic: 120,
            bloodPressureDiastolic: 80,
            distance: 2200
        },
        observations: 'Avaliação inicial. Foco em redução de gordura corporal e correção de postura cervical.'
    },
    {
        id: 'eval_maria_2',
        clientId: 'cli_2',
        clientName: 'Maria Oliveira',
        date: '2024-01-15',
        protocol: 'Pollock 3 dobras',
        bodyMeasurements: { weight: 68.2, height: 165, waistCircumference: 79, hipCircumference: 101 },
        bodyComposition: { bodyFatPercentage: 28.1 },
        perimetria: { ombro: 100, torax: 92, cintura: 79, abdomen: 88, quadril: 101, bracoDRelaxado: 29.5, bracoERelaxado: 29.5, coxaMedialD: 56, coxaMedialE: 56 },
        skinFolds: { tricipital: 15, supraIliaca: 18, coxa: 24 },
        bioimpedance: { scaleType: null },
        posturalPhotos: {
            front: 'https://picsum.photos/seed/maria2front/600/800',
            back: 'https://picsum.photos/seed/maria2back/600/800',
            right: 'https://picsum.photos/seed/maria2right/600/800',
            left: 'https://picsum.photos/seed/maria2left/600/800'
        },
        posturalDeviations: {
            anterior: ['Ombro elevado'],
            posterior: ['Escápula alada D'],
            lateral_direita: ['Cabeça projetada'],
            lateral_esquerda: ['Cabeça projetada']
        },
        vo2MaxData: {
            protocol: 'cooper',
            vo2: 42.1,
            vAM: 12.5,
            classification: 'Médio',
            hrMax: 190,
            hrRest: 60,
            bloodPressureSystolic: 118,
            bloodPressureDiastolic: 78,
            distance: 2400
        },
        observations: 'Ótima evolução. Redução significativa de medidas na cintura e melhora na inclinação da cabeça.'
    },
    {
        id: 'eval_maria_3',
        clientId: 'cli_2',
        clientName: 'Maria Oliveira',
        date: '2024-03-20',
        protocol: 'Pollock 3 dobras',
        bodyMeasurements: { weight: 65.0, height: 165, waistCircumference: 74, hipCircumference: 98 },
        bodyComposition: { bodyFatPercentage: 24.2 },
        perimetria: { ombro: 98, torax: 90, cintura: 74, abdomen: 82, quadril: 98, bracoDRelaxado: 28, bracoERelaxado: 28, coxaMedialD: 54, coxaMedialE: 54 },
        skinFolds: { tricipital: 12, supraIliaca: 14, coxa: 20 },
        bioimpedance: { scaleType: null },
        posturalPhotos: {
            front: 'https://picsum.photos/seed/maria3front/600/800',
            back: 'https://picsum.photos/seed/maria3back/600/800',
            right: 'https://picsum.photos/seed/maria3right/600/800',
            left: 'https://picsum.photos/seed/maria3left/600/800'
        },
        posturalDeviations: {
            anterior: [],
            posterior: [],
            lateral_direita: ['Cabeça projetada'],
            lateral_esquerda: []
        },
        vo2MaxData: {
            protocol: 'cooper',
            vo2: 46.8,
            vAM: 13.8,
            classification: 'Bom',
            hrMax: 192,
            hrRest: 58,
            bloodPressureSystolic: 115,
            bloodPressureDiastolic: 75,
            distance: 2650
        },
        observations: 'Meta de peso atingida. Postura muito mais alinhada, restando apenas leve projeção cervical.'
    }
];

export type ProtocolMap = {
  [key: string]: string[];
};

export const audienceProtocols: ProtocolMap = {
  'Adultos Saudáveis': ['Pollock 3 dobras', 'Pollock 4 dobras', 'Pollock 7 dobras', 'Jackson & Pollock', 'Faulkner', 'Guedes', 'YMCA', 'ISAK'],
  'Crianças e Adolescentes': ['Slaughter-Lohman', 'Guedes'],
  'Idosos': ['Pollock 4 dobras', 'Durnin & Womersley'],
  'Obesos': ['Pollock 3 dobras', 'Faulkner', 'YMCA', 'Guedes'],
};

export const protocolSkinfolds: { [key: string]: SkinfoldKeys[] } = {
    'Pollock 7 dobras': ['peitoral', 'axilarMedia', 'subscapular', 'tricipital', 'supraIliaca', 'abdominal', 'coxa'],
    'Pollock 4 dobras': ['tricipital', 'supraIliaca', 'coxa', 'abdominal'],
    'Pollock 3 dobras (M)': ['peitoral', 'abdominal', 'coxa'],
    'Pollock 3 dobras (F)': ['tricipital', 'supraIliaca', 'coxa'],
    'Jackson & Pollock': ['tricipital', 'supraIliaca', 'abdominal', 'coxa'],
    'Faulkner': ['tricipital', 'subscapular', 'supraIliaca', 'abdominal'],
    'Guedes': ['tricipital', 'supraIliaca', 'abdominal'],
    'YMCA': ['abdominal'],
    'Slaughter-Lohman': ['tricipital', 'panturrilha'],
    'Durnin & Womersley': ['bicipital', 'tricipital', 'subscapular', 'supraIliaca'],
    'ISAK': ['tricipital', 'subscapular', 'bicipital', 'supraIliaca', 'supraspinale', 'abdominal', 'coxa', 'panturrilha'],
};
    
export function calculateBodyComposition(evaluation: Evaluation, client: Client): BodyComposition {
    const weight = evaluation.bodyMeasurements?.weight || 0;
    const height = evaluation.bodyMeasurements?.height || 0; // in cm
    const gender = client.gender;
    const fatPercentage = evaluation.bodyComposition?.bodyFatPercentage || 0;
    
    const wristDiameter = evaluation.boneDiameters?.biestiloidal || 0; // cm
    const femurDiameter = evaluation.boneDiameters?.bicondilarFemur || 0; // cm
    const humerusDiameter = evaluation.boneDiameters?.bicondilarUmero || 0; // cm

    if (weight === 0) {
        return { fatMassKg: 0, leanMassKg: 0, muscleMassKg: 0, boneMassKg: 0, residualMassKg: 0, fatMassPercentage: 0, muscleMassPercentage: 0, boneMassPercentage: 0, residualMassPercentage: 0, idealWeight: 0, fatLossNeeded: 0 };
    }

    const fatMassKg = (weight * fatPercentage) / 100;
    const leanMassKg = weight - fatMassKg;

    // Bone Mass (Massa Óssea) - Rocha (1975) adaptado de Von Dobeln
    // Utiliza diâmetros de Punho, Fêmur e Úmero para maior precisão
    let boneMassKg = 0;
    if (height > 0 && wristDiameter > 0 && femurDiameter > 0) {
        const heightInM = height / 100;
        const wristInM = wristDiameter / 100;
        const femurInM = femurDiameter / 100;
        const humerusInM = humerusDiameter > 0 ? humerusDiameter / 100 : wristInM; // Fallback se úmero não preenchido
        
        // Fórmula de Von Dobeln modificada por Rocha
        boneMassKg = 3.02 * Math.pow(Math.pow(heightInM, 2) * wristInM * femurInM * 400, 0.712);
        
        // Ajuste leve se tivermos o úmero para média de membros superiores
        if (humerusDiameter > 0) {
            const boneMassWithHumerus = 3.02 * Math.pow(Math.pow(heightInM, 2) * humerusInM * femurInM * 400, 0.712);
            boneMassKg = (boneMassKg + boneMassWithHumerus) / 2;
        }
    }
    
    // Residual Mass (Massa Residual) - Würch (1974)
    const residualFactor = gender === 'Feminino' ? 0.21 : 0.24;
    const residualMassKg = weight * residualFactor;

    // Muscle Mass (Massa Muscular) - Estratégia de 4 componentes
    const muscleMassKg = weight - fatMassKg - boneMassKg - residualMassKg;

    const fatMassPercentage = fatPercentage;
    const muscleMassPercentage = weight > 0 ? (muscleMassKg / weight) * 100 : 0;
    const boneMassPercentage = weight > 0 ? (boneMassKg / weight) * 100 : 0;
    const residualMassPercentage = weight > 0 ? (residualMassKg / weight) * 100 : 0;

    // Ideal Weight (Considerando gordura desejável: Homens 15%, Mulheres 25%)
    const idealLeanMassPercentage = gender === 'Masculino' ? 0.85 : 0.75;
    const idealWeight = leanMassKg / idealLeanMassPercentage;
    
    // Fat Loss Needed
    const fatLossNeeded = Math.max(0, weight - idealWeight);
    
    return {
        fatMassKg: Math.max(0, fatMassKg),
        leanMassKg: Math.max(0, leanMassKg),
        muscleMassKg: Math.max(0, muscleMassKg),
        boneMassKg: Math.max(0, boneMassKg),
        residualMassKg: Math.max(0, residualMassKg),
        fatMassPercentage: Math.max(0, fatMassPercentage),
        muscleMassPercentage: Math.max(0, muscleMassPercentage),
        boneMassPercentage: Math.max(0, boneMassPercentage),
        residualMassPercentage: Math.max(0, residualMassPercentage),
        idealWeight: Math.max(0, idealWeight),
        fatLossNeeded: Math.max(0, fatLossNeeded),
    };
}
