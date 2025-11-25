'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Evaluation, Client } from '@/lib/data';

type ComparisonChartsProps = {
    evaluations: Evaluation[];
    client: Client;
};

// Helper function to calculate component masses for an evaluation
const calculateMasses = (evaluation: Evaluation, client: Client) => {
    const { bodyMeasurements, bodyComposition, boneDiameters } = evaluation;
    const weight = bodyMeasurements.weight;
    const fatPercentage = bodyComposition.bodyFatPercentage;
    
    const fatMassKg = (weight && fatPercentage) ? (weight * fatPercentage) / 100 : 0;
    
    const leanMassKg = weight - fatMassKg;

    const height = bodyMeasurements?.height; // cm
    const wrist = boneDiameters?.biestiloidal; // cm
    const femur = boneDiameters?.bicondilarFemur; // cm
    
    let boneMass = 0;
    if (height && wrist && femur) {
        const heightInM = height / 100;
        const wristInM = wrist / 100;
        const femurInM = femur / 100;
        boneMass = Math.pow(3.02 * (Math.pow(heightInM, 2) * wristInM * femurInM * 400), 0.712);
    }

    const residualFactor = client.gender === 'Feminino' ? 0.21 : 0.24;
    const residualMass = weight * residualFactor;
    
    const muscleMass = leanMassKg - boneMass - residualMass;

    return {
        fatMass: fatMassKg,
        muscleMass: muscleMass > 0 ? muscleMass : 0,
        residualMass: residualMass,
    };
};


export default function ComparisonCharts({ evaluations, client }: ComparisonChartsProps) {
    const chartData = evaluations.map(ev => {
        const masses = calculateMasses(ev, client);
        return {
            date: new Date(ev.date).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric', timeZone: 'UTC' }),
            'Massa Gorda (kg)': parseFloat(masses.fatMass.toFixed(1)),
            'Massa Muscular (kg)': parseFloat(masses.muscleMass.toFixed(1)),
            'Massa Residual (kg)': parseFloat(masses.residualMass.toFixed(1)),
        };
    });

    const renderChart = (title: string, dataKey: string, color: string) => (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div style={{ width: '100%', height: 200 }}>
                    <ResponsiveContainer>
                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                            <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--background))',
                                    borderColor: 'hsl(var(--border))',
                                    color: 'hsl(var(--foreground))'
                                }}
                            />
                            <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {renderChart('Massa Gorda', 'Massa Gorda (kg)', 'hsl(var(--chart-2))')}
            {renderChart('Massa Muscular', 'Massa Muscular (kg)', 'hsl(var(--chart-1))')}
            {renderChart('Massa Residual', 'Massa Residual (kg)', 'hsl(var(--chart-3))')}
        </div>
    );
}
