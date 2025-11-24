import { getPlaceholderImage } from './placeholder-images';

export type SkinfoldKeys = 'subscapular' | 'tricipital' | 'bicipital' | 'peitoral' | 'axilarMedia' | 'supraIliaca' | 'abdominal' | 'coxa' | 'panturrilha';

export type BoneDiameterKeys = 'biestiloidal' | 'bicondilarFemur' | 'bicondilarUmero';


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
        muscleMass: number;
        boneDensity: number;
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
            muscleMass: 65,
            boneDensity: 1.2,
        },
        boneDiameters: {}
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
            muscleMass: 68,
            boneDensity: 1.21,
        },
        boneDiameters: {}
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
            muscleMass: 70,
            boneDensity: 1.22,
        },
        boneDiameters: {}
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
            muscleMass: 48,
            boneDensity: 1.1,
        },
        boneDiameters: {}
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
            muscleMass: 37.8,
            boneDensity: 1.3,
        },
        boneDiameters: {}
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

    