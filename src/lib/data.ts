import { getPlaceholderImage } from './placeholder-images';

export type Evaluation = {
    id: string;
    clientId: string;
    clientName: string;
    date: string; // YYYY-MM-DD
    protocol: string;
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
};

export type Client = {
    id: string;
    name: string;
    email: string;
    avatarUrl: string;
};

export const clients: Client[] = [
    { id: 'cli_1', name: 'John Doe', email: 'john.doe@example.com', avatarUrl: getPlaceholderImage('client-john-doe-avatar')?.imageUrl || '' },
    { id: 'cli_2', name: 'Jane Smith', email: 'jane.smith@example.com', avatarUrl: getPlaceholderImage('client-jane-smith-avatar')?.imageUrl || '' },
    { id: 'cli_3', name: 'Peter Jones', email: 'peter.jones@example.com', avatarUrl: getPlaceholderImage('client-peter-jones-avatar')?.imageUrl || '' },
];

export const evaluations: Evaluation[] = [
    {
        id: 'eval_1',
        clientId: 'cli_1',
        clientName: 'John Doe',
        date: '2024-03-15',
        protocol: 'Pollock 7',
        bodyMeasurements: {
            weight: 85,
            height: 180,
            waistCircumference: 90,
            hipCircumference: 100,
        },
        bodyComposition: {
            bodyFatPercentage: 18.5,
            muscleMass: 65,
            boneDensity: 1.2,
        },
    },
    {
        id: 'eval_2',
        clientId: 'cli_1',
        clientName: 'John Doe',
        date: '2024-06-20',
        protocol: 'Pollock 7',
        bodyMeasurements: {
            weight: 82,
            height: 180,
            waistCircumference: 85,
            hipCircumference: 98,
        },
        bodyComposition: {
            bodyFatPercentage: 16.2,
            muscleMass: 66,
            boneDensity: 1.21,
        },
    },
    {
        id: 'eval_3',
        clientId: 'cli_2',
        clientName: 'Jane Smith',
        date: '2024-05-01',
        protocol: 'YMCA',
        bodyMeasurements: {
            weight: 65,
            height: 165,
            waistCircumference: 70,
            hipCircumference: 95,
        },
        bodyComposition: {
            bodyFatPercentage: 22.1,
            muscleMass: 48,
            boneDensity: 1.1,
        },
    },
    {
        id: 'eval_4',
        clientId: 'cli_3',
        clientName: 'Peter Jones',
        date: '2024-07-01',
        protocol: 'Guedes',
        bodyMeasurements: {
            weight: 95,
            height: 190,
            waistCircumference: 100,
            hipCircumference: 105,
        },
        bodyComposition: {
            bodyFatPercentage: 25.0,
            muscleMass: 70,
            boneDensity: 1.3,
        },
    }
];

export const protocols = [
    'Pollock 3',
    'Pollock 4',
    'Pollock 7',
    'Guedes',
    'Faulkner',
    'Jackson & Pollock',
    'YMCA',
    'Public Service Exam',
];
