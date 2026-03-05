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

export const evaluations: Evaluation[] = []; // Inicia vazio conforme solicitado

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

    if (weight === 0) {
        return { fatMassKg: 0, leanMassKg: 0, muscleMassKg: 0, boneMassKg: 0, residualMassKg: 0, fatMassPercentage: 0, muscleMassPercentage: 0, boneMassPercentage: 0, residualMassPercentage: 0, idealWeight: 0, fatLossNeeded: 0 };
    }

    const fatMassKg = (weight * fatPercentage) / 100;
    const leanMassKg = weight - fatMassKg;

    // Bone Mass (Massa Óssea) - Von Dobeln (1964)
    let boneMassKg = 0;
    if (height > 0 && wristDiameter > 0 && femurDiameter > 0) {
        const heightInM = height / 100;
        const wristInM = wristDiameter / 100;
        const femurInM = femurDiameter / 100;
        boneMassKg = 3.02 * Math.pow(Math.pow(heightInM, 2) * wristInM * femurInM * 400, 0.712);
    }
    
    // Residual Mass (Massa Residual)
    const residualFactor = gender === 'Feminino' ? 0.21 : 0.24;
    const residualMassKg = weight * residualFactor;

    // Muscle Mass (Massa Muscular)
    const muscleMassKg = weight - fatMassKg - boneMassKg - residualMassKg;

    const fatMassPercentage = fatPercentage;
    const muscleMassPercentage = (muscleMassKg / weight) * 100;
    const boneMassPercentage = (boneMassKg / weight) * 100;
    const residualMassPercentage = (residualMassKg / weight) * 100;

    // Ideal Weight
    const idealLeanMassPercentage = gender === 'Masculino' ? 0.85 : 0.75;
    const idealWeight = leanMassKg / idealLeanMassPercentage;
    
    // Fat Loss Needed
    const fatLossNeeded = weight - idealWeight;
    
    return {
        fatMassKg: fatMassKg > 0 ? fatMassKg : 0,
        leanMassKg: leanMassKg > 0 ? leanMassKg : 0,
        muscleMassKg: muscleMassKg > 0 ? muscleMassKg : 0,
        boneMassKg: boneMassKg > 0 ? boneMassKg : 0,
        residualMassKg: residualMassKg > 0 ? residualMassKg : 0,
        fatMassPercentage,
        muscleMassPercentage,
        boneMassPercentage,
        residualMassPercentage,
        idealWeight,
        fatLossNeeded,
    };
}
