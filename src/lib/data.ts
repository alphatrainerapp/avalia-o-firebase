import { getPlaceholderImage } from './placeholder-images';

export type SkinfoldKeys = 'subscapular' | 'tricipital' | 'bicipital' | 'peitoral' | 'axilarMedia' | 'supraIliaca' | 'abdominal' | 'coxa' | 'panturrilha';

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
    }
};

export type Client = {
    id: string;
    name: string;
    email: string;
    avatarUrl: string;
    age: number;
    gender: 'Masculino' | 'Feminino';
    height: number;
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
    { id: 'cli_1', name: 'João da Silva', email: 'joao.silva@example.com', avatarUrl: getPlaceholderImage('client-john-doe-avatar')?.imageUrl || '', age: 34, gender: 'Masculino', height: 180 },
    { id: 'cli_2', name: 'Maria Oliveira', email: 'maria.oliveira@example.com', avatarUrl: getPlaceholderImage('client-jane-smith-avatar')?.imageUrl || '', age: 28, gender: 'Feminino', height: 165 },
    { id: 'cli_3', name: 'Pedro Santos', email: 'pedro.santos@example.com', avatarUrl: getPlaceholderImage('client-peter-jones-avatar')?.imageUrl || '', age: 45, gender: 'Masculino', height: 190 },
];

export const evaluations: Evaluation[] = [
    {
        id: 'eval_1',
        clientId: 'cli_1',
        clientName: 'João da Silva',
        date: '2024-09-25',
        protocol: 'Pollock 7 dobras',
        observations: 'Cliente focado em hipertrofia.',
        bodyMeasurements: {
            weight: 85,
            height: 180,
            waistCircumference: 90,
            hipCircumference: 100,
        },
        bodyComposition: {
            bodyFatPercentage: 22,
        },
        boneDiameters: {},
        bioimpedance: {
            scaleType: 'inbody',
            inbody: {
                totalBodyWeight: 85,
                skeletalMuscleMass: 35.2,
                bodyFatMass: 18.5,
                totalBodyWater: 50.1,
                fatFreeMass: 66.5,
                bmi: 26.2,
                bodyFatPercentage: 21.8,
                waistHipRatio: 0.9,
                basalMetabolicRate: 1800,
                rightArmLeanMass: 3.5,
                leftArmLeanMass: 3.4,
                trunkLeanMass: 28.1,
                rightLegLeanMass: 9.8,
                leftLegLeanMass: 9.7,
            }
        }
    },
    {
        id: 'eval_2',
        clientId: 'cli_1',
        clientName: 'João da Silva',
        date: '2024-10-25',
        protocol: 'Pollock 7 dobras',
        observations: 'Aumento da força notado.',
        bodyMeasurements: {
            weight: 82,
            height: 180,
            waistCircumference: 85,
            hipCircumference: 98,
        },
        bodyComposition: {
            bodyFatPercentage: 18,
        },
        boneDiameters: {},
        bioimpedance: {
            scaleType: 'inbody',
            inbody: {
                totalBodyWeight: 82,
                skeletalMuscleMass: 36.5,
                bodyFatMass: 14.8,
                totalBodyWater: 52.3,
                fatFreeMass: 67.2,
                bmi: 25.3,
                bodyFatPercentage: 18.0,
                waistHipRatio: 0.87,
                basalMetabolicRate: 1850,
                rightArmLeanMass: 3.7,
                leftArmLeanMass: 3.6,
                trunkLeanMass: 29.0,
                rightLegLeanMass: 10.1,
                leftLegLeanMass: 10.0,
            }
        }
    },
    {
        id: 'eval_3',
        clientId: 'cli_1',
        clientName: 'João da Silva',
        date: '2024-11-25',
        protocol: 'Pollock 7 dobras',
        observations: 'Melhora na resistência cardiovascular.',
        bodyMeasurements: {
            weight: 80,
            height: 180,
            waistCircumference: 82,
            hipCircumference: 96,
        },
        bodyComposition: {
            bodyFatPercentage: 15,
        },
        boneDiameters: {},
        bioimpedance: {
            scaleType: 'inbody'
        }
    },
    {
        id: 'eval_4',
        clientId: 'cli_2',
        clientName: 'Maria Oliveira',
        date: '2024-11-01',
        protocol: 'YMCA',
        observations: 'Iniciando programa de perda de peso.',
        bodyMeasurements: {
            weight: 65,
            height: 165,
            waistCircumference: 70,
            hipCircumference: 95,
        },
        bodyComposition: {
            bodyFatPercentage: 25,
        },
        boneDiameters: {},
        bioimpedance: {
            scaleType: 'omron',
            omron: {
                weight: 65,
                bmi: 23.9,
                bodyFatPercentage: 30.2,
                skeletalMusclePercentage: 28.5,
                visceralFatLevel: 5,
                basalMetabolicRate: 1400,
                metabolicAge: 30,
            }
        }
    },
    {
        id: 'eval_5',
        clientId: 'cli_3',
        clientName: 'Pedro Santos',
        date: '2024-11-15',
        protocol: 'Guedes',
        observations: 'Manutenção do condicionamento físico.',
        bodyMeasurements: {
            weight: 95,
            height: 190,
            waistCircumference: 100,
            hipCircumference: 105,
        },
        bodyComposition: {
            bodyFatPercentage: 25.0,
        },
        boneDiameters: {},
        bioimpedance: {
            scaleType: null
        }
    }
];

export type ProtocolMap = {
  [key: string]: string[];
};

export const audienceProtocols: ProtocolMap = {
  'Adultos Saudáveis': ['Pollock 3 dobras', 'Pollock 4 dobras', 'Pollock 7 dobras', 'Jackson & Pollock', 'Faulkner', 'Guedes', 'YMCA'],
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
};

export const perimetriaPoints = [
    { top: '23%', left: '48%', label: 'Ombro' },
    { top: '30%', left: '48%', label: 'Tórax' },
    { top: '40%', left: '48%', label: 'Cintura' },
    { top: '45%', left: '48%', label: 'Abdômen' },
    { top: '55%', left: '48%', label: 'Quadril' },
    { top: '33%', left: '35%', label: 'Braço E' },
    { top: '33%', left: '65%', label: 'Braço D' },
    { top: '40%', left: '32%', label: 'Antebraço E' },
    { top: '40%', left: '68%', label: 'Antebraço D' },
    { top: '65%', left: '42%', label: 'Coxa E' },
    { top: '65%', left: '58%', label: 'Coxa D' },
    { top: '80%', left: '40%', label: 'Panturrilha E' },
    { top: '80%', left: '60%', label: 'Panturrilha D' },
];

export const skinfoldPoints = [
    { top: '25%', left: '55%', label: 'Peitoral' },
    { top: '30%', left: '68%', label: 'Axilar Média' },
    { top: '28%', left: '30%', label: 'Subscapular' },
    { top: '33%', left: '70%', label: 'Tricipital' },
    { top: '33%', left: '30%', label: 'Bicipital' },
    { top: '42%', left: '68%', label: 'Supra-ilíaca' },
    { top: '45%', left: '55%', label: 'Abdominal' },
    { top: '60%', left: '58%', label: 'Coxa' },
    { top: '82%', left: '62%', label: 'Panturrilha' },
];

export const boneDiameterPoints = [
    { top: '45%', left: '28%', label: 'Punho (Biestiloidal)' },
    { top: '45%', left: '72%', label: 'Punho (Biestiloidal)' },
    { top: '70%', left: '40%', label: 'Joelho (Bicondilar do Fêmur)' },
    { top: '70%', left: '60%', label: 'Joelho (Bicondilar do Fêmur)' },
    { top: '35%', left: '30%', label: 'Cotovelo (Bicondilar do Úmero)' },
    { top: '35%', left: '70%', label: 'Cotovelo (Bicondilar do Úmero)' },
];
    
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
